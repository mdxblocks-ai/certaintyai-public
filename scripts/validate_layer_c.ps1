# =============================================================================
# Layer C end-to-end validation — Gemini multimodal PDF ingest
# -----------------------------------------------------------------------------
# What this script proves (or disproves) in one run:
#   STEP 1  POST /api/agents/extract-text with a real PDF
#           - returns text, raw_b64, mime, multimodal_eligible
#   STEP 2  POST /api/agents/{id}/run with the b64+mime payload
#           - the agent loop pipes bytes to Vertex Gemini multimodal
#           - the response references concrete content from the PDF
#                 (NOT "I cannot read uploaded files")
#
# Prereqs (PowerShell on the dev box):
#   1. Backend running:    cd backend; .venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000
#   2. Frontend running:   cd frontend; npm run dev          (only needed if you want to sign in via UI)
#   3. A real PDF on disk. Pass its path as the first argument.
#   4. A valid bearer token. The script will sign you in if you pass -Email / -Password,
#      otherwise pass an existing token via -Token.
#
# Usage:
#   .\scripts\validate_layer_c.ps1 -Pdf "C:\path\to\northwind.pdf" `
#                                  -Email "krishna.b@mdxblocks.com" `
#                                  -Password "*****" `
#                                  -AgentId 1
#
#   OR with an existing token:
#   .\scripts\validate_layer_c.ps1 -Pdf "C:\path\to\northwind.pdf" `
#                                  -Token "eyJhbGc..." `
#                                  -AgentId 1
#
# Output:
#   - Step-by-step PASS/FAIL with diagnostics
#   - Raw JSON responses dumped to .\scripts\out\layer_c_run_<timestamp>\
#   - Screenshot reminder at the end — capture the PowerShell window + the
#     dumped JSON for the validation evidence pack.
# =============================================================================

param(
  [Parameter(Mandatory = $true)]
  [string]$Pdf,

  [string]$Email,
  [string]$Password,
  [string]$Token,

  [Parameter(Mandatory = $true)]
  [int]$AgentId,

  [string]$ApiBase = "http://localhost:8000",
  [string]$Question = "Summarize the document. Cite at least three specific facts (names, dates, or amounts) drawn directly from the file."
)

$ErrorActionPreference = "Stop"
$ts  = Get-Date -Format "yyyyMMdd_HHmmss"
$outDir = Join-Path $PSScriptRoot "out\layer_c_run_$ts"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

function Write-Section($title) {
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Cyan
  Write-Host $title -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}
function Write-Pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "  [INFO] $msg" -ForegroundColor Gray }

# ---------------------------------------------------------------------------
# 0. Sanity
# ---------------------------------------------------------------------------
Write-Section "STEP 0 - Sanity checks"

if (-not (Test-Path $Pdf)) {
  Write-Fail "PDF not found at: $Pdf"
  exit 2
}
$pdfBytes = (Get-Item $Pdf).Length
Write-Info "PDF: $Pdf"
Write-Info "Size: $pdfBytes bytes"

if (-not $Token -and (-not $Email -or -not $Password)) {
  Write-Fail "Provide either -Token, or both -Email and -Password."
  exit 2
}

try {
  $health = Invoke-RestMethod -Uri "$ApiBase/api/health" -Method Get -TimeoutSec 5
  Write-Pass "Backend reachable at $ApiBase (health: $($health | ConvertTo-Json -Compress))"
} catch {
  # Some installs do not expose /api/health. Fall back to root.
  try {
    Invoke-WebRequest -Uri "$ApiBase/" -Method Get -TimeoutSec 5 | Out-Null
    Write-Pass "Backend reachable at $ApiBase (no /api/health endpoint, root responded)"
  } catch {
    Write-Fail "Backend not reachable at $ApiBase. Start it with 'uvicorn app.main:app --reload --port 8000'."
    exit 3
  }
}

# ---------------------------------------------------------------------------
# 1. Auth
# ---------------------------------------------------------------------------
Write-Section "STEP 1 - Acquire bearer token"
if (-not $Token) {
  $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
  try {
    $loginResp = Invoke-RestMethod `
      -Uri "$ApiBase/api/auth/login" `
      -Method Post `
      -Body $loginBody `
      -ContentType "application/json"
    $Token = $loginResp.access_token
    Write-Pass "Logged in as $Email"
  } catch {
    Write-Fail "Login failed: $($_.Exception.Message)"
    exit 4
  }
} else {
  Write-Info "Using provided token"
}
$authHeader = @{ Authorization = "Bearer $Token" }

# ---------------------------------------------------------------------------
# 2. POST /api/agents/extract-text
# ---------------------------------------------------------------------------
Write-Section "STEP 2 - POST /api/agents/extract-text"

# Build multipart body using curl.exe (Windows 10+ ships curl).
# Invoke-WebRequest in 5.1 mangles binary multipart; curl.exe is more reliable.
$extractRaw = & curl.exe -sS -X POST "$ApiBase/api/agents/extract-text" `
  -H "Authorization: Bearer $Token" `
  -F "file=@$Pdf;type=application/pdf"

$extractRaw | Out-File -FilePath (Join-Path $outDir "01_extract_response.json") -Encoding utf8
$extract = $null
try { $extract = $extractRaw | ConvertFrom-Json } catch {
  Write-Fail "Extract response was not JSON. Raw:"
  Write-Host $extractRaw
  exit 5
}

