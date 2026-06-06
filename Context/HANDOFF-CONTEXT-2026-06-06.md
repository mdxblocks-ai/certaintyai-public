# CertaintyAI — Hackathon Handoff Context (updated 2026-06-06)

**Purpose:** Continuity doc to paste into a new chat (Antigravity, Claude, ChatGPT) so work resumes without re-explaining. Supersedes HANDOFF-CONTEXT-2026-06-05.md.

**Role for the assistant:** advisor + SME + build-prompt author for CertaintyAI's hackathon submission. Goal: **WIN Track 3.** The build is done by **Antigravity** (Google's agentic IDE) on the user's local Windows machine; the assistant advises, writes specs/prompts for Antigravity, reviews plans/output, and catches honesty + correctness issues. The assistant has NO access to the local code, the live site, or Antigravity's command history — it works from pasted terminal output and screenshots.

---

## 🟢 BIG NEWS SINCE LAST HANDOFF: ALL FOUR TRACK-3 MANDATES ARE DONE
The A2A mandate (the one critical gap in the last handoff) is now genuinely met, verified cross-process, and committed.

### Commit history (local branch `feature/agent-builder`)
- `ab4e101` (HEAD) — agent_runtime: tolerant parsing + graceful fallback on malformed/truncated LLM JSON (run completes instead of failing)
- `b0f2bc5` — A2A producer: align runner app name with loaded agent (cosmetic log fix)
- `2e92928` — **A2A interoperability**: producer via `to_a2a` + `RemoteA2aAgent` consumer (real 2-process HTTP) ← THE MANDATE
- `b5f0062` — **Real ADK SequentialAgent pipeline** (Gemini/Vertex), firewall-safe, feature-flagged + parity-gated
- `b44cd03` — (origin/main) clean public base

### Mandate status (all ✅)
1. **B2B Focus** ✅
2. **Cloud-Native Runtime** (Cloud Run) ✅ — deploy config exists; actual deploy still pending
3. **Vertex-Powered Intelligence** ✅ — Gemini on Vertex AI; verified live (`gemini-2.5-flash`, `GoogleLLMVariant.VERTEX_AI`, real `generateContent 200` from `us-central1-aiplatform.googleapis.com`)
4. **A2A Interoperability** ✅ — genuine: producer (`to_a2a`) serves Agent Card at `/.well-known/agent-card.json`; consumer (`RemoteA2aAgent`) fetches it and calls over HTTP JSON-RPC. Proven: curl card → 200, cross-process `POST .../message/send` in producer log, `/survey/adk` → 201.
- Bonus: ADK used as orchestration vehicle (real `SequentialAgent` + `FunctionTool`/`BaseAgent` scorer + `Runner`), rubric-rewarded.

---

## 🔴 HARD-WON FACTS THAT MUST NOT BE BROKEN (this session's painful lessons)

### Dependency pins (DO NOT CHANGE)
- **`a2a-sdk==0.3.26`** and **`google-adk==2.2.0`** in requirements.txt.
- The earlier `a2a-sdk==1.1.0` pin was WRONG — 1.1.0 moved `ClientEvent` and breaks `RemoteA2aAgent` import. 0.3.26 is the version `google-adk 2.2.0` actually works with. Changing this pin re-breaks A2A. The fix cost hours; do not touch.
- Note: a startup WARNING `Failed to apply A2A-SDK compatibility patch: No module named '...default_request_handler_v2'` is BENIGN/inert on 0.3.26 — leave it; do NOT try to "clean it up" (an attempt to do so broke the producer and was reverted).

