# CertaintyAI — Project Context

> **Drop this file at the root of your project folder.**
> `C:\Project\MDx-CoPilots\Copilots\AntiGravity\MDxCAI\Source\CONTEXT.md`
>
> Claude Cowork will read this on every turn. It is the source of truth
> for *what we are building and why*. The `INSTRUCTIONS.md` file is the
> source of truth for *how to build it, step by step*.

---

## 1. Product

**CertaintyAI** is an ontology-driven Enterprise AI platform from
**MDxBlocks Inc.** It transforms fragmented enterprise data into
governed, explainable, operational intelligence for regulated
industries (healthcare, education, cybersecurity, finance, IT
consulting).

The *killer feature* for the demo is the **AI Readiness Assessment
Report** — a user takes a 2-minute survey, and the platform instantly
generates a professional, print-friendly HTML report with four
deliverables.

## 2. The Demo Target (Tomorrow)

A working, locally-runnable web app that proves the killer feature:

1. **Landing page** — value prop, partnerships, interactive ontology
   graph, CTA to the survey.
2. **2-minute survey** — multi-step wizard collecting industry, AI
   maturity, data state, governance, and blockers.
3. **AI Readiness Report** — generated on submit, rendered as a styled
   HTML page in the browser, containing the four Amsys deliverables:
   - Current State Analysis
   - Data Maturity Review (with Semantic Fragmentation Score)
   - Findings Report (strengths, risks, prioritized recommendations)
   - Executive Scorecard (final score + business impact)
4. **Auth** — JWT signup/login with a demo-users seed file. Profile
   page with password change.

Anything beyond this list is **Phase 2** (post-demo). See section 6.

## 3. Differentiation Story (for the demo narrative)

When the audience asks *"why not Palantir or Fluree?"*:

| | Palantir Foundry | Fluree | **CertaintyAI** |
|---|---|---|---|
| Target | Top 1% enterprises | Decentralized graph users | **Mid-market regulated industries** |
| Cost / complexity | Very high | Niche | **Accessible** |
| Ontology | Closed, proprietary | RDF triples, decentralized | **Open, domain-tuned, explainable** |
| AI approach | AIP decision automation | GraphRAG for hallucination | **Agentic + GraphRAG + Human-in-loop** |
| Deployment | Enterprise-only | Self-hosted | **Hybrid / multi-cloud / on-prem** |

We are **not** trying to out-Palantir Palantir. We are democratizing
ontology-driven AI for the next 9,000 companies down-market.

## 4. The Ontology Story (what the landing-page graph visualizes)

CertaintyAI's architecture treats **Ontology as a real architectural
layer** sitting between enterprise data and AI reasoning. The graph
on the landing page should show this layer with example entities from
multiple regulated domains:

- **Healthcare:** Patient → Encounter → Condition → Observation → Medication → Provider
- **Education:** Student → Course → Assessment → Attendance → Learning Gap → Teacher
- **Cybersecurity:** Asset → Identity → Vulnerability → Threat Actor → Alert → Incident → Risk
- **FinOps:** Account → Cost Center → Budget → Expense → Forecast → Anomaly
- **IT Consulting:** Engagement → Client → Project → Workstream → Deliverable → Resource

A zoomable, interactive force-graph (`react-force-graph-2d`) with
nodes colored by domain. The visual *is* the differentiation.

## 5. Tech Stack (Phase 1 — Demo)

Locked in for tomorrow. **Do not deviate without asking.**

**Frontend**
- Vite + React 18 + TypeScript optional (JSX is fine, ship faster)
- Tailwind CSS for styling
- React Router v6
- Axios for API calls
- `react-force-graph-2d` for ontology visualization
- React Hook Form for the survey wizard

**Backend**
- Python 3.10+
- FastAPI + Uvicorn
- SQLAlchemy + SQLite (file: `backend/data/certaintyai.db`)
- Pydantic v2 for schemas
- `python-jose[cryptography]` for JWT
- `bcrypt` (used directly) for password hashing —
  *deviation from the original `passlib[bcrypt]` plan: passlib 5.x's
  bcrypt backend init crashes on modern bcrypt's 72-byte hard cap.
  `auth.py` calls `bcrypt.hashpw` / `bcrypt.checkpw` directly. Cap of
  72 bytes is enforced defensively in `hash_password` and `verify_password`.*
- `anthropic` (official Python SDK) — using model `claude-sonnet-4-6`
- `openai` SDK kept as an optional provider (see §11). Default in code
  is Anthropic; a single env var (`LLM_PROVIDER`) switches backends.
- `jinja2` for the report template