Write-Info ("filename:             {0}" -f $extract.filename)
Write-Info ("format:               {0}" -f $extract.format)
Write-Info ("chars (extracted):    {0}" -f $extract.chars)
Write-Info ("mime:                 {0}" -f $extract.mime)
Write-Info ("multimodal_eligible:  {0}" -f $extract.multimodal_eligible)
Write-Info ("raw_b64 length:       {0}" -f ($(if ($extract.raw_b64) { $extract.raw_b64.Length } else { 0 })))

# Decide the validation arm: text-rich PDF, or scanned/image PDF requiring multimodal.
$textRich = ($extract.chars -ge 50)
if ($textRich) {
  Write-Pass "PDF is text-rich (chars >= 50). Layer C bytes path will be skipped intentionally."
  Write-Info "To exercise Layer C bytes path, use a scanned/image PDF."
} else {
  if ($extract.multimodal_eligible -and $extract.raw_b64) {
    Write-Pass "PDF text < 50 chars AND raw_b64 + multimodal_eligible=true. Layer C bytes will ship to Gemini."
  } else {
    Write-Fail "PDF text < 50 chars but raw_b64 / multimodal_eligible missing. Layer C did NOT engage."
    Write-Info "Check backend log for '[upload.extract]' lines."
    exit 6
  }
}

# ---------------------------------------------------------------------------
# 3. POST /api/agents/{id}/run
# ---------------------------------------------------------------------------
Write-Section "STEP 3 - POST /api/agents/$AgentId/run"

$runBody = @{
  input                = $Question
  history              = @()
  attached_doc_ref     = $extract.filename
  attached_doc_content = $extract.text
  attached_doc_b64     = $extract.raw_b64
  attached_doc_mime    = $extract.mime
  previous_follow_ups  = @()
} | ConvertTo-Json -Depth 6 -Compress

# Save sanitized payload (strip b64 to keep file small)
$payloadView = ($runBody | ConvertFrom-Json)
if ($payloadView.attached_doc_b64) {
  $payloadView.attached_doc_b64 = "<{0} chars elided>" -f $payloadView.attached_doc_b64.Length
}
$payloadView | ConvertTo-Json -Depth 6 | Out-File (Join-Path $outDir "02_run_payload.json") -Encoding utf8

try {
  $runResp = Invoke-RestMethod `
    -Uri "$ApiBase/api/agents/$AgentId/run" `
    -Method Post `
    -Headers $authHeader `
    -Body $runBody `
    -ContentType "application/json" `
    -TimeoutSec 120
} catch {
  Write-Fail "Run request failed: $($_.Exception.Message)"
  if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
  exit 7
}

$runResp | ConvertTo-Json -Depth 8 | Out-File (Join-Path $outDir "03_run_response.json") -Encoding utf8

Write-Info ("Status:    {0}" -f $runResp.status)
Write-Info ("Outcome:   first 400 chars below")
Write-Host  ($runResp.outcome.Substring(0, [Math]::Min(400, $runResp.outcome.Length)))

# ---------------------------------------------------------------------------
# 4. Pass/Fail rubric
# ---------------------------------------------------------------------------
Write-Section "STEP 4 - Validation rubric"

$denialPatterns = @(
  "cannot directly read uploaded files",
  "I cannot read",
  "I'm unable to read",
  "no access to the file",
  "no document was attached"
)

$flagged = $false
foreach ($p in $denialPatterns) {
  if ($runResp.outcome -match [regex]::Escape($p)) {
    Write-Fail "Outcome contains denial phrase: '$p'"
    $flagged = $true
  }
}
if (-not $flagged) { Write-Pass "No 'I cannot read the file' denial detected in outcome." }

# Look for citation evidence: any 4+ digit number, dollar sign, or "Northwind"
$hasNumbers = ($runResp.outcome -match "\$[\d,]+|\b\d{4,}\b|Northwind|Order|Customer")
if ($hasNumbers) { Write-Pass "Outcome appears to cite document content (numbers / proper nouns detected)." }
else             { Write-Fail "Outcome did not cite numeric or proper-noun content from the PDF — manual review needed." }

# Steps trace
if ($runResp.steps -and $runResp.steps.Count -gt 0) {
  Write-Pass ("Run trace captured: {0} step(s)" -f $runResp.steps.Count)
} else {
  Write-Fail "Run trace is empty."
}

# ---------------------------------------------------------------------------
# 5. Diagnostics + screenshot reminder
# ---------------------------------------------------------------------------
Write-Section "STEP 5 - Evidence"
Write-Info "Artifacts saved to: $outDir"
Get-ChildItem $outDir | ForEach-Object { Write-Host ("    " + $_.Name) -ForegroundColor Gray }

Write-Host ""
Write-Host "SCREENSHOT CHECKLIST" -ForegroundColor Yellow
Write-Host "  1. This PowerShell window (the PASS/FAIL summary above)"
Write-Host "  2. Backend uvicorn log lines containing [upload.extract] and [agent.run]"
Write-Host "  3. .\scripts\out\layer_c_run_$ts\03_run_response.json"
Write-Host ""
Write-Host "Validation script complete." -ForegroundColor Cyan