### Single source tree (contamination resolved)
- Canonical tree: **`C:\Project\MDx-CoPilots\Copilots\AntiGravity\MDxCAI\Source`**. Always run/test/commit/deploy from here.
- A second tree, `C:\Project\MDx-CoPilots\Copilots\ClaudeCode\CAI-AIP`, was the source of severe contamination (its venv/`uvicorn.exe` was being loaded while running AntiGravity source). It is now **archived/renamed** — do NOT resurrect it, do NOT let any process or deploy reference it.
- The `.venv` was fully rebuilt this session (the old one's `uvicorn.exe` pointed at the wrong python). Always invoke with the `.venv\Scripts\` prefix.

### Scoring firewall (non-negotiable, unchanged from prior handoffs)
- `score_agent.py` / `test_score_agent.py` / `calculate_scores` / `calculate_dynamic_scores` must NEVER be modified and must have NO LLM/agent on their path.
- Verified via `git diff --exit-code` on every relevant commit. ADK scoring runs as a deterministic step (no LLM). Parity gate (ADK == legacy scores) holds.
- `[Simulated]` labels in agent traces are an honesty requirement AND a test depends on them (`test_agent_crud_and_firewall`). Do not remove them.

### Repos (3 of them — keep straight)
- **`github.com/mdxblocks-ai/certaintyai-public`** = `origin`. Public, clean history (secret-scanned: only placeholders/empty defaults). This is where the FINAL submission goes (merge to `main`).
- **`github.com/mdxblocks-ai/certaintyai`** = OLD PRIVATE repo with **secrets in history**. ⚠️ NEVER push to or submit this one.
- **`github.com/mdxblocks-ai/certaintyai-backup`** = NEW private backup created 2026-06-06; `feature/agent-builder` pushed here as `backup` remote. Crash-safety only.
- Local-only discipline held: nothing pushed to public `origin` yet; `origin/main` is behind HEAD by design.

---

## PRODUCT (unchanged)
**CertaintyAI** by **MDxBlocks Inc.** — ontology-driven, auditable AI Readiness Assessment for regulated mid-market enterprises. "Defensible AI for regulated industries" / "Palantir for the other 99%." Killer feature: 2-min assessment → board-ready report via a **deterministic, auditable scoring engine** + Gemini-authored questions/insights/narrative. The deterministic scoring is the core differentiator. Assistant persona = **Pulsera** (role is the descriptor).

## STACK
Path: `C:\Project\MDx-CoPilots\Copilots\AntiGravity\MDxCAI\Source`
- **Backend:** FastAPI/Python, SQLAlchemy, Postgres+pgvector (prod) / **SQLite (local)**. Gemini on **Vertex AI**. FastMCP for tools. ADK 2.2.0 + a2a-sdk 0.3.26.
- **Local DB is SQLite** at `backend\data\certaintyai.db`. Do NOT let any path hit SQL Server locally (earlier ODBC error was from the contaminated tree).
- **Frontend:** Vite/React 18 + Tailwind, Cloud Run. Parchment theme. (User is considering a UI rebuild from HTML mockups — see OPEN ITEMS.)
- **Git:** branch `feature/agent-builder`, local-only until a deliberate submission step.

## RUN COMMANDS (local, two terminals, from backend dir)
```
# Terminal 1 — A2A producer (port 8001)
.venv\Scripts\python run_a2a_producer.py

# Terminal 2 — main app (port 8000)
$env:USE_ADK_PIPELINE="true"; .venv\Scripts\uvicorn app.main:app --port 8000
```
Test A2A: open http://localhost:8000/docs → POST /survey/adk → Try it out → Execute. Expect 201 + a `POST`/`message/send` line in the producer terminal. Negative control: kill producer, re-run → should error (proves real cross-process A2A).
Demo users: `demo@mdxblocks.com` / `bharathi.r@mdxblocks.com`, password `Certainty2026!` (intentional throwaway demo credential).

---

## ⚠️ OPEN ITEMS / KNOWN ISSUES (remaining work)

### Demo / robustness
- **Live embeddings + agent runs need a real `GEMINI_API_KEY`.** Locally it's empty → logs `GEMINI_API_KEY is empty; returning zero-vector fallback`. RAG/semantic memory is degenerate (zero vectors) without it. On Cloud Run, set the key via **Secret Manager** so embeddings populate. Don't film RAG features against zero-vectors.
- **SSL-verify bypass exists for local A2A** (`InsecureRequestWarning`). It MUST NOT be active in the Cloud Run deploy — gate it local-only or remove before deploy.
- **`SequentialAgent` is deprecated** in ADK 2.2.0 (warns "use Workflow"). Works fine for the demo; suppress the console warning before filming; don't migrate now (needless risk this close to deadline).
- Verify the JSON-fallback (commit ab4e101) returns honest best-effort content on garbage model output, NOT a fabricated confident answer. (Tests pass; the honesty of the degraded path wasn't visually confirmed.)

### Bugs NOT done (cosmetic — droppable)
- Voice leak (audio plays when panel muted/closed) — only matters if demoing voice.
- Session-tab label truncation; stray "CertaintyAI / MDx" text in empty session list.
- Bug-5 "agent-switch grounding" — an Antigravity rewrite of `agent_runtime.py` BROKE tests/producer twice and was REVERTED. Do NOT re-attempt under time pressure. If revisited: must prove REAL grounding switches (not just trace label) AND keep `[Simulated]` labels AND not touch the scoring path.

### Honesty scrub (HIGH leverage — Business Case 30% + Technical 30%) — NOT yet done
Covers SUBMISSION.md + the UI + deployment docs:
- Remove fabricated metrics, esp. in `voiceKnowledgeBase.json`: "$680/month", "45% reduction", "18% spike next Tuesday", "642K tokens", and the `evidence_pack` `"confidence": 0.94`.
- Mark roadmap-as-present-tense as ROADMAP or cut: GraphRAG, Evidence Pack Builder, immutable Audit Trail, cryptographic provenance, SPLADE/RRF.
- Remove absolute claims: "eliminate hallucinations" → "reduce/mitigate".
- "2.5-minute video" → ≤2:00.
- ADD a real "How we used ADK & A2A" section naming actual primitives: `SequentialAgent`, `FunctionTool`/`BaseAgent` scorer, `Runner`, `Session/State` + `output_key`, `to_a2a`, `RemoteA2aAgent`, served Agent Card.
- Keep real sourced figures (MIT NANDA ~95% fail, Gartner 60%/40%, Marketplace 3%/112%/50%). RULE: every claim must survive a Google-engineer judge checking it.

---

## THE HACKATHON (confirmed facts — verify portal first)
- **Competition:** Google for Startups AI Agents Challenge (private Google Cloud for Startups portal). "Generative AI Hack."
- **Submitting to Track 3:** Refactor for Google Cloud Marketplace & Gemini Enterprise.
- **Deadline: June 11, 2026 @ 7:00pm CDT = 5:00pm PT.** (Trust order for dates: portal first, extension email second, rules PDF never.)
- **Submit by clicking SUBMIT on the project in the portal — you'll see confetti.** A created project is NOT a submitted project.
- **Rubric:** Technical 30% · Business Case 30% · Innovation 20% · Demo & Presentation 20%. Technical + Demo explicitly reward use of ADK core concepts.
- **Demo video: 1–2 minutes MAX** (past 2:00 not evaluated). English. Upload a day early.
- ⚠️ Confirm in the portal what the submission field asks for (public repo URL? which branch?). Judges read the **default branch** (`main`) — plan to merge final work to `main` before submitting.

## 📺 WINNING 2-MIN DEMO OUTLINE
0:00 problem + pitch · 0:12 live product (assessment→report, Agent Builder/Pulsera) · 0:45 "How we used ADK" (`SequentialAgent`, FunctionTool scorer = deterministic/auditable, no LLM) · 1:15 "A2A in action" (2 terminals: curl agent-card 200, JSON-RPC `message/send` in producer log, "discoverable by Gemini Enterprise + Marketplace") · 1:45 close (Vertex/Gemini + Cloud Run, business + distribution). ≤2:00 hard.

## REMAINING PATH TO SUBMIT (in order)
1. ✅ Mandates done + committed (ab4e101) + backed up to private repo.
2. Honesty scrub (docs + UI + voiceKnowledgeBase) — highest scoring leverage.
3. (Optional) UI rebuild from HTML mockups — only if it doesn't break demo-critical paths (assessment→report, Pulsera chat, ADK/A2A demo screens); keep honesty rules built-in; commit current state first as rollback.
4. Record ≤2:00 demo (centerpiece: live A2A two-terminal proof).
5. Deploy to Cloud Run FROM THIS TREE ONLY; `GEMINI_API_KEY` via Secret Manager; SSL bypass OFF in prod; verify live in InPrivate.
6. Merge final work to `main` on `certaintyai-public`; SUBMIT in portal (confetti) before Jun 11 7pm CDT.

## KEY DECISIONS (don't relitigate)
- Scoring firewall non-negotiable; ADK scoring step has NO LLM; parity is a gate.
- a2a-sdk 0.3.26 + google-adk 2.2.0 are the working pins — frozen.
- One canonical tree (AntiGravity\MDxCAI\Source); ClaudeCode\CAI-AIP archived.
- Real A2A, not faked. Tools stubbed = OK but always `[Simulated]`-labeled; never claim a tool acted.
- Submit ONLY from the clean public repo; never the old secrets-laden private `certaintyai`.
- Bug-5 / dead-patch "cleanup" is abandoned — caused regressions; not worth it.