**Agentic layer (Phase 1)**
- Pragmatic: **Anthropic tool-use (function calling)** with three
  named "agents" implemented as tool functions called by one
  orchestrator Claude call:
  - `ScoreCalculationAgent` — deterministic Python, computes the
    Semantic Fragmentation Score and Executive Score from survey
    answers. No LLM. Always cited as "the deterministic scoring
    engine" in the demo.
  - `InsightsGenerationAgent` — Claude call that produces strengths,
    risks, and recommendations as structured JSON.
  - `NarrativeAgent` — Claude call that turns scores + insights into
    the report's prose sections.
- The orchestrator is `ReadinessReportAgent` — a single Python
  function that calls the three sub-agents in sequence. In the demo
  narrative, call this a "multi-agent system." It is — just lightweight.

This is honest in code (no fake ADK), demo-credible (the architecture
diagram in the slides shows ADK/A2A/MCP as Phase 2), and swappable.

**Auth**
- JWT bearer tokens, 24-hour expiry
- Demo users seeded from `backend/data/demo_users.json` at startup
- Email + password; no email verification for demo

## 6. Explicitly Deferred to Phase 2 (post-demo)

So Cowork doesn't get distracted:

- ❌ Google ADK (real Agent Development Kit)
- ❌ A2A protocol implementation
- ❌ MCP server / client integration
- ❌ pgvector / PostgreSQL / agentic memory
- ❌ Docker / docker-compose (run with `uvicorn` and `npm run dev`)
- ❌ Real GraphRAG / knowledge-graph store (the landing-page graph
  is a static JSON visualization, not a queryable graph DB)
- ❌ Human-in-the-loop approval workflows
- ❌ Production observability / drift detection

The architectural *story* (the 10-layer diagram in the slides) covers
all of this. The *code* covers Phase 1.

## 7. File Layout

```
CAI-AIP/Source/
├── CONTEXT.md                     ← this file (source of truth for *what*)
├── INSTRUCTIONS.md                ← the step-by-step build plan
├── README.md                      ← run commands + demo login
├── .gitignore                     ← also excludes .env.local, .env.*
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── conftest.py                ← adds backend/ to sys.path for pytest
│   ├── data/
│   │   ├── demo_users.json        ← seeded users (5)
│   │   └── certaintyai.db         ← created on first run, gitignored
│   ├── tests/
│   │   └── test_score_agent.py    ← pytest cases for ScoreCalculationAgent
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                ← FastAPI entrypoint (lifespan = create_all + seed)
│   │   ├── config.py              ← Pydantic settings (env vars, LLM provider)
│   │   ├── database.py            ← SQLAlchemy engine + session + get_db dep
│   │   ├── models.py              ← User, Assessment ORM models
│   │   ├── schemas.py             ← Pydantic v2 request/response models
│   │   ├── auth.py                ← JWT + bcrypt (direct, not passlib)
│   │   ├── seed.py                ← seeds demo_users + one demo assessment
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py    ← ReadinessReportAgent
│   │   │   ├── score_agent.py     ← deterministic scoring
│   │   │   ├── llm_client.py      ← provider abstraction (OpenAI | Anthropic)
│   │   │   ├── insights_agent.py  ← strengths/risks/recommendations JSON
│   │   │   ├── narrative_agent.py ← four prose paragraphs
│   │   │   └── prompts.py         ← strict-JSON system prompts
│   │   ├── report/
│   │   │   ├── __init__.py
│   │   │   ├── template.html      ← Jinja2 template (built from scratch, inline CSS)
│   │   │   └── renderer.py        ← render_report + render_error_page
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py            ← /auth/signup /login /me /change-password
│   │       ├── survey.py          ← POST /survey → orchestrator → save HTML
│   │       └── report.py          ← GET /report (list), /report/{id} (HTML), /report/{id}/data (JSON)
└── frontend/
    ├── package.json
    ├── package-lock.json          ← committed
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html                 ← favicon + title set
    ├── .env.example
    ├── public/
    │   └── favicon.svg            ← cyan dot, matches brand
    └── src/
        ├── main.jsx
        ├── App.jsx                ← routes + AuthProvider + ErrorBoundary
        ├── index.css
        ├── lib/
        │   ├── api.js             ← axios + bearer interceptor + 401 redirect
        │   └── ontologyData.js    ← 32 nodes / 31 links for the graph
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Survey.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Profile.jsx        ← account + assessments list + change password
        │   └── Report.jsx         ← iframe srcDoc + Print toolbar
        └── components/
            ├── Navbar.jsx
            ├── Hero.jsx
            ├── AboutSection.jsx
            ├── OntologyGraph.jsx
            ├── ProtectedRoute.jsx
            ├── ErrorBoundary.jsx  ← class component, wraps <Routes>
            └── survey/
                ├── Primitives.jsx ← Toggle, StarRating, RadioCards, CheckboxList
                ├── SurveyWizard.jsx
                ├── StepIndustry.jsx
                ├── StepMaturity.jsx
                ├── StepData.jsx
                ├── StepGovernance.jsx
                └── StepReview.jsx
```

