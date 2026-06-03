# CertaintyAI — Build Playbook for Claude Cowork

> **How to use this file**
>
> 1. Open Claude Cowork in your `C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source` folder.
> 2. At the start of every new Cowork session, paste **PROMPT 0** (below)
>    so Cowork loads `CONTEXT.md` and stays on-spec.
> 3. Work through the steps **in order**. Each step has:
>    - **🎯 Goal** — what you'll have working at the end
>    - **📋 Prompt** — copy-paste this into Cowork
>    - **✅ Verify** — the exact command + expected output
>    - **🐛 If it breaks** — common gotchas and the fix
> 4. Don't skip the verify step. A broken Step 3 makes Step 7 look haunted.
>
> **Your environment**
> - Windows host with PowerShell (where you'll run terminal commands)
> - Cowork edits files in `C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source`
> - Python 3.11+ and Node 18+ installed
> - An `ANTHROPIC_API_KEY` ready to paste into `backend/.env`
>
> **Total time budget:** ~3–4 hours of focused work for the demo.
> Steps 1–4 give you a clickable shell in ~60 minutes. Steps 5–7 are
> the killer feature.

---

## PROMPT 0 — Session Bootstrap (paste at the start of every Cowork session)

```
You are the build agent for CertaintyAI, a project for MDxBlocks Inc.
Before doing anything else:

1. Read CONTEXT.md in this folder. That file is the source of truth
   for what we're building, the tech stack, the file layout, the
   survey schema, the scoring algorithm, and the demo definition of
   done. Do not deviate from it without asking me first.

2. Read INSTRUCTIONS.md. That file is the ordered build plan. We are
   working through it step by step. I will tell you which step we're
   on.

3. Do not introduce Google ADK, A2A protocol, MCP servers, pgvector,
   PostgreSQL, or Docker in Phase 1. Those are explicitly deferred.

4. Use the Anthropic model `claude-sonnet-4-6` everywhere we call
   Claude. Never invent a model name.

5. After you finish each step, give me the exact PowerShell commands
   I should run to verify it works, and tell me what success looks like.

Confirm you've read both files and tell me which step you think we're
on based on what's already in this folder. Then wait for me to say "go".
```

---

# Step 1 — Project Scaffold & README

### 🎯 Goal
The folder structure from `CONTEXT.md` section 7 exists. `.gitignore`,
`README.md`, and empty package files are in place. Nothing runs yet —
this is the skeleton.

### 📋 Prompt
```
We are on Step 1. Create the full project scaffold described in
CONTEXT.md section 7. Specifically:

1. Create every directory listed.
2. Create empty Python files with just a single-line docstring (e.g.
   `"""User and Assessment ORM models."""`) so imports work later.
3. Create a top-level README.md with: project name, one-line pitch,
   the two run commands (backend and frontend), and a "Demo
   credentials" section using the table from CONTEXT.md section 10.
4. Create a top-level .gitignore covering: Python (__pycache__,
   *.pyc, .venv, .env, .pytest_cache), Node (node_modules, dist,
   .vite), SQLite (*.db, *.db-journal), and OS files (.DS_Store,
   Thumbs.db).
5. Create backend/requirements.txt with exactly these pinned-loose
   dependencies (no specific versions, latest compatible):
   fastapi, uvicorn[standard], sqlalchemy, pydantic, pydantic-settings,
   python-jose[cryptography], passlib[bcrypt], python-multipart,
   python-dotenv, anthropic, jinja2
6. Create backend/.env.example with:
   ANTHROPIC_API_KEY=sk-ant-paste-yours-here
   JWT_SECRET=change-me-in-prod
   JWT_ALGORITHM=HS256
   JWT_EXPIRY_HOURS=24
   DATABASE_URL=sqlite:///./data/certaintyai.db
7. Create frontend/.env.example with:
   VITE_API_BASE_URL=http://localhost:8000

Do NOT install anything yet. Do NOT initialize Vite yet. We do those
in Step 2. Just lay down the files.

When done, show me the tree output and stop.
```

### ✅ Verify
```powershell
cd C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source
Get-ChildItem -Recurse -Directory | Select-Object FullName
Test-Path .\backend\requirements.txt
Test-Path .\backend\.env.example
Test-Path .\frontend\.env.example
Test-Path .\.gitignore
Test-Path .\README.md
```
All `Test-Path` calls should return `True`. Directory list should match
the layout in `CONTEXT.md` section 7.

### 🐛 If it breaks
- **Cowork created files in wrong root:** stop, tell it the working
  directory is `C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source`
  and to redo it relative to there.

---

# Step 2 — Install & Smoke-Test Both Stacks

### 🎯 Goal
Backend and frontend both start without errors. No features yet — just
proof that the toolchain is alive.

### 📋 Prompt
```
We are on Step 2. Goals:

1. Initialize the frontend as a Vite + React JS project INSIDE the
   existing frontend/ directory (do not let Vite create a new
   subdirectory). After init, install: tailwindcss, postcss,
   autoprefixer, react-router-dom, axios, react-hook-form,
   react-force-graph-2d.
2. Configure Tailwind: create tailwind.config.js (content paths for
   ./index.html and ./src/**/*.{js,jsx}), postcss.config.js, and
   replace src/index.css with the three @tailwind directives
   (base, components, utilities) plus a body rule setting
   background-color #0B1220 and color #E2E8F0.
3. Replace src/App.jsx with a minimal component that renders
   "CertaintyAI is alive" inside a div with className
   "min-h-screen flex items-center justify-center text-3xl font-bold".
4. For the backend, write a minimal backend/app/main.py that creates
   a FastAPI app with one route GET /health returning
   {"status": "ok", "service": "certaintyai"} and enables CORS for
   http://localhost:5173.
5. Tell me the exact PowerShell commands to (a) create and activate
   a Python venv at backend/.venv, (b) install requirements,
   (c) run uvicorn, (d) install frontend deps, (e) run vite dev.

Do not edit any other files. Stop after Step 2.
```

### ✅ Verify
Open **two PowerShell windows**.

**Window 1 — backend:**
```powershell
cd C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# If activation is blocked:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   then re-run Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env   # we'll add the real API key in Step 6
uvicorn app.main:app --reload --port 8000
```
Expect: `Uvicorn running on http://127.0.0.1:8000`. In a browser hit
`http://localhost:8000/health` → see `{"status":"ok","service":"certaintyai"}`.

**Window 2 — frontend:**
```powershell
cd C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source\frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```
Expect: `Local: http://localhost:5173/`. Open it → see
"CertaintyAI is alive" centered on a dark background.

### 🐛 If it breaks
- **`Activate.ps1` blocked:** `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
- **Tailwind not applying:** check `tailwind.config.js` `content` paths
  include `./src/**/*.{js,jsx}` and that `src/main.jsx` imports
  `./index.css`.
- **CORS error in browser console:** the FastAPI `CORSMiddleware` is
  missing or the origin doesn't match `http://localhost:5173`.

---

# Step 3 — Database, Models, Schemas, Seed

### 🎯 Goal
SQLite database exists, `User` and `Assessment` tables are created
on startup, the five demo users from `CONTEXT.md` section 10 are
seeded with hashed passwords.

### 📋 Prompt
```
We are on Step 3. Goals:

1. backend/app/config.py — Pydantic BaseSettings reading the .env
   variables (anthropic_api_key, jwt_secret, jwt_algorithm,
   jwt_expiry_hours, database_url). Export a single `settings` instance.

2. backend/app/database.py — SQLAlchemy engine from settings.database_url
   (with check_same_thread=False for SQLite), SessionLocal, Base, and
   a get_db() dependency for FastAPI.

3. backend/app/models.py — exactly two models:
   - User(id, email[unique], hashed_password, full_name, role,
     created_at)
   - Assessment(id, user_id[FK], answers[JSON via sqlalchemy.JSON],
     report_html[Text], scores[JSON], created_at)

4. backend/app/schemas.py — Pydantic v2 models for:
   - UserCreate, UserOut, UserLogin
   - Token (access_token, token_type)
   - PasswordChange (current_password, new_password)
   - SurveyAnswers — match EXACTLY the JSON shape in CONTEXT.md
     section 8. Use Literal[...] for enum-style fields and nested
     models for data_state and governance.
   - AssessmentOut (id, scores, created_at)

5. backend/app/auth.py — helpers:
   hash_password, verify_password, create_access_token,
   decode_access_token, get_current_user (FastAPI dependency that
   reads the Bearer token, decodes, and returns the User).

6. backend/data/demo_users.json — array of 5 objects with email,
   password (plaintext, will be hashed at seed time), full_name, role.
   Use the table in CONTEXT.md section 10. Password for all:
   "Certainty2026!"

7. backend/app/seed.py — function seed_demo_users(db) that:
   - reads data/demo_users.json
   - for each entry, if no User exists with that email, creates one
     with the bcrypt-hashed password.

8. Wire it all into main.py:
   - On startup: Base.metadata.create_all(engine), then seed_demo_users.
   - Keep the existing /health route.

Show me the diff of files changed. Stop.
```

### ✅ Verify
```powershell
# In the backend window (uvicorn auto-reloads):
# Check the DB was created and seeded:
cd C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source\backend
Test-Path .\data\certaintyai.db
# Inspect users with a one-liner:
python -c "from app.database import SessionLocal; from app.models import User; db=SessionLocal(); print([u.email for u in db.query(User).all()])"
```
Expect: list of 5 emails.

### 🐛 If it breaks
- **`ImportError: bcrypt`:** `pip install bcrypt passlib[bcrypt] --upgrade`.
  Recent passlib + bcrypt have a known compat issue; if `verify_password`
  throws `AttributeError: module 'bcrypt' has no attribute '__about__'`,
  pin bcrypt to a compatible version: `pip install "bcrypt<4.1"`.
- **DB not created:** make sure `data/` exists. Cowork sometimes forgets.

---

# Step 4 — Auth API & Frontend Auth Pages

### 🎯 Goal
You can sign up a new user via the UI, log in as a demo user, and
hit a protected endpoint with a stored JWT.

### 📋 Prompt
```
We are on Step 4. Goals:

BACKEND:
1. backend/app/routers/auth.py with these endpoints, all prefixed /auth:
   - POST /signup → body UserCreate → creates user, returns Token
   - POST /login → body UserLogin → returns Token (or 401)
   - GET /me → requires get_current_user → returns UserOut
   - POST /change-password → requires get_current_user → body
     PasswordChange → verifies current, hashes and saves new,
     returns 204
2. Register the router in main.py.
3. Add input validation: email must be valid (Pydantic EmailStr),
   password must be at least 8 chars on signup and change-password.
   Install `email-validator` and add it to requirements.txt.

FRONTEND:
4. frontend/src/lib/api.js — axios instance with baseURL from
   import.meta.env.VITE_API_BASE_URL. Request interceptor that adds
   `Authorization: Bearer <token>` from localStorage key
   `certaintyai_token` if present. Response interceptor that, on 401,
   clears the token and redirects to /login.
5. frontend/src/context/AuthContext.jsx — provider exposing
   { user, login(email, password), signup(payload), logout(),
   changePassword(current, next), loading }. Persist token in
   localStorage. On mount, if a token exists, call GET /auth/me to
   hydrate the user.
6. frontend/src/components/ProtectedRoute.jsx — wraps children;
   redirects to /login if no user.
7. frontend/src/pages/Login.jsx and Signup.jsx — Tailwind-styled
   forms using react-hook-form. On success, navigate to /survey.
   Show inline error messages on failure.
8. frontend/src/pages/Profile.jsx — shows current user info and a
   "Change password" form. Protected.
9. frontend/src/components/Navbar.jsx — top nav with logo
   "CertaintyAI", links to Home / Survey / Profile (Profile only if
   logged in), and a Login or Logout button on the right.
10. frontend/src/App.jsx — set up react-router-dom v6 routes:
    /, /survey, /login, /signup, /profile, /report/:id. Wrap /survey,
    /profile, /report/:id in ProtectedRoute. Wrap the whole app in
    <AuthProvider> and <BrowserRouter>. Render <Navbar /> above the
    <Routes /> outlet.
11. The "/" route still shows a placeholder for now — just a div
    saying "Landing page coming in Step 5".

Stop after Step 4.
```

### ✅ Verify
1. Frontend: visit `http://localhost:5173/signup`, create
   `tester@example.com` / `password123`. You should be redirected to
   `/survey` (which will still be a placeholder). Open DevTools →
   Application → Local Storage → confirm `certaintyai_token` is set.
2. Visit `/profile` → shows your email.
3. Click Logout → token cleared, you're back on the landing
   placeholder.
4. Visit `/login`, log in as `demo@mdxblocks.com` / `Certainty2026!`
   → success.
5. Try `/profile` while logged out → redirected to `/login`.
6. PowerShell sanity check (with the backend running):
   ```powershell
   curl -Method POST -Uri http://localhost:8000/auth/login `
     -Body (@{email='demo@mdxblocks.com'; password='Certainty2026!'} | ConvertTo-Json) `
     -ContentType 'application/json'
   ```
   Expect a JSON response containing `access_token`.

### 🐛 If it breaks
- **`EmailStr` import error:** `pip install pydantic[email]` or
  `pip install email-validator` and restart uvicorn.
- **Token not attached to requests:** check the axios interceptor is
  reading the same localStorage key the AuthContext writes.
- **`/profile` flashes content then redirects:** AuthContext `loading`
  isn't being respected by ProtectedRoute. Show a spinner while loading.

---

# Step 5 — Landing Page (Hero, About, Ontology Graph)

### 🎯 Goal
A real landing page at `/` that sells the product, with the
interactive ontology graph as the centerpiece.

### 📋 Prompt
```
We are on Step 5. Build the landing page. Goals:

1. frontend/src/lib/ontologyData.js — export { nodes, links } for
   react-force-graph-2d. Include all five domains from CONTEXT.md
   section 4. Each node:
   { id: 'patient', label: 'Patient', domain: 'healthcare' }
   Domains: healthcare, education, cybersecurity, finops, itconsulting,
   plus a central node { id: 'ontology', label: 'CertaintyAI Ontology',
   domain: 'core' }. Each domain's primary entity (Patient, Student,
   Asset, Account, Engagement) links to the core ontology node, and
   the entities within a domain link in the sequence shown in
   CONTEXT.md section 4.

2. frontend/src/components/OntologyGraph.jsx — uses
   ForceGraph2D from 'react-force-graph-2d'. Color nodes by domain:
   core=#22D3EE (cyan), healthcare=#F472B6 (pink), education=#FBBF24
   (amber), cybersecurity=#EF4444 (red), finops=#34D399 (emerald),
   itconsulting=#A78BFA (violet). Custom nodeCanvasObject that draws
   a filled circle (radius 6, larger for the core node) and the label
   underneath in 11px Inter. Set height to 500, background transparent,
   linkColor "#334155", linkWidth 1. Make it responsive with
   ResizeObserver — pass width = container width.

3. frontend/src/components/Hero.jsx — full-width section, two-column
   on lg. Left: H1 "Ontology-driven AI for regulated industries.",
   subhead one short sentence about MDxBlocks, two CTAs side by side:
   primary "Take the 2-minute readiness assessment" → /survey (or
   /signup if not logged in), secondary "Sign in" → /login (hidden
   if logged in). Right: the <OntologyGraph />.

4. frontend/src/components/AboutSection.jsx — three sub-sections
   stacked:
   (a) "Built by MDxBlocks Inc" — one paragraph describing MDxBlocks
       as an ISV partner with Azure, IBM, NVIDIA and strategic
       partnerships with Anthropic, ServiceNow, Salesforce, Snowflake,
       Databricks. Show partner names as a horizontal row of pill
       badges (just text in rounded borders — no logos).
   (b) "Why CertaintyAI" — three-card grid:
       - "Ontology as a layer" — short blurb
       - "Explainable agentic AI" — short blurb
       - "Governance-first for regulated industries" — short blurb
   (c) "How it compares" — small table with three columns
       (Palantir Foundry / Fluree / CertaintyAI) and four rows
       (Target market, Cost & complexity, Ontology model, Deployment),
       pulled from CONTEXT.md section 3.

5. frontend/src/pages/Landing.jsx — composes Hero and AboutSection
   inside a <main> with max-width 7xl and px-6 spacing. Add a final
   small "Ready to assess your AI readiness?" CTA strip at the
   bottom linking to /survey.

6. Wire Landing.jsx into App.jsx at the "/" route, replacing the
   placeholder.

Stop after Step 5.
```

### ✅ Verify
Open `http://localhost:5173/`. You should see:
- A hero with a working force-directed graph on the right. Drag
  nodes — they should bounce. Hover should show node labels.
- An About section listing the partner badges and the comparison table.
- The primary CTA navigates to `/signup` if logged out, `/survey` if
  logged in.

### 🐛 If it breaks
- **Graph is blank:** `react-force-graph-2d` requires a non-zero width
  on first render. Make sure the container has an explicit width or
  the ResizeObserver fires before render.
- **`Cannot read properties of undefined (reading 'id')`:** typo in
  `links` — `source` and `target` must match node `id`s exactly.

---

# Step 6 — Survey Wizard

### 🎯 Goal
A 5-step wizard at `/survey` that collects the exact JSON shape from
`CONTEXT.md` section 8 and POSTs to the backend on submit. After
submit, navigate to `/report/:id` (we'll build the report next step).

### 📋 Prompt
```
We are on Step 6. Build the survey wizard. Goals:

BACKEND:
1. backend/app/routers/survey.py: POST /survey
   - Requires get_current_user
   - Body: SurveyAnswers (Pydantic model from Step 3)
   - For now, just save an Assessment row with answers=payload.dict(),
     scores={}, report_html="" and return {"id": assessment.id}.
     We'll fill in scoring + report generation in Step 7.
2. Register the router in main.py.

FRONTEND:
3. frontend/src/components/survey/ — one file per step component plus
   SurveyWizard.jsx. Use react-hook-form with `useForm({ mode: 'onBlur',
   defaultValues: <full SurveyAnswers shape with sensible defaults> })`.
   Pass `register`, `watch`, `setValue`, `formState` down via props or
   FormProvider.
4. Steps and their fields:
   - StepIndustry — radio cards for industry, select for company_size
   - StepMaturity — radio cards for ai_maturity, checkboxes for
     ai_use_cases
   - StepData — number input for sources_count (1-50, slider OK),
     range slider for structured_pct (0-100), toggle for siloed,
     1-5 star rating for quality_rating
   - StepGovernance — toggles for has_data_governance, has_ai_policy,
     regulated; checkboxes for compliance_frameworks
   - StepReview — read-only summary of all answers, "Generate report"
     submit button
5. SurveyWizard.jsx:
   - Top: progress bar with step labels ("Industry", "AI Maturity",
     "Data", "Governance", "Review")
   - Body: current step component
   - Bottom: Back / Next buttons (Back hidden on step 1; Next becomes
     "Generate report" on step 5)
   - "Generate report" handler:
       (a) show a full-screen overlay with a spinner and rotating
           status messages: "Calling scoring engine...",
           "Generating insights with Claude...", "Composing report..."
       (b) POST /survey with the form values
       (c) on success, navigate(`/report/${response.data.id}`)
       (d) on error, hide the overlay and toast the message
6. frontend/src/pages/Survey.jsx — renders <SurveyWizard /> inside a
   max-w-3xl card on a dark background.

Stop after Step 6.
```

### ✅ Verify
1. Log in as `demo@mdxblocks.com`, click the landing CTA → land on
   `/survey`.
2. Walk through all 5 steps. Validation on Next should prevent
   advancing with missing required fields.
3. On final submit, the overlay shows for ~1 second (no report yet),
   then you navigate to `/report/1` (which will 404 until Step 7 — that's expected).
4. Check the DB row exists:
   ```powershell
   python -c "from app.database import SessionLocal; from app.models import Assessment; db=SessionLocal(); a=db.query(Assessment).first(); print(a.id, a.answers)"
   ```
   Expect: the answers dict you just submitted.

### 🐛 If it breaks
- **422 Unprocessable Entity:** the JSON shape doesn't match
  `SurveyAnswers`. Open DevTools → Network → the failing POST →
  Response tab will tell you exactly which field is wrong.
- **State resets between steps:** make sure `SurveyWizard` owns the
  `useForm` instance, not each step.

---

# Step 7 — The Killer Feature: Report Generation

### 🎯 Goal
On survey submit, the three "agents" run, the Jinja2 template gets
filled with real Claude-generated insights, and the styled HTML
report renders inside the app at `/report/:id`.

### 📋 Prompt — Part A (the scoring agent — no LLM)
```
We are on Step 7A — the deterministic scoring agent.

Build backend/app/agents/score_agent.py with a single function:

  def calculate_scores(answers: dict) -> dict

It must implement EXACTLY the algorithm in CONTEXT.md section 9:
- semantic_fragmentation_score (0-100)
- executive_readiness_score (0-100)
- maturity_tier (one of "Nascent", "Emerging", "Operational", "Optimized")
- maturity_tagline (the matching tagline string)

Return shape:
{
  "semantic_fragmentation_score": float,
  "executive_readiness_score": float,
  "maturity_tier": str,
  "maturity_tagline": str,
  "score_breakdown": {
     "maturity_baseline": int,
     "governance_bonus": int,
     "compliance_bonus": int,
     "fragmentation_penalty": float,
     "blocker_penalty": int
  }
}

Add three unit tests in backend/tests/test_score_agent.py covering:
- A "nascent" profile (exploring, no governance, many blockers)
- An "operational" profile (scaling, has governance, few blockers)
- An "optimized" profile (optimizing, all governance, regulated, few sources)

Show me how to run the tests with pytest.
```

### ✅ Verify Part A
```powershell
cd C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP\Source\backend
.\.venv\Scripts\Activate.ps1
pip install pytest
pytest tests/ -v
```
All three tests pass. Eyeball the assertions — the scores should be in
plausible ranges.

---

### 📋 Prompt — Part B (the LLM agents — Anthropic)
```
We are on Step 7B — the two LLM agents.

1. First, paste your ANTHROPIC_API_KEY into backend/.env now if you
   haven't already. Confirm with me before continuing.

2. backend/app/agents/prompts.py — two constants:

   INSIGHTS_SYSTEM_PROMPT — instructs the model that it is the
   "InsightsGenerationAgent" inside CertaintyAI. Its job: given a
   survey JSON and the computed scores, produce a STRICT JSON object
   with these keys:
     {
       "strengths": [3 short strings],
       "risks": [3 short strings],
       "recommendations": [
         {"horizon": "Week 1", "action": "...", "rationale": "..."},
         {"horizon": "Month 1", "action": "...", "rationale": "..."},
         {"horizon": "Quarter 1", "action": "...", "rationale": "..."}
       ],
       "blockers_diagnosis": "1-2 sentence diagnosis"
     }
   The prompt must say: "Return ONLY the JSON object, no prose, no
   code fences."

   NARRATIVE_SYSTEM_PROMPT — instructs the model that it is the
   "NarrativeAgent". Given survey answers, scores, and insights JSON,
   produce a JSON object with:
     {
       "current_state_summary": "150-250 word paragraph",
       "data_maturity_review": "150-250 word paragraph",
       "findings_narrative": "150-250 word paragraph",
       "executive_summary": "100-150 word paragraph for the C-suite"
     }
   Same "return JSON only" instruction.

3. backend/app/agents/insights_agent.py — function
   generate_insights(answers, scores) -> dict.
   - Uses the official anthropic Python SDK
   - model = "claude-sonnet-4-6"
   - max_tokens = 1500
   - system = INSIGHTS_SYSTEM_PROMPT
   - user message: f"Survey:\n{json.dumps(answers, indent=2)}\n\n
     Scores:\n{json.dumps(scores, indent=2)}"
   - Parse response.content[0].text as JSON. If parse fails, return
     a safe fallback dict (same shape, generic content) and log the error.

4. backend/app/agents/narrative_agent.py — function
   generate_narrative(answers, scores, insights) -> dict.
   Same pattern, same model, max_tokens = 2500. Same fallback strategy.

5. backend/app/agents/orchestrator.py — function
   generate_readiness_report(answers: dict) -> dict that:
   (a) calls calculate_scores(answers)
   (b) calls generate_insights(answers, scores)
   (c) calls generate_narrative(answers, scores, insights)
   (d) returns a single dict:
       {
         "answers": answers,
         "scores": scores,
         "insights": insights,
         "narrative": narrative,
         "generated_at": ISO8601 timestamp
       }

Show me the diff. Stop.
```

### ✅ Verify Part B
Quick smoke test in PowerShell (with backend venv active):
```powershell
python -c @"
from app.agents.orchestrator import generate_readiness_report
import json
sample = {
  'industry': 'healthcare', 'company_size': '251-1000',
  'ai_maturity': 'piloting',
  'data_state': {'sources_count': 18, 'structured_pct': 60, 'siloed': True, 'quality_rating': 3},
  'governance': {'has_data_governance': False, 'has_ai_policy': False, 'regulated': True, 'compliance_frameworks': ['HIPAA']},
  'current_blockers': ['data_silos', 'no_ontology', 'skills_gap'],
  'ai_use_cases': ['copilot', 'decision_support']
}
out = generate_readiness_report(sample)
print(json.dumps(out, indent=2))
"@
```
Expect: a dict with non-empty `insights` and `narrative`. If those are
generic fallbacks, the API key is wrong or the JSON parse failed —
check the logs.

---

### 📋 Prompt — Part C (the HTML template & rendering)

> **⚠️ This is where you drop in your CertaintyAI HTML.**
>
> Before running the prompt below, paste your existing CertaintyAI-generated
> HTML into `backend/app/report/template.html`. Then replace the dynamic
> sections with Jinja2 placeholders as instructed. If you want, paste the
> HTML into Cowork first and ask it to convert the dynamic parts to
> Jinja2 placeholders for you — the prompt below does exactly that.

```
We are on Step 7C — wiring the report template.

I have pasted my existing HTML report design into
backend/app/report/template.html. Your job:

1. Read template.html. Identify every dynamic text region: scores,
   tier name, tagline, strengths list, risks list, recommendations,
   the four narrative paragraphs (current state, data maturity,
   findings, executive summary), the industry, company size, ai
   maturity, blockers, and the generated_at timestamp.

2. Replace each dynamic region with Jinja2 placeholders. Use exactly
   these variable names so the renderer can find them:

   {{ scores.executive_readiness_score | round | int }}
   {{ scores.semantic_fragmentation_score | round | int }}
   {{ scores.maturity_tier }}
   {{ scores.maturity_tagline }}
   {{ answers.industry | title }}
   {{ answers.company_size }}
   {{ answers.ai_maturity | title }}
   {% for s in insights.strengths %} ... {% endfor %}
   {% for r in insights.risks %} ... {% endfor %}
   {% for rec in insights.recommendations %}
     {{ rec.horizon }} — {{ rec.action }} ({{ rec.rationale }})
   {% endfor %}
   {{ insights.blockers_diagnosis }}
   {{ narrative.current_state_summary }}
   {{ narrative.data_maturity_review }}
   {{ narrative.findings_narrative }}
   {{ narrative.executive_summary }}
   {{ generated_at }}

3. Keep all existing CSS and layout. Add a print stylesheet block
   if not present:
     @media print { body { background:#fff; color:#000; } .no-print { display:none; } }

4. backend/app/report/renderer.py:
   - Loads template.html using Jinja2 FileSystemLoader pointed at
     backend/app/report/
   - Function render_report(report_data: dict) -> str that returns
     the rendered HTML string.

5. backend/app/routers/survey.py — update POST /survey:
   - After saving the Assessment row with just the answers, call
     generate_readiness_report(answers)
   - Save scores and full report dict into the Assessment row:
       assessment.scores = result["scores"]
       assessment.report_html = render_report(result)
   - Commit, then return {"id": assessment.id}.
   - Wrap the report generation in try/except. On failure, still
     return the assessment ID but mark report_html with a friendly
     error page so the demo doesn't 500.

6. backend/app/routers/report.py:
   - GET /report/{id} — requires get_current_user — returns the
     stored report_html as an HTMLResponse. 404 if not found. 403 if
     the assessment belongs to a different user.
   - GET /report/{id}/data — returns the structured JSON (scores +
     insights + narrative + answers) for any frontend rendering.

7. Register the report router in main.py.

8. FRONTEND: frontend/src/pages/Report.jsx —
   - Reads :id from useParams.
   - Calls GET /report/{id} (HTML).
   - Renders the HTML inside an <iframe srcDoc={html}> with
     className "w-full h-screen border-0" so the report's own styles
     are isolated from the app's Tailwind.
   - Above the iframe, a small toolbar (no-print): "← New assessment"
     button → /survey, "Print" button → window.print() on the iframe
     contentWindow.

Show me the diff. Stop.
```

### ✅ Verify Part C
Walk the full flow end-to-end:
1. Log in as `demo@mdxblocks.com` / `Certainty2026!`
2. Click "Take the 2-minute readiness assessment" on the landing page.
3. Fill in all 5 steps with realistic answers (try a healthcare org,
   piloting maturity, some governance gaps).
4. Submit. Spinner shows for ~10–20 seconds (Claude calls).
5. You land on `/report/:id` and see the rendered HTML report inside
   the iframe, populated with your survey data, real scores, and
   Claude-generated insights and narrative.
6. Print button opens the print dialog with the report layout intact.
7. Refresh the page → the report reloads from the DB (it's persisted).

### 🐛 If it breaks
- **`anthropic.APIError`:** API key is missing or wrong. Confirm
  `backend/.env` has `ANTHROPIC_API_KEY=sk-ant-...` and restart uvicorn.
- **JSON parse fails on insights/narrative:** the model returned prose
  around the JSON. Tighten the prompt: "You must respond with a
  single JSON object. Do not include explanatory text, markdown
  fences, or anything outside the JSON." If it still happens, wrap
  the parser in a regex that finds the first `{` and matching `}`.
- **Report renders unstyled:** iframe is fine, your template just
  doesn't have inline `<style>`. Either inline the CSS in `template.html`
  or use `<link rel="stylesheet">` with absolute URLs.
- **`/report/:id` shows 403:** the JWT user_id doesn't match the
  assessment.user_id. Check that the survey router used
  `current_user.id`, not a hardcoded value.

---

# Step 8 — Demo Polish & Dry Run

### 🎯 Goal
The demo doesn't surprise you on stage.

### 📋 Prompt
```
We are on Step 8 — pre-demo polish.

1. Run through the Definition of Done in CONTEXT.md section 13 and
   fix anything that fails.

2. Frontend polish:
   - Add a favicon (any simple SVG, e.g. a cyan dot) at
     frontend/public/favicon.svg and reference it in index.html.
   - Update <title> to "CertaintyAI — AI Readiness Assessment".
   - Ensure the loading overlay on survey submit shows for the full
     duration of the API call. The rotating status messages should
     change every 3-4 seconds.
   - Add an error boundary around <Routes /> so a render error in
     Report.jsx doesn't blank the whole app.

3. Demo data sanity:
   - Pre-generate one assessment for demo@mdxblocks.com so the user
     has a report to show on /profile without re-doing the survey.
     Add a seed_demo_assessment() call in seed.py — but only if the
     user has zero assessments. Use realistic healthcare answers.

4. Add a tiny README at the top of the project with the EXACT three
   commands a demo machine needs:
     # Backend
     cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1
     pip install -r requirements.txt
     uvicorn app.main:app --reload
     # Frontend (new terminal)
     cd frontend; npm install; npm run dev
   Plus the demo login.

Do these in order, ask if anything's ambiguous, then stop.
```

### ✅ Dry-run checklist (do this YOURSELF, not Cowork)
Run the demo flow **twice** end-to-end on a fresh terminal session:

- [ ] `npm run dev` and `uvicorn` both start clean.
- [ ] Landing page loads in < 2 seconds, graph is visible.
- [ ] Drag a node on the graph — works smoothly.
- [ ] Click CTA → signup → fill in → land on survey.
- [ ] Walk through survey in under 90 seconds.
- [ ] Submit → spinner with rotating messages → report renders
      with real scores and insights.
- [ ] Print preview looks clean.
- [ ] Logout and log back in as `demo@mdxblocks.com` → see the
      seeded report on `/profile`.
- [ ] Refresh the report page — it reloads from DB.
- [ ] Open the page on the projector / external display you'll use
      tomorrow. Check that the dark theme isn't washed out.

If any item fails, fix it. If you're running short on time, the
items in **bold** below are non-negotiable for the demo to land:

- **Landing → survey → report flow works in one shot**
- **The report shows real Claude-generated content, not the fallback**
- **The graph is visible and interactive**

Everything else is nice-to-have.

---

# Appendix A — Common Cowork Recovery Prompts

If Cowork goes off the rails mid-step, paste one of these:

**"Stop and re-read CONTEXT.md before continuing."**
Use when it starts inventing fields, model names, or layers.

**"You're editing the wrong file. The file layout is in CONTEXT.md section 7."**
Use when it creates files outside the structure.

**"Show me the diff for the last change."**
Use to audit before accepting.

**"Revert that change and try a smaller version that does only X."**
Use when a step turned into a sprawl.

**"What did Step N look like when it was working? Restore it."**
Use after a regression.

# Appendix B — PowerShell One-Liners for the Demo

Tail backend logs in one window:
```powershell
Get-Content .\backend\uvicorn.log -Wait -Tail 20
```
(Only works if you've redirected uvicorn output. Otherwise, just keep
the uvicorn terminal visible.)

Reset everything for a clean demo (DANGER — wipes the DB):
```powershell
Remove-Item .\backend\data\certaintyai.db -ErrorAction SilentlyContinue
# Restart uvicorn — schema recreates and demo users reseed.
```

Generate a fresh access token for API testing:
```powershell
$body = @{email='demo@mdxblocks.com'; password='Certainty2026!'} | ConvertTo-Json
$resp = Invoke-RestMethod -Method POST -Uri http://localhost:8000/auth/login `
  -Body $body -ContentType 'application/json'
$resp.access_token | Set-Clipboard
"Token copied to clipboard."
```

# Appendix C — Ubuntu / WSL Equivalents

If you switch to Ubuntu (WSL) instead of PowerShell for any step:

```bash
# Activate venv
source backend/.venv/bin/activate

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Reset DB
rm -f backend/data/certaintyai.db

# Quick login token
curl -s -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@mdxblocks.com","password":"Certainty2026!"}' \
  | jq -r .access_token
```

# Appendix D — Phase 2 Roadmap (mention on stage, don't build tonight)

After the demo lands, the upgrade path is:

1. **Replace the scoring agent's siblings with real Google ADK
   agents.** The function signatures are already designed to be
   drop-in replacements.
2. **Add pgvector** behind a single `MemoryStore` interface — start
   by embedding past assessments so the InsightsAgent can retrieve
   similar past clients' recommendations.
3. **Expose the agents as MCP tools** so external clients (Claude
   Desktop, custom orchestrators) can call them.
4. **Wrap with Docker + docker-compose** (one service per: api, web,
   postgres-with-pgvector).
5. **Knowledge graph store** (Neo4j or Memgraph) to back the ontology
   layer with a real graph DB; the current `ontologyData.js` becomes
   a query against it.

That's the slide. Don't build it tonight.

---

*End of INSTRUCTIONS.md. Good luck. Ping me from inside Cowork if a
step prompt isn't producing what you need and we'll adjust live.*