## 8. Survey Schema (single source of truth)

The survey collects this exact JSON shape. Both the wizard and the
scoring agent depend on these field names:

```json
{
  "industry": "healthcare | education | cybersecurity | finops | itconsulting | other",
  "company_size": "1-50 | 51-250 | 251-1000 | 1000+",
  "ai_maturity": "exploring | piloting | scaling | optimizing",
  "data_state": {
    "sources_count": 1-50,
    "structured_pct": 0-100,
    "siloed": true|false,
    "quality_rating": 1-5
  },
  "governance": {
    "has_data_governance": true|false,
    "has_ai_policy": true|false,
    "regulated": true|false,
    "compliance_frameworks": ["HIPAA", "GDPR", "SOC2", "ISO27001", "FERPA", ...]
  },
  "current_blockers": ["data_silos", "no_ontology", "skills_gap", "budget", "leadership", "compliance_risk", ...],
  "ai_use_cases": ["copilot", "automation", "analytics", "decision_support", ...]
}
```

## 9. Scoring Algorithm (deterministic, no LLM)

The `ScoreCalculationAgent` implements this exactly. Documented here
so we can defend the numbers in the demo:

**Semantic Fragmentation Score (0–100, higher = more fragmented = worse)**
- Base: `sources_count * 1.5`
- `+ 20` if `siloed == true`
- `+ (100 - structured_pct) * 0.2`
- `+ 15` if no data governance
- Clamped to 0–100

**Executive Readiness Score (0–100, higher = more ready)**
- Maturity baseline: exploring=20, piloting=40, scaling=65, optimizing=85
- `+ 10` if has data governance
- `+ 10` if has AI policy
- `+ 5` per compliance framework (cap at 15)
- `- (fragmentation_score * 0.3)`
- `- 5` per blocker (cap at -25)
- Clamped to 0–100

**Maturity Tier** (derived from Executive Score)
- 0–25: *Nascent* — "AI is a discussion, not a discipline."
- 26–50: *Emerging* — "Pilots exist, but no operational backbone."
- 51–75: *Operational* — "AI delivers value; governance is catching up."
- 76–100: *Optimized* — "AI is a governed, compounding capability."

## 10. Demo Users (seed)

Five users in `demo_users.json`. Password for all demo accounts:
`Certainty2026!`

| Email | Role (cosmetic) |
|---|---|
| `demo@mdxblocks.com` | Demo Admin |
| `cto@acmehealth.com` | Healthcare CTO |
| `dean@stateuniversity.edu` | Education Leader |
| `ciso@fintrust.com` | Cybersecurity Leader |
| `pm@itconsult.io` | IT Consulting PM |

Stored hashed (bcrypt) in the DB at startup if not already present.

## 11. LLM Configuration

Both LLM agents (`insights_agent`, `narrative_agent`) call a single
provider-agnostic entry point: `app.agents.llm_client.complete_json(...)`.
That function dispatches to whichever backend the `LLM_PROVIDER` env
var names. Switching providers is one env var; the agent code never
imports a vendor SDK directly.

**Default provider — on-spec (Anthropic)**
- `LLM_PROVIDER=anthropic`
- **Model:** `claude-sonnet-4-6`
- **SDK:** `anthropic` (official Python)
- **API key:** `ANTHROPIC_API_KEY`
- **Max tokens:** 1500 for insights, 2500 for narrative

**Alternate provider — local dev override (OpenAI)**
- `LLM_PROVIDER=openai`
- **Model:** `gpt-4o-mini` (override via `OPENAI_MODEL`)
- **SDK:** `openai`
- **API key:** `OPENAI_API_KEY`
- Uses `response_format={"type": "json_object"}` to force valid JSON output
- **Why this exists:** for dev environments that only have an OpenAI key.
  Both system prompts include the word "JSON" so OpenAI's JSON mode is
  satisfied. Switching back to claude-sonnet-4-6 is a one-line revert
  in `.env`.

**Shared rules (both providers)**
- System prompts live in `backend/app/agents/prompts.py` (strict-JSON contracts).
- Env vars loaded via `pydantic-settings` from `backend/.env`.
- **Never** commit `.env`. Only `.env.example` is in git. `.gitignore`
  also excludes `.env.local` and `.env.*` (so Vite's local override
  file can't leak either).
- If the LLM call fails, parses badly, or returns an empty response,
  the agent returns a safe-default JSON of the same shape and logs a
  warning. The orchestrator's outer try/except converts any deeper
  failure into `render_error_page(...)` so a survey submission never
  returns a 500. The demo never crashes on an LLM hiccup.

## 12. Look & Feel

- Tailwind dark-neutral palette with a single accent. Suggested:
  background `#0B1220`, panel `#0F172A`, accent `#22D3EE` (cyan-400)
  or `#A78BFA` (violet-400). Pick one and stay consistent.
- Inter or Geist font (Google Fonts link in `index.html`).
- The landing page should feel like a 2026 enterprise AI product —
  generous whitespace, big typography, one strong visual (the graph).
- The report should feel like a McKinsey deliverable — serif headings
  optional, print-ready, A4-friendly margins.

## 13. Definition of Done (for Phase 1)

The demo is ready when, from a clean clone:

1. `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload` starts the API on `:8000`.
2. `cd frontend && npm install && npm run dev` starts the UI on `:5173`.
3. Opening `http://localhost:5173/` shows the landing page with a
   working interactive ontology graph.
4. Clicking the CTA takes you to `/signup`, where any new email +
   password ≥ 8 chars works.
5. After signup you land on `/survey` and walk through all 5 steps.
6. Submitting the final step shows a loading state, then renders the
    AI Readiness Report at `/report/:id` inside the app — with real
    scores, real recommendations, and the CertaintyAI-styled HTML.
7. Logging out and logging back in as `demo@mdxblocks.com` /
   `Certainty2026!` works and shows the same report on `/profile`.

If any of these fail, fix them before declaring done.

## 14. Status & Deviation Log

**Phase 1 status:** shipped. All 7 Definition-of-Done items above are met.

**Repo:** <https://github.com/mdxblocks-ai/certaintyai> (private,
under the mdxblocks-ai org). Root commit `2cf6d89` — "Initial CertaintyAI
commit", 64 files. INSTRUCTIONS.md captures the eight-step build path
that produced this commit.

**Sanctioned deviations from the original spec** (every one approved
in conversation; details captured in code comments on the relevant files):

| Area | Original spec | Actual | Why |
|---|---|---|---|
| Password hashing | `passlib[bcrypt]` | `bcrypt` direct | passlib 5.x's bcrypt init self-test hashes a 73-byte password, which modern bcrypt now hard-rejects with a 72-byte cap. `auth.py` calls `bcrypt.hashpw`/`checkpw` directly and defensively truncates to 72 bytes. |
| LLM provider | `anthropic` only | Provider abstraction (default Anthropic, OpenAI override) | Dev environment had an OpenAI key but no Anthropic key. `llm_client.py` keeps the agent code provider-agnostic; one env var flips back to claude-sonnet-4-6 with zero code change. |
| Report template | "paste your CertaintyAI HTML into template.html" | Template built from scratch | No CertaintyAI HTML to paste. Hand-authored a McKinsey-style template with inline CSS, dark on-screen / light for print. Same Jinja2 placeholder names as the prompt called for, so swapping in CertaintyAI HTML later is a straight conversion. |
| Local ports during build | `:8000` / `:5173` | Briefly `:8001` / `:5174` | Kong (in Docker Desktop) was holding `:8000`/`:8001` on the dev box. Reverted to `:8000`/`:5173` after Docker was stopped. CONTEXT remained the spec target the whole time. |

**Phase 2 items in §6 remain deferred** — none of them shipped.

---

*End of CONTEXT.md. The next file Cowork should read is `INSTRUCTIONS.md`.*


## 15. Phase 1.5 Co-Brand Updates (post-Phase 1.5)

After Phase 1.5 shipped (`d0e882d`), two rounds of Co-Brand polish
landed on top.

### 1.5.3–1.5.12 — Landing-page redesign (commit `8c6621e`)

- Real CertaintyAI / MDxBlocks hexagonal mark replaces the SVG
  approximation. Cyan / navy / white / favicon PNG variants in
  `frontend/public/`. `LogoMark` is now an `<img>` wrapper with a
  `variant` prop.
- Brand-first **CertaintyAI** eyebrow on the Hero; single primary CTA.
- Hero **left** column: inline tilted `ReportPreview` ("What you'll
  get") below the CTA — visitors see the actual deliverable on the
  same screen as the pitch.
- Hero **right** column: industry picker drives a personalized
  narrative + filtered force-graph. Eyebrow, headline, paragraph and
  "controls applied" all rewrite per industry. Live
  entity/relationship counts. Healthcare is the default so the page
  never opens on the busy six-domain entry state.
- Added **BFSI (Banking & Financial Services)** as a seventh ontology
  domain — `Customer → Account → Transaction → Loan → Credit Risk →
  AML Alert` — with a sky-blue accent (`#38BDF8`).
- New **Architecture** section: 5-layer stack diagram + 6 capability
  cards + W3C / GraphRAG / MCP / HITL chips. Distilled from
  open-architecture and semantic-layer industry research.
- "Assessment" nav link renamed to **AI Readiness** for clarity.
- `OntologyGraph` accepts an optional `graphData` prop for
  parent-driven filtering. `ReportPreviewModal` and standalone
  `OntologySection` components kept on disk for future use (not
  imported by `Landing.jsx` currently).
- **Per project policy: no competitor or vendor name lands on the
  page.**

### 1.5.13 — Report template rearrangement for C-suite arc

Same committed visual style (gradients, score ring, emoji headers,
colored cards). Sections **rearranged** so they answer the questions
a C-suite reader is silently asking, in this order:

1. **Hero** — cover + score ring + executive-summary paragraph.
2. **📌 Executive Briefing** — BLUF + 3 KPI tiles, including a
   green-accented **Net 90-Day Value** money tile (replaces what was
   previously *NIST Measure* — that moved into the methodology block).
3. **📥 You Told Us** (was *Strategic Context*) — promoted to
   position 3 so visitors feel **heard** before any recommendation
   appears.
4. **📈 Where You Stand vs Peers** — peer benchmark promoted from
   position 10 to position 4.
5. **💰 What You Can Win in 90 Days** — $ roadmap promoted from
   position 11 to position 5.
6. **✅ Three Decisions on Your Desk This Week** — new section.
   Three `decision` cards (Owner / Cost / Value / Risk-if-delayed)
   drawn from the first three phases of `value_roadmap`. Decision 02
   carries a `HIGHEST IMPACT` badge in emerald.
7. **🔍 Findings** — strengths / gaps two-column.
8. **📋 All Prioritized Recommendations** — the full five, explicitly
   framed as *"the first three are the C-suite decisions above; the
   next two compound on them."*
9. **How We Believe These Numbers** divider tile, then the
   methodology block (📊 Current State · 🗄️ Data Maturity · 🛡️ NIST
   Function Scores · 📐 Frameworks · 🧾 Evidence Pack) — the
   auditor's section.
10. ⚖️ Regulator-specific notes · CTAs · colophon.

Also: **removed the broken `🔁 Start Over` CTA**. The link lived
inside the report's `<iframe srcDoc>` content; clicking it navigated
the iframe (not the parent React app) to `/survey`, which doesn't
exist on the FastAPI backend that serves the iframe content — so the
iframe went blank. The Navbar's "AI Readiness" link covers the
"start over" path correctly because it lives in the parent React
app, outside the iframe.

**No backend code touched in this rearrangement** — drop-in
compatible with the existing `renderer.py`. New visual additions
(`decisions` cards, `methodology-anchor` divider tile, money-accented
stat tile) live in the same `<style>` block as the original CSS, with
the same `:root` design tokens.

**Self-contained preview:** `Sample-AI-Readiness-Report-ACME.html` at
the repo root is a base64-inlined render of the new template against
the original ACME test data — opens in any browser without the
backend.

### 1.6 — Centered Open Architecture Stack & Interactive User Representation

- **Removed Redundant Left Panel**: Completely removed the redundant left-side Data Sources accordion panel to eliminate layout duplication and clean up the page.
- **Centered SVG Stack**: Centered the 3D isometric stack SVG at full width (`max-w-3xl mx-auto`) inside the upper portion of the Architecture card for visual focus.
- **Multi-User Type Representation**: Split the single "Business and Tech Users" capsule at the very top into two distinct user-type capsules side-by-side:
  - **Business Users** (custom Briefcase SVG icon, cyan neon accent theme, dark teal glassmorphic body)
  - **Technical Users** (custom Code brackets SVG icon, indigo neon accent theme, dark indigo glassmorphic body)
  - Both are connected to the central stack core via two glowing curved connector paths (`M 265,41 C 265,58 350,58 390,62` and `M 515,41 C 515,58 430,58 390,62`).
  - Added interactive CSS hover states so that hovering over the capsules dynamically scales up their icons and brightens their neon borders/glow.
- **C-Shaped Ingestion Path**: Drawn a pulsing C-shaped Bezier path on the left (`M 290,310 C 200,310 200,200 290,200`) connecting Plate 1 (Data Sources) directly to Plate 3 (Ontology Layer).
- **Polished Text Placements**:
  - Shifted the **Data Sources** text label and pointer line to the **left side** of the stack at `y=310` to visually balance CertaintyAI (`y=145`) on the left, completely resolving label crowding on the right.
  - Standardized all 5 pointer lines to be strictly horizontal and vertically centered to their plates:
    - **AI Agent Orchestrator**: Centered at `y=90` (Pointer: `M 450,90 L 560,90 L 580,90`, Text title: `y=87`, subtitle: `y=100`)
    - **Ontology Layer**: Centered at `y=200` (Pointer: `M 450,200 L 560,200 L 580,200`, Text title: `y=197`, subtitle: `y=210`), restoring standard title-on-top reading flow.
- **4-Column Data Streams Dashboard**: When the bottom Data Sources plate is active, a structured 4-column streams dashboard renders in the bottom components area showing all 22 custom feeds with bespoke vector icons.

---

*End of Phase 1.6 updates. Phase 2 items in §6 remain deferred.*

## 16. Track 3 Compliance Refactor (Phase 1.7)

To satisfy the strict requirements of the **Google for Startups AI Agents Challenge - Track 3 (Refactor/Marketplace Ready)**, the platform underwent a comprehensive architectural refactor. This phase promotes the application from a local prototyping staging state into a highly structured, enterprise-ready, containerized local production layout.

### 16.1. Reasoning Engine Swapped to Google Gemini 1.5 Pro
- Swapped active reasoning LLM endpoints from Anthropic/OpenAI to the official **Google Gemini 1.5 Pro** utilizing the `google-generativeai` SDK.
- Implemented `_complete_gemini` within `agySource/backend/app/agents/llm_client.py` using official Gemini tools and direct JSON schema completion.
- Extended backend `config.py` with standard configurations for `gemini_api_key` and fallback mechanism if key is omitted.
- Enabled seamless environment-based switching by setting `LLM_PROVIDER=gemini` in production.

### 16.2. Cryptographic Agent Identity & Agent-to-Agent (A2A) Protocol
- Exposed a fully standard-compliant `a2a` router (`agySource/backend/app/routers/a2a.py`) offering secure API handshakes and cross-agent coordination:
  - **`GET /a2a/identity`**: Exposes the unique, cryptographically signed SHA-256 Agent Identity Key generated from core agent metadata and signed using a secure algorithm (with mock PEM verification public key support).
  - **`GET /a2a/discovery`**: Details the agent type, supported protocols (`A2A-1.0`, `MCP-2024`, `VertexAI-ADK`), and functional intents (`CalculateAIReadiness`, `QueryDomainOntology`, `AnticipateOccupancyResourceScaling`).
  - **`POST /a2a/coordinate`**: Standardized command channel accepting cross-agent triggers. Simulates the showcase use case of a smart HR facility agent reporting an occupancy spike, prompting CertaintyAI to pre-cool server rooms, autoscale GKE backend replicas, and shift FinOps thresholds to save overhead.

### 16.3. SQLite Swapped to Containerized PostgreSQL Production Database
- Replaced the file-based SQLite database with a production-grade containerized PostgreSQL instance to support high-concurrency enterprise workloads.
- Migrated environment configurations to use PostgreSQL connection strings (`postgresql://...`).
- Configured PostgreSQL inside the containerized production docker stack, backed by a persistent `pgdata` volume to cache ontology records and assessments.
- Integrated `psycopg2-binary` as the production database driver in `requirements.txt`.

### 16.4. Docker Containerization & Port Mapping (No Host Conflicts)
- Created a production-grade containerized orchestration layout using `docker-compose.prod.yml` at the root/deployment strategy levels.
- Resolved local port conflicts by cleanly mapping:
  - **FastAPI Backend**: Internal port `8000` mapped to host port `8080`.
  - **Vite React Frontend**: Built statically using Nginx, mapping internal port `80` to host port `8081`.
  - **PostgreSQL Database**: Port `5432` mapped internally with persistent volumes.
- Configured CORS middleware in `agySource/backend/app/main.py` to allow origins from the production frontend (`http://localhost:8081`).
- Baked the correct target API URL (`VITE_API_BASE_URL=http://localhost:8080`) into the Vite React static bundle using `frontend/.env.production`.

### 16.5. Compliance & Submission Artifacts
- Created and compiled high-fidelity, comprehensive compliance matrices and documents at `deploymentstrategy/`:
  - **`certaintyai_track3_refactor_checklist.xlsx`**: Detailed compliance verification sheet mapping each Track 3 criterion to its verification status (with external cloud setups like GKE set to `PENDING` for local staging accuracy).
  - **`deployment_strategy.pdf`**: In-depth description of the enterprise architecture, deployment strategy (GCP/GKE), database choices, and system design.
  - **`certaintyai_devpost_submission.pdf`**: Direct copy of all submission-field alignments and pitch documentation for the Devpost portal.

---

*End of Phase 1.7 / Track 3 updates. GKE and multi-cloud GKE deploy targets remain mapped in our cloud architecture blueprints.*

## 17. Anti-Gravity 2.0 AI Copilot Workspace (Phase 1.8)

To deliver a premium, modern, and highly responsive user experience matching design standards set by ChatGPT, Gemini, Claude, and Perplexity, the CertaintyAI platform underwent a hard architectural rebuild of its Home page body from scratch.

### 17.1. Rebuilt Copilot-First Home Workspace
- **Complete Report Pruning on Load:** Removed all pre-loaded and auto-generated report containers, executive summaries, assessment tables, and score metrics from the initial landing view. Reports are now rendered inside the conversation thread *only* when explicitly requested by the user.
- **Pristine Welcomes & 6 Starter Prompts:** Renders a clean vertical stack: "Welcome back. How can I help you today?" along with exactly the 6 strategic assessment cards requested. These starter prompts are immediately dismissed upon the user's first query submission.
- **Dynamic Contextual Follow-up Prompts:** Generates up to 6 context-aware follow-up prompts beneath the latest assistant response bubble to guide the next strategic business action.
- **Collapsible Sessions Sidebar:** Constrained width (maximum 250px) that collapses into an icon-only narrow view on click, showing full session titles on hover.
- **Left-Aligned Chat Input Box:** Moved the chat prompt container to start closer to the Sessions sidebar panel, utilizing full screen width and eliminating empty gaps.
- **Global Floating Assistant Bot:** Replaced all permanent widgets, ecosystems, and partner cards with a single collapsed-by-default floating circular bot icon in the bottom-right corner.

### 17.2. DevOps Cache Controls & Authenticated Redirects
- **Nginx Cache-Busting Headers:** Updated `nginx.conf` in Nginx static frontend images to inject strict `Cache-Control` no-cache headers on all `.html` files. This prevents browser caching of old compiled JS bundles and ensures immediate client updates.
- **Authenticated Landing Redirects:** Configured a react-router effect on the landing page `/` that automatically detects logged-in user tokens and redirects them immediately to the `/dashboard?tab=home` Copilot workspace.
- **`localStorage` Legacy Report Sanitation:** Clears out old message strings containing report structures during session load to ensure a pristine empty startup.

## 18. Phase 1.8.1 / Anti-Gravity 2.1 UI Polish & White-labeling (Completed)

To prepare CertaintyAI for the official hackathon submission under the Google for Startups AI Agents Challenge, the UI went through an extensive visual and functional refinement phase. This phase focused on maximizing screen real estate, dynamic context-aware automation, and high-fidelity white-labeling.

### 18.1. Layout Optimization & Screen Real Estate (First-Fold Focus)
- **Eliminated Sidebar Clutter:** Removed the redundant/duplicate brand header inside the sidebar layout (`Observer Console / MDxBlocks Hub`). Navigation now sits neatly at the very top of the viewport, eliminating duplicate brand headers since the main top navbar already prominently renders the brand mark.
- **Header & Subhead Alignment:** Renamed the remaining sidebar labels to "CertaintyAI Hub" and "MDxBlocks Hub" to align with branding guidelines.
- **Dynamic Category Badging:** Configured a reactive, state-bound category badge mapping in the header toolbar that adapts instantly to the user's active viewport tab (e.g. `🛡️ Readiness & Governance` for the AI Readiness wizard, `💎 Strategic Advisory Portfolio` for the Strategy tab, and `Live Observability Core` for the Observability view).
- **First-Fold Spacing Hotfix:** Relocated the AI Readiness Assessment Wizard header, description, and sub-title out of the nested cards and placed them directly into the standard unified toolbar summary row.
- **Flattened Padding Wrappers:** Streamlined the SurveyWizard layout by flattening nested card borders and excessive double padding wrappers, saving over 100px of vertical space and letting the wizard render at the top-fold without requiring immediate scrolling.

### 18.2. Dynamic, Context-Aware Voice Assistant Integration
- **Exposed Dynamic Viewport Observer:** Leveraged a React-based `useEffect` hook in the main `Dashboard.jsx` component that reactively monitors state changes across `activeTab` and `dashboardSubTab` parameters.
- **Dynamic Contextual Welcome Greetings:** Programmatically adjusts the initial welcome speech/text of the collapsible floating Voice AI Assistant widget to reflect the exact viewport context:
  - **Strategy Tab:** Invites queries regarding the strategic roadmaps and cooperative catalogs.
  - **Observability Tab:** Welcomes analysis requests for multi-cloud cost efficiency, model latencies, or FinOps telemetry.
  - **Readiness Tab:** Invites inspection of maturity scores, HIPAA/SOC2 compliance, and high-risk assessment gaps.
- **Contextual Starter Prompt Pills:** Injects dynamic quick-command buttons under the floating assistant widget (e.g., `🚀 Explain Roadmap` on Strategy; `🛡️ HIPAA Compliance` on Readiness; `💰 FinOps Efficiency` on Observability) that directly execute corresponding queries in the assistant conversation.

### 18.3. White-Labeling & Cooperative AI Solutions Catalog
- **Anonymized Direct Partner References:** Replaced all hardcoded, direct references to specific partner vendor entities (`Amsys`) with generic, cooperative terminology to preserve strict white-labeling integrity for prospective clients.
- **GSA Schema Compliance:** Re-indexed all pre-negotiated GSA schedule references to a secure white-label standard: `#GS-35F-COOP`.
- **Cooperative Procurement Intake Modal:** Built an interactive side-over slide-in modal showcasing blended labor rates ($185/hr - $210/hr) across specialized roles (AI Strategist, AI Architect, Data Scientist, ML Engineer, Cybersecurity AI Specialist) alongside intake confirmation verification toasts.

## 19. Phase 1.8.2 / Global Voice AI Assistant & Tab-Navigation Sync (Completed)

To deliver a premium, seamless user experience, the Voice AI Assistant's visibility and lifecycle management were fully optimized to align with strategic navigation requirements.

### 19.1. Global Availability across Workspace Tabs
- **Global Rendering:** Restored full visibility of the floating Voice AI Assistant widget and toggle button across all tabs (Home, Dashboard, and AI Readiness) by removing restrictive layout wrappers.
- **Persistent Toggle Button:** The pulse indicator button remains anchored in the bottom-right of the screen globally, ensuring that a user can access the assistant at any point in their workflow.

### 19.2. Real-Time Tab Navigation Sync & State Cleanup
- **Unified Tab-Change Effect:** Configured a React `useEffect` listener bound to `[activeTab, dashboardSubTab]` that acts as an orchestration hub:
  - **Voice Bleed Mitigation:** Instantly terminates any active Speech Synthesis playback upon tab change to prevent old content from speaking over a newly navigated viewport.
  - **Dynamic Welcome & Prompt Reset:** Automatically resets the conversational text transcript (`agentText`) to match the new tab's contextual welcome greeting, ensuring that navigating between Dashboard, AI Readiness, and Home feels intuitive and contextual.
  - **VAD Silence & Mic Reset:** Clears out old recording timers, resets active voice activity detection (VAD) loops, stops active recognition listening, and resets the UI state back to idle, ensuring a flawless conversational experience.

## 20. Role-Aware Scenario Questions & Trimmed C-Suite Intake (Phase 1.8.3)

To ensure high-fidelity strategic alignment, the platform implements specialized role-based paths for assessment intakes:
- **Tailored Role Ingestions:** When starting a survey, selecting the role of **Security Director / CISO** or **CFO** dynamically loads tailored scenarios and custom assessment questions.
- **Question Generation & Caching:** The `/generate-questions` endpoint in [survey.py](file:///C:/Project/MDx-CoPilots/Copilots/AntiGravity/MDxCAI/Source/backend/app/routers/survey.py) implements caching keyed by signature (`orgType|domain|role`) and falls back to:
  - `CISO_TEMPLATE_QUESTIONS` for CISO/Security roles, focusing on AI security incident response, sensitive data classification/encryption/leakage prevention, GraphRAG boundary defenses, shadow-AI governance, and audit logging of model decisions.
  - `CFO_TEMPLATE_QUESTIONS` for CFO/Financial roles, focusing on token throttling, measured payback tracking, ledger consistency, transactional data grounding, and ROI accountability.
  - `DEFAULT_TEMPLATE_QUESTIONS` for general roles.
- **Dynamic Score Processing:** Dynamic scores calculated server-side in `calculate_dynamic_scores` are integrated with the orchestrator to synthesize role-aligned prose and insights.

## 21. Live Cloud Run Production Deployment (Phase 1.9)

The platform was successfully containerized, built, and deployed to Google Cloud Run in the GCP production project `certaintyai-prod` (region `us-central1`), ensuring secure public availability:
- **FastAPI Backend Service (`certaintyai-backend`):** Deployed and configured with active reasoning via Google Vertex AI / Gemini 1.5 Pro (`LLM_PROVIDER=gemini`) and connected to the hosted production database.
- **Vite React Frontend Service (`certaintyai-frontend`):** Served statically via Nginx with custom cache-busting headers to prevent browser caching of old assets. Configured to query the live backend URL (`https://certaintyai-backend-217783557903.us-central1.run.app`).
- **Production CI/CD Registry:** Images are built and pushed to the `certaintyai` Artifact Registry repository.

