# CertaintyAI — Project Audit

**Audit Date:** 2026-06-12
**Branch:** `feature/agent-builder`
**Audit Panel (composite perspective):** Enterprise SaaS Product Strategist · Enterprise AI Architect · Venture Capital Advisor · Google Startup Challenge Judge · Snowflake Startup Challenge Judge
**Scope:** `frontend/`, `backend/`, `AgentBuilder/`, `Docs/`, `Context/`, `README.md`, `SUBMISSION.md`, `Deploymentstrategy/`
**Status:** Read-only analysis. No source files modified.

---

## 1. Technology Stack

### 1.1 Frontend
| Concern | Choice |
|---|---|
| Framework | React 18.3.1 (functional, hooks) |
| Build / Dev server | Vite 5.4.x |
| Routing | `react-router-dom` 6.26 (SPA, `BrowserRouter`) |
| Styling | Tailwind CSS 3.4 + custom CSS variables (parchment + dark themes) |
| Forms | `react-hook-form` 7.53 |
| HTTP | Axios 1.7 with Bearer-token interceptor (`src/lib/api.js`) |
| Visualization | `react-force-graph-2d` (Ontology graph), hand-rolled SVG (Architecture Stack) |
| Icons | Inline custom SVGs; Tabler Icons CDN (mockup only) |
| Auth state | `AuthContext` (React Context API), JWT stored in `localStorage` |
| Container | Nginx (Alpine), templated `nginx.conf.template`, Cloud Build `cloudbuild.yaml` |

### 1.2 Backend
| Concern | Choice |
|---|---|
| Language / runtime | Python 3.10+ |
| Web framework | FastAPI + Uvicorn (Gunicorn in prod per deployment guide) |
| ORM | SQLAlchemy 2.x (declarative `Mapped[...]`) |
| Validation | Pydantic v2 + `pydantic-settings` |
| Auth | OAuth2 password flow, JWT via `python-jose`, bcrypt password hashes |
| DB (local) | SQLite (`backend/data/certaintyai.db`) |
| DB (prod target) | PostgreSQL + `pgvector` extension (auto-`CREATE EXTENSION` on startup) |
| LLM providers | Anthropic (Claude), OpenAI, Gemini (raw), **Vertex AI (production path)** — switchable via `LLM_PROVIDER` |
| Agent SDK | `google-adk==2.2.0` — `SequentialAgent`, `LlmAgent`, `RemoteA2aAgent`, `InMemoryRunner` |
| A2A SDK | `a2a-sdk==0.3.26` — `to_a2a`, `AgentCard`, JSON-RPC 0.3.0 |
| MCP | `mcp[cli]==1.27.2` — `FastMCP` server (written, not yet wired into runtime) |
| Embeddings | Gemini `text-embedding-004` (768-d), in-memory cosine similarity fallback |
| Reports | Jinja2 HTML template (`app/report/template.html`) + custom `renderer.py` |

### 1.3 Cloud / Deployment
| Concern | Choice |
|---|---|
| Production runtime | Google Cloud Run (two services: frontend + backend, `us-central1`) |
| Project | `certaintyai-prod` |
| LLM auth | Application Default Credentials (service account); no API keys in repo |
| Secrets | Google Secret Manager (planned per deployment strategy) |
| Roadmap | GKE + Helm chart for Marketplace listing; Apigee/Kong API gateway; Cloud SQL HA; Prometheus / Grafana |
| Local prod simulation | `Deploymentstrategy/docker-compose.prod.yml` — `ankane/pgvector` + backend + Nginx frontend |

### 1.4 Open Standards Surface
- W3C semantic ontology vocabulary (referenced)
- NIST AI RMF (`GOVERN`, `MEASURE` sub-scores computed)
- ISO 42001, ISO 27001, EU AI Act, HIPAA, GDPR, FERPA, SOC 2 (mapped in `frameworks.py`)
- A2A protocol v0.3.0 (live cross-process)
- MCP 2024 (tools defined, server not yet bound at startup)

---

## 2. Folder Structure

```
MDxCAI/
├── README.md                       Quickstart, demo login, live URL
├── SUBMISSION.md                   Devpost / Google Challenge proposal (root)
├── LICENSE                         Apache-2.0
├── deploy_both.ps1                 PowerShell deploy script (Cloud Run)
├── Docs/
│   ├── architecture.png            10-layer enterprise stack diagram
│   └── PROJECT_AUDIT.md            ← this file
├── Context/
│   ├── HANDOFF-CONTEXT-2026-06-06.md
│   ├── HANDOFF-CONTEXT-2026-06-08.md   Verified architecture + guardrails
│   └── SUBMISSION.md               Honesty-scrubbed Track 3 narrative
├── Deploymentstrategy/
│   ├── deployment_strategy.md      Enterprise prod-readiness guide
│   ├── deployment_strategy.pdf
│   ├── docker-compose.prod.yml     pgvector + backend + frontend
│   └── certaintyai_track3_refactor_checklist 2.xlsx
├── AgentBuilder/
│   └── certaintyai-agent-builder-mockup.html   Static design mockup
├── backend/
│   ├── Dockerfile                  Multi-stage Python build
│   ├── requirements.txt
│   ├── run_a2a_producer.py         Independent A2A producer process (port 8001)
│   ├── smoke_vertex.py
│   ├── app/
│   │   ├── main.py                 FastAPI bootstrap, CORS, lifespan migrations
│   │   ├── config.py               Pydantic settings (LLM provider switch)
│   │   ├── database.py             Engine + session factory
│   │   ├── models.py               User, Assessment, Agent, AgentDocument, AgentRun, AssessmentMemory
│   │   ├── schemas.py              Pydantic request/response DTOs
│   │   ├── auth.py                 JWT + bcrypt helpers
│   │   ├── seed.py                 Demo user + demo assessment seeding
│   │   ├── mcp_server.py           FastMCP tools (calculate_ai_readiness, query_domain_ontology)
│   │   ├── routers/
│   │   │   ├── auth.py             /auth/signup, /login, /me, /claim-report
│   │   │   ├── survey.py           /survey (legacy) + /survey/adk (ADK pipeline)
│   │   │   ├── report.py           /report/{token}
│   │   │   ├── a2a.py              /a2a/identity, /discovery, /coordinate (legacy A2A)
│   │   │   └── agent_builder.py    /agents CRUD, documents, runs, tools, role-templates
│   │   ├── agents/
│   │   │   ├── orchestrator.py     ReadinessReportAgent (legacy in-process)
│   │   │   ├── adk_pipeline.py     ADK SequentialAgent + A2A consumer (≈900 LOC)
│   │   │   ├── score_agent.py      Deterministic scoring (firewall-protected)
│   │   │   ├── insights_agent.py   Strategic insights LLM call + fallback
│   │   │   ├── narrative_agent.py  McKinsey-style narrative LLM call
│   │   │   ├── agent_runtime.py    Config-driven agent loop (ReAct-style)
│   │   │   ├── frameworks.py       Framework catalog + resolver
│   │   │   ├── gap_analysis.py     Deterministic gap engine
│   │   │   ├── csuite_features.py  Peer benchmark, value roadmap, evidence pack
│   │   │   ├── embedding_service.py Gemini embeddings + cosine memory
│   │   │   ├── llm_client.py       Provider abstraction (openai/anthropic/gemini/vertex)
│   │   │   ├── prompts.py          System prompts (insights, narrative, assessment-gen)
│   │   │   └── security_scanner.py Input sanitization
│   │   ├── report/
│   │   │   ├── renderer.py         Jinja2 renderer
│   │   │   └── template.html       Print-ready McKinsey-style report
│   │   └── data/                   demo_users.json + sqlite db
│   └── tests/                      52 passing / 3 skipped per submission
└── frontend/
    ├── Dockerfile / nginx.conf.template / cloudbuild.yaml
    ├── package.json
    ├── vite.config.js / tailwind.config.js
    ├── public/
    └── src/
        ├── main.jsx / App.jsx
        ├── index.css
        ├── context/                AuthContext, RegionContext
        ├── lib/                    api.js, ontologyData.js, voiceKnowledgeBase.json
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx / Signup.jsx / Profile.jsx
        │   ├── Survey.jsx          (thin wrapper)
        │   ├── Report.jsx          Print-ready report viewer
        │   ├── Dashboard.jsx       5,674 LOC — multi-tab workspace shell
        │   ├── AgentBuilder.jsx    908 LOC — agent CRUD/test UI
        │   ├── Foundry.jsx         Industry foundry landing
        │   └── Architecture.jsx    /architecture mount
        └── components/
            ├── Navbar / Sidebar / Footer / Hero / AuthModal
            ├── ArchitectureStack.jsx   3D isometric SVG stack
            ├── ArchitectureSection.jsx / AboutSection.jsx
            ├── OntologyGraph.jsx       Force-directed graph
            ├── OntologySection.jsx
            ├── ReportPreview / ReportPreviewModal
            ├── ProtectedRoute / ErrorBoundary / LogoMark
            └── survey/
                ├── SurveyWizard.jsx
                ├── StepIndustry / StepMaturity / StepData / StepGovernance / StepReview
                └── Primitives.jsx
```

---

## 3. Existing User Journeys

### 3.1 Anonymous Visitor → AI Readiness Report
1. Lands on `/` (Landing).
2. Clicks **AI Readiness** in navbar or hero CTA → `/survey`.
3. Walks the **SurveyWizard** (5 step components: Industry → Maturity → Data → Governance → Review).
4. Submits → backend `POST /survey/adk` triggers ADK `SequentialAgent` pipeline (scoring → A2A insights → narrative).
5. Backend renders Jinja report HTML, persists `Assessment` with `anon_token`, returns redirect.
6. User views report at `/report/{anon_token}` — Executive Scorecard, NIST sub-scores, peer benchmark, three boardroom decisions, evidence-pack preview, regulator paragraph.
7. Optional: sign up to **claim** the orphan report (`POST /auth/claim-report/{token}` links `user_id`).

### 3.2 New Signup (Unassessed) → Mandatory Intake
1. `/signup` (or `AuthModal`) creates `User` + JWT.
2. `ProtectedRoute` + Dashboard's `SHOW_AI_READINESS_NAV` gate route unassessed users to `?tab=readiness` (survey wizard) until `first_assessment_completed=True`.
3. Role intake exposes **CFO** and **Security Director / CISO** (six other roles config-flag hidden).
4. On submit, JWT-bound `Assessment` is created and the user is unlocked into the full dashboard.

### 3.3 Returning Demo User (`demo@mdxblocks.com`)
1. Login at `/login` → redirected to `/dashboard?tab=home`.
2. Backend `seed_demo_assessment` runs on startup — pre-populated report, scores, semantic-memory embedding.
3. User can navigate Home, Dashboard, Reports, Agent Builder, Control Tower, Integrations, Settings.

### 3.4 C-suite Agent Builder Flow
1. `/dashboard?tab=agent-builder` (or redirect from `/agent-builder`).
2. **Library** view lists user-owned `Agent` records (base "AI Readiness Copilot" auto-created on first list).
3. **Builder** view: select CISO or CFO role template (pre-fills name/desc/instructions/tools/icon), tune temperature & max-steps, toggle voice, attach knowledge-base documents (local upload, SharePoint stub, Portal URL stub).
4. Test panel: send prompt → `POST /agents/{id}/run` → `agent_runtime.run_agent_loop` does RAG over indexed `AgentDocumentChunk` → ReAct-style step trace → outcome + LLM-generated follow-ups.
5. Trace persisted as `AgentRun` (steps array, retrieved sources, status).

### 3.5 Architecture Inspector
- `/architecture` mounts the **ArchitectureStack** — 3D isometric SVG canvas with 6 layers (Data Sources → Cloud Infra → Ontology → CertaintyAI Reasoning → Governance → AI Agent Orchestrator). Hover/click locks a layer; toggle Business vs Technical view; shows component inventory and applicable caps (W3C / GraphRAG / MCP-Ready / Human-in-the-loop / Lineage Tracking / Policy & Audit).

### 3.6 A2A Live Proof (demo path)
1. Run two terminals: `app.main` on 8000 + `run_a2a_producer.py` on 8001.
2. Submitting `/survey/adk` invokes `InsightsRemoteA2aAgent` → fetches `/.well-known/agent-card.json` from 8001 → JSON-RPC task POST → producer runs Gemini via Vertex → returns insights over the wire.

---

## 4. Existing Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `pages/Landing.jsx` | Marketing landing, three "why" cards, industry tiles, hero CTA |
| `/login` | `pages/Login.jsx` | Email + password login |
| `/signup` | `pages/Signup.jsx` | Signup with role |
| `/foundry` | `pages/Foundry.jsx` | Industry foundry teaser |
| `/architecture` | `pages/Architecture.jsx` | 3D isometric stack canvas |
| `/survey` | `pages/Survey.jsx` → `SurveyWizard` | Anonymous-allowed wizard |
| `/report/:token` | `pages/Report.jsx` | Print-ready McKinsey-grade report |
| `/profile` | redirects to `/dashboard` | (legacy) |
| `/dashboard` | `pages/Dashboard.jsx` (5,674 LOC) | Tabbed shell — see below |
| `/agent-builder` | redirects to `/dashboard?tab=agent-builder` | Convenience alias |

### Dashboard tabs (`?tab=`)
- `home` — workspace home
- `dashboard` — AI Readiness Dashboard (charts, forecasts)
- `readiness` — Survey wizard (mandatory until first assessment)
- `reports` — Saved Reports / Assessment History
- `portfolio` (sub-tabs `strategy`, `observability`) — Strategic Advisory & LLM Observatory
- `tasks` — Active background workflows
- `insights` — Industry Benchmark Analytics
- `tools` — Integrated Model Control
- `plugins` — Enterprise Plugin Store
- `agent-builder` — Agent Builder & Governance
- `control-tower` — AI Control Tower
- `integrations` — System Integrations
- `settings` — Account Settings

---

## 5. Existing Architecture

### 5.1 10-Layer Enterprise AI Stack (per `SUBMISSION.md` + `Docs/architecture.png`)
1. **Open Enterprise Data** — SAP / Snowflake / Oracle / DB2 / S3 / EHR
2. **Cloud & Data Infrastructure** — Federated multi-cloud engines
3. **Ontology Layer** — W3C semantic vocabulary, taxonomies, business rules
4. **CertaintyAI Reasoning** — Trust & Safety, Hallucination Detector, Evidence Pack Builder
5. **Intelligence / GraphRAG** — Domain ontology + retrieval (roadmap)
6. **AI & Orchestration (AIP Core)** — Multi-agent router, ADK `SequentialAgent`
7. **MCP / Tool Surface** — FastMCP server (written, roadmap)
8. **Audit Trail Database** — Cryptographic lineage (roadmap)
9. **Application & Experience** — Vite/React frontend, 3D SVG canvas
10. **Governance** — Active Policy Engine, Purview/Collibra/Alation/Dataplex adapters (roadmap)

### 5.2 Runtime Topology (verified)
```
Browser  ──HTTPS──►  Cloud Run: certaintyai-frontend (Nginx)
                            │
                            └──/api──►  Cloud Run: certaintyai-backend (FastAPI)
                                                │
                                                ├──ADK SequentialAgent──► DeterministicScoringAgent (in-proc)
                                                │                       └► InsightsRemoteA2aAgent ──A2A JSON-RPC 0.3.0──►
                                                │                                                    Producer process :8001
                                                │                                                    (ADK to_a2a wrapped)
                                                │                                                    └► Gemini 2.5 Flash via Vertex AI
                                                │                       └► Narrative LlmAgent ──► Gemini 2.5 Flash via Vertex AI
                                                ├── SQLite (ephemeral demo) / PostgreSQL+pgvector (prod target)
                                                └── ADC (service account) — no API keys
```

### 5.3 Two Endpoints, Two Paths
- `POST /survey` — **legacy in-process** orchestrator (`orchestrator.generate_readiness_report`) — direct `llm_client.complete_json` dispatch.
- `POST /survey/adk` — **ADK pipeline** (`build_adk_pipeline` → `SequentialAgent`) — A2A cross-process insights. **This is the Track 3 differentiator.**

### 5.4 Key Architectural Decisions
- **Deterministic core, generative shell.** Scoring math (`score_agent.py`) is fully deterministic and unit-tested; LLM only explains/narrates. Same inputs → same auditable scores.
- **Scoring firewall.** `score_agent.py`, `test_score_agent.py`, `calculate_scores`, `calculate_dynamic_scores` are locked: any diff fails the test gate (52 passing / 3 skipped).
- **Provider-agnostic LLM.** `LLM_PROVIDER` env switch routes between Anthropic / OpenAI / Gemini / Vertex without code change.
- **Honest empty states.** Where a value is not actually computed, the UI renders `—` / "Not computed" / "Roadmap" rather than a fabricated number.

---

## 6. Existing AI Components

| Component | File | Status | Purpose |
|---|---|---|---|
| `DeterministicScoringAgent` | `agents/adk_pipeline.py` | ✅ Live | ADK `BaseAgent`; runs scoring + derived features in-process, writes state delta |
| `ProducerInsightsAgent` | `agents/adk_pipeline.py` + `run_a2a_producer.py` | ✅ Live | ADK `LlmAgent` wrapped with `to_a2a` on port 8001 |
| `InsightsRemoteA2aAgent` | `agents/adk_pipeline.py` | ✅ Live | `RemoteA2aAgent` consumer; serializes session state → JSON-RPC task |
| Narrative `LlmAgent` | `agents/adk_pipeline.py` | ✅ Live | In-process Gemini-via-Vertex; produces McKinsey-style prose |
| `ReadinessReportAgent` (legacy) | `agents/orchestrator.py` | ✅ Live | In-process orchestration; used by `/survey` and seeding |
| `InsightsGenerationAgent` (legacy) | `agents/insights_agent.py` | ✅ Live | Provider-agnostic insights call; deterministic fallback |
| `NarrativeAgent` (legacy) | `agents/narrative_agent.py` | ✅ Live | Provider-agnostic narrative call; deterministic fallback |
| `ScoreCalculationAgent` | `agents/score_agent.py` | ✅ Live | Deterministic Python (no LLM) |
| Gap engine | `agents/gap_analysis.py` | ✅ Live | Deterministic gap mapping |
| C-suite features | `agents/csuite_features.py` | ✅ Live | Peer benchmark, value roadmap, evidence pack preview, regulator paragraph |
| Frameworks resolver | `agents/frameworks.py` | ✅ Live | Industry → applicable frameworks catalog |
| `EmbeddingService` | `agents/embedding_service.py` | ✅ Live | Gemini text-embedding-004 (768-d), in-memory cosine; zero-vector fallback |
| Agent Builder runtime | `agents/agent_runtime.py` | ✅ Live | ReAct-style step loop, RAG over `AgentDocumentChunk`, simulated tool execution |
| Dynamic follow-ups | `agent_runtime.generate_dynamic_follow_ups` | ✅ Live | Role-aware Q-generation per conversation |
| Security scanner | `agents/security_scanner.py` | ✅ Live | Prompt-injection input sanitization |
| MCP server | `app/mcp_server.py` | ⚠️ Written, **not wired** | `calculate_ai_readiness`, `query_domain_ontology` — no startup entrypoint |
| Legacy A2A router | `routers/a2a.py` | ✅ Live (separate) | `/a2a/identity`, `/discovery`, `/coordinate` — mock identity + ontology query intents |
| LLM provider abstraction | `agents/llm_client.py` | ✅ Live | OpenAI / Anthropic / Gemini / Vertex switch |

**LLM models in play:** `gemini-2.5-flash` (Vertex AI, prod path); fallback `gemini-2.0-flash`; `claude-sonnet-4-6` (config default); `gpt-4o-mini` (OpenAI option).

---

## 7. Existing Governance Features

- **Deterministic scoring engine** with locked tests — every score is reproducible from inputs.
- **Five sub-scores** (Semantic Alignment, RAG Accuracy, Audit & Provenance, Governance Oversight, Data Maturity) and a maturity band (Foundational 0–39 / Piloting 40–74 / Scaling 75–100).
- **NIST AI RMF sub-scores** computed: `GOVERN` (from oversight), `MEASURE` (from RAG accuracy).
- **Frameworks resolver** (`frameworks.py`): always-on Gartner / NIST AI RMF / EU AI Act / ISO 42001 / GDPR; keyword-triggered HIPAA / PCI DSS; sector adds for BFSI / Healthcare / Cybersecurity / Education / Government.
- **Evidence Pack preview** + **Regulator paragraph** per assessment (`csuite_features.py`) — wired into report.
- **Honest empty states** in the report template and UI (no fabricated numbers).
- **JWT-based auth** + role field on `User` (CFO / CISO / etc.).
- **Input sanitization** (`security_scanner.sanitize_and_scan_input`) on the survey route — guard against prompt injection.
- **Anon-token → user claim** flow lets an anonymous assessment be securely re-attached to a new account by email.
- **Demo-by-design defaults**: `demo@mdxblocks.com` pre-seeded with a real LLM-generated assessment so judges land on populated state.
- **Service-account ADC** in production — no API keys in repo (verified). `JWT_SECRET` and DB creds via env / Secret Manager.
- **Audit-trail database** (Layer 8): designed and surfaced in architecture stack, **not yet implemented**.
- **Active Policy Engine / catalog adapters** (Purview / Collibra / Alation / Dataplex): designed in the stack, **roadmap**.

---

## 8. Existing Open Architecture Features

- **Open protocols on the wire:**
  - **A2A v0.3.0** — `/.well-known/agent-card.json` discovery + JSON-RPC task submission, verified cross-process.
  - **Legacy A2A router** — `/a2a/identity` (SHA-256 cryptographic agent ID), `/a2a/discovery` (capabilities), `/a2a/coordinate` (intent dispatch).
  - **MCP** — `FastMCP` server with `calculate_ai_readiness` and `query_domain_ontology` tools (file written; entrypoint not yet bound).
- **Multi-cloud data adapters in the architecture model** — Snowflake, Oracle, Teradata, DB2, SAP, Azure Fabric, AWS S3, Google Cloud Storage (presented in `ArchitectureStack.jsx`; not all implemented).
- **Provider-agnostic LLM client** — flipping `LLM_PROVIDER` changes the model with no code change.
- **W3C semantic vocabulary** as the ontology layer's mental model; SNOMED-CT / LOINC / ICD-10 / RxNorm / ISO referenced as taxonomy sources.
- **pgvector** as the production embedding store; SQLite + in-memory cosine as the dev fallback — the call site is decoupled.
- **Open-source license** — Apache-2.0.
- **Standards-aligned controls** surfaced in the sidebar trust block: NIST AI RMF · ISO 42001 · EU AI Act.
- **In-place / zero-replication** deployment posture for regulated tenants (see `Deploymentstrategy/deployment_strategy.md` §1).

---

## 9. Existing Agent Builder Features

Implementation: `frontend/src/pages/AgentBuilder.jsx` (908 LOC) + `backend/app/routers/agent_builder.py` (312 LOC) + `backend/app/agents/agent_runtime.py` (595 LOC).

### 9.1 Lifecycle
- **List/Create/Update/Delete** custom agents (per-user `Agent` rows, owner_id FK).
- **Base agent auto-bootstrap** — on first `GET /agents`, a base "AI Readiness Copilot" agent is created for the user.
- **Role-templated agents** — `GET /agents/role-templates` returns CISO (Vendor Risk Triage) and CFO (AI ROI Analyzer) presets pre-filled with name, description, instructions, tool selection, icon.
- **Base agent firewall** — cannot be deleted or edited (returns 400 if attempted).

### 9.2 Configuration Surface
- Name, description, instructions, icon (10 Tabler icon choices).
- Role (`base` / `ciso` / `cfo`).
- Model string (default `Gemini 2.5 · Vertex AI`).
- Temperature (0.0–1.0).
- Max steps (1–100, default 25).
- Tools (multi-select): Web search · Doc retrieval · Score lookup · Email · Calendar · Database query · Notify Slack.
- Voice enabled toggle (`voice_enabled` column, dynamically added via lifespan migration).

### 9.3 Knowledge Base / RAG
- **Local file upload** — text decoded UTF-8, chunked (500 chars, 100 overlap), embedded via Gemini `text-embedding-004`, stored in `AgentDocumentChunk.embedding_json`.
- **SharePoint** — `linked/queued` stub (Microsoft Graph integration is a documented TODO).
- **Portal URL** — `linked/queued` stub (headless crawler TODO).
- **Retrieval** (`retrieve_rag_context`) — in-memory cosine similarity at threshold 0.60, falls back to keyword substring match if embedding service returns zero-vector.

### 9.4 Execution
- **ReAct-style loop** (`run_agent_loop`) — JSON-schema enforced step output (`thought`, `tool_call`, `final_answer`).
- **Tolerant JSON parsing** — `parse_tolerant_agent_step` + `close_braces` + regex extractor handle malformed model output.
- **Simulated tool execution** — tool calls produce `[Simulated Execution]` traces; no real side-effects executed yet.
- **Step-by-step trace persisted** to `AgentRun.steps` (step #, type, detail, tool, tokens).
- **Dynamic follow-ups** — Gemini-generated 2–3 next-question prompts, role-aware fallback if LLM unavailable.
- **Retrieved sources** captured per run for audit (`AgentRun.retrieved_sources`).
- **Graceful degradation** — if no LLM configured, returns a role-shaped simulated trace.

### 9.5 Data Model
- `Agent` ← `AgentDocument` ← `AgentDocumentChunk` (embedding_json TEXT — portable across SQLite/Postgres).
- `Agent` ← `AgentRun` (steps + follow_ups + retrieved_sources as JSON).

### 9.6 Mockup vs Implementation
- `AgentBuilder/certaintyai-agent-builder-mockup.html` is a static design reference (parchment theme, Tabler Icons, panel layout). The live React `AgentBuilder.jsx` implements the same surface in the Dashboard tab.

---

## 10. Google Startup Challenge Alignment

**Track:** Track 3 — *Refactor for Google Cloud Marketplace & Gemini Enterprise*.

| Mandate | Evidence |
|---|---|
| **B2B regulated focus** | Healthcare-first; BFSI, Cybersecurity, Education roadmaps. Frameworks resolver auto-applies NIST AI RMF / HIPAA / ISO 42001 / EU AI Act. |
| **Cloud-native runtime** | Two Cloud Run services in `certaintyai-prod`, `us-central1`. Multi-stage Dockerfiles. GKE + Helm roadmap. |
| **Gemini / Vertex AI intelligence** | `_complete_vertex` path; ADC auth; `gemini-2.5-flash` via Vertex; embeddings via `text-embedding-004`. |
| **Google ADK** | `google-adk==2.2.0` — `SequentialAgent`, `LlmAgent`, `RemoteA2aAgent`, `InMemoryRunner`, `Gemini` model, `to_a2a`. |
| **A2A interoperability** | Cross-process verified — agent card GET 200, JSON-RPC POST 200, Gemini-backed response. Open standard, not in-process function call. |
| **Marketplace-ready** | Apache-2.0; deployable as containers; Helm chart on roadmap; 3% take-rate model factored into pricing. |
| **No committed API keys** | Repo verified clean; ADC via attached service account. |
| **Public artifacts** | Apache-2.0 repo `mdxblocks-ai/certaintyai-public`; live frontend & backend Cloud Run URLs; `Docs/architecture.png`; demo video URL in `Context/SUBMISSION.md`. |
| **Test gate** | 52 passing / 3 skipped / 0 failed per submission; scoring logic firewalled. |
| **Honest-by-design judging surface** | "Not computed" / "Roadmap" markers wherever a value isn't real; MCP labeled "written, not wired." |

**Judging-rubric mapping (per Devpost):**
- **Technical 30%** — deterministic+generative split, ADK SequentialAgent, live A2A, provider-agnostic LLM, 52-passing test gate.
- **Business 30%** — five primary-sourced stats (MIT NANDA, Gartner ×2, Marketplace economics, Futurum), Marketplace unit economics, SaaS tiers.
- **Innovation 20%** — Ontology as infrastructure middleware, open-protocol A2A over walled garden, honesty as enforced product property.
- **Demo & Presentation 20%** — Live URLs, demo login, ≤3-min video, two-terminal A2A proof, McKinsey-grade report.

---

## 11. Snowflake Startup Challenge Alignment

CertaintyAI is **not currently submitted** to a Snowflake challenge, but its architecture is materially positioned for one. Assessment from a Snowflake judging lens:

### Where it aligns
- **Snowflake-first messaging** — Snowflake is the named anchor data source in the architecture stack ("Snowflake Integration · analytical cloud data warehousing and GraphRAG context mapping").
- **Semantic Layer thesis** maps directly onto Snowflake's **Cortex / Semantic Views** roadmap: ontology + governance as a layer between Snowflake data and AI is exactly the *governed AI on Snowflake* narrative.
- **Lineage / catalog** — referenced as a Snowflake/BigQuery federated mapping in the deployment guide.
- **Open file/table formats** implicit — pgvector design is decoupled; could be swapped for **Snowflake Cortex Search** or **Iceberg + Cortex** with no application-layer change.
- **Regulated mid-market** — Snowflake's strongest customer cohort.

### Gaps to close before a credible Snowflake submission
- No **Snowpark Container Services** runtime targeted today (Cloud Run only).
- No **Snowflake Cortex** LLM integration; no **Cortex Search** retrieval; no **Cortex Analyst** as a tool.
- No **Streamlit-in-Snowflake** companion experience.
- No **Snowflake Native App Framework** packaging — would be the Snowflake equivalent of the Marketplace listing.
- No **Snowflake Horizon** data governance integration (tagging, masking policies, lineage).
- No working connector that reads tables out of a customer Snowflake account today (architecture mentions it, code does not implement it).
- No Snowflake account ID / role / warehouse configuration surface in `Settings`.

### Realistic path to a Snowflake submission
1. Add `LLM_PROVIDER=cortex` branch in `llm_client.py` (Cortex `COMPLETE`) — small lift.
2. Add a `snowflake-connector-python` ingestion adapter (read-only) for Agent Builder knowledge base ("Connect Snowflake schema").
3. Use **Cortex Search** instead of in-memory cosine for `retrieve_rag_context` when a Snowflake conn is present.
4. Package as **Snowflake Native App** alongside the Marketplace Helm chart — same product, two distribution motions.
5. Surface **Horizon tags & masking policies** as input to the `audit` and `oversight` sub-scores.

---

## 12. Venture Capital Perspective

### TL;DR
Seed-stage-credible AI infra play with an unusually defensible thesis ("ontology as middleware, honesty as enforced property"), a working multi-agent system on Google's own SDKs, and a clear distribution motion (Marketplace). The frontend overshoots the backend's substance, and the product-market fit story is still single-customer-shaped. Worth taking the meeting.

### What's investable
- **Real Google ADK + A2A integration verified cross-process** — not slideware; verified live in the codebase.
- **Deterministic scoring + generative narrative** is the right architectural answer to *"how do I sell AI to a regulated buyer?"* — same input, same number, same audit trail.
- **Macro tailwinds are quoted accurately** — MIT NANDA 95% no-P&L, Gartner 60% abandonment, Futurum 112% deal-size uplift. These are the right numbers and they are sourced.
- **Distribution thesis aligns to platform economics** — 3% Marketplace take-rate, committed-spend drawdown, co-sell uplift. Cleaner unit economics than direct enterprise.
- **Honesty discipline is a moat in this category.** "Every shown number is real" is an unusually strong promise; the team has actually built test gates and UI defaults around it.
- **Apache-2.0** lowers procurement friction in regulated buyers.

### What an investor will push on
- **Whose budget pays?** A free 2-min readiness report is a top-of-funnel asset, not a business. Where does the $50K-replacement value land — Govern tier, services attach, or Marketplace private offer? Pricing is described, not yet validated.
- **Single deterministic scoring engine = single sellable IP.** The moat is the *ontology* and *evidence pack*, both of which are **roadmap** in the code (Layer 4/5/8). Until the ontology is real, the product is "branded NIST AI RMF survey + LLM narrative." Defensible, but not yet rare.
- **Cross-process A2A is a brilliant demo, but it's still one consumer talking to one producer in the same project.** Real interop = a *third-party* agent talking to CertaintyAI in production. That's the next proof.
- **MCP is named but not wired.** Honest, but every deck slot it occupies is a slot that could prove out.
- **Frontend complexity vs. backend depth.** A 5,674-LOC `Dashboard.jsx` with 12+ tabs (Control Tower, Integrations, Plugin Marketplace, Tools, Tasks, Insights) implies a much broader product surface than the backend actually serves. Either trim aggressively or staff to fill — investors will read the gap.
- **Demo data quality.** Locally, insights fall back to templates under cert-interception conditions (documented in handoff). On Cloud Run the report is real and specific. The local dev story is fragile.
- **ICP is "regulated mid-market" but listing is healthcare-first BFSI-second.** Healthcare sales cycles are 9–18 months. Founder execution risk on first-five-design-partner timeline.
- **Team isn't documented in the audit-visible files.** No `TEAM.md`, no founder bios. Diligence question, not a product question.

### Comparable framing for the deal memo
- **Closest neighbors:** Credo AI, Holistic AI (AI GRC); Atlan, Alation (data catalog → AI governance); Arize, Fiddler (LLM observability); WitnessAI (AI security gateway).
- **Honest differentiation vs each:** ontology-as-middleware + open-protocol agents + deterministic scoring. None of the above own that exact intersection.

### Indicative ask
- Seed round, $1.5–3M.
- 18-month milestones: (1) ship real Ontology Layer (W3C + 3 sector vocabularies); (2) ship Evidence Pack v1 with cryptographic provenance; (3) one paying healthcare design partner *and* one BFSI design partner; (4) Marketplace listing live + first private offer closed; (5) one third-party A2A integration in production.

---

## 13. Strengths

1. **Working ADK + A2A across two processes, not in slideware.** This is the rarest thing in the Track 3 cohort. Most "multi-agent" submissions are one Python file.
2. **Deterministic scoring under a test firewall.** 52-passing gate, `git diff --exit-code` discipline at every checkpoint. Makes the "defensible AI" claim real.
3. **Honest-by-construction UI.** Empty states, "Not computed," and roadmap markers wherever the data isn't real. This is the product thesis enforced in code.
4. **Provider-agnostic LLM client.** One environment variable flips the entire reasoning stack between Anthropic, OpenAI, Gemini, and Vertex. Both portfolio and procurement friendly.
5. **Strong report deliverable.** The Jinja `template.html` produces a print-ready McKinsey-style PDF with peer benchmark, frameworks, gap analysis, value roadmap, evidence pack preview, regulator paragraph, and NIST sub-scores.
6. **No API keys in repo.** Verified clean three-repo hygiene (public / backup / legacy). Production via ADC and service accounts.
7. **Two real Cloud Run services**, ADC-authed, with a documented enterprise deployment guide that is unusually thorough (GKE, Helm, Cloud SQL, Secret Manager, Prometheus, Apigee).
8. **Beautiful architecture canvas** — `ArchitectureStack.jsx` is one of the better executive-facing technical visualisations in this category; doubles as a sales asset.
9. **Pragmatic legacy/ADK split.** Maintaining `/survey` (legacy in-process) and `/survey/adk` (ADK + A2A) in parallel was the right risk choice for a submission deadline.
10. **Real signal of customer focus.** Role-templated agents (CISO Vendor Risk Triage, CFO ROI Analyzer) with prefilled instructions show the team has actually thought about what a buyer asks an agent on day one.
11. **Open-source license.** Apache-2.0 is the right enterprise-procurement choice.
12. **Honest macro stats.** Five Business-Case statistics are quoted in source framing and traceable to MIT Project NANDA, Gartner, Google Cloud, and Futurum.

---

## 14. Weaknesses

1. **Ontology Layer is the thesis but is mostly visual.** Layer 4 (Ontology) is referenced everywhere in the UI and SUBMISSION but is not yet a real semantic graph, parser, or query engine. The category-defining feature is roadmap.
2. **Evidence Pack is preview-only.** The cryptographic Audit Trail Database (Layer 8) is on the diagram, not in the code.
3. **MCP server is written but not wired.** `mcp_server.py` defines two tools but nothing imports it; no startup entrypoint. Submission flags this honestly — still a gap.
4. **Dashboard.jsx is 5,674 LOC.** Single-file monolith with 12+ tabs, several of which (Control Tower, Plugin Marketplace, Tools, Tasks, Insights) imply features the backend does not implement. High maintenance debt and a believability risk under demo scrutiny.
5. **`frontend/jsx_balancer.py`** in a React repo is a signal of past tag-balance debugging — points at fragility in the monolithic JSX.
6. **SSL verification is monkey-patched off** at the top of `adk_pipeline.py` and inside `llm_client.py` (`verify=False`). Documented as a workaround for a local Norton cert; nonetheless it is a security-review red flag if it survives to production. Cloud Run path doesn't need it.
7. **Lifespan-time DDL** — `main.py` runs `ALTER TABLE … ADD COLUMN …` on startup as a poor-man's migration. Works for SQLite + demo, will break in any multi-instance Cloud Run / Postgres scenario without Alembic.
8. **`AgentRun.steps`/`follow_ups`/`retrieved_sources`** are `JSON` columns — fine for SQLite, opaque for analytics in Postgres. No structured audit query path.
9. **`security_scanner.py`** is 63 LOC — input sanitization is shallow. Real prompt-injection protection in a governance product needs deeper treatment.
10. **A2A coordinate intents in `routers/a2a.py`** (`OccupancySpikeAlert`, `AnticipateOccupancyResourceScaling`) — the "HR Facility Agent" / "GKE pre-cooling" scenarios feel borrowed from a different demo and dilute focus. The real A2A story (insights producer) is much stronger.
11. **`Foundry.jsx`, `OntologyGraph.jsx`, Region toggle** — present in UI but underspecified vs. backend; users will click into them and find depth missing.
12. **No Alembic, no CI pipeline, no GitHub Actions visible in repo.** "52 passing, 3 skipped" is asserted, not verified in CI on every commit.
13. **`tenant_id`** column exists on `Agent` but is nullable and unused — multi-tenancy is a stub.
14. **No telemetry.** No structured logging, no OpenTelemetry, no metrics export. The deployment guide names Prometheus/Grafana but nothing emits.
15. **Snowflake messaging without Snowflake implementation.** Snowflake is named in the data sources, the prompt, the architecture canvas, and the SUBMISSION — but no code reads from Snowflake.
16. **Some report sections still carry fabricated figures** per `Context/HANDOFF-CONTEXT-2026-06-08.md` ("Workload Usage Profile" 40/25/20/10/5%, "92% confidence" on the sample evidence pack). Flagged for post-submission cleanup; risk if a judge browses outside the demo safe-zone.
17. **`Context/SUBMISSION.md` and root `SUBMISSION.md` disagree** — root submission still says "Anthropic SDK" / "claude-sonnet-4-6" as the primary spec while `Context/` submission positions the product on ADK + Gemini + A2A. Two narratives in the same repo.

---

## 15. Recommendations

### 15.1 Last-mile for the current Google submission (≤72h)
- **R1 — Honesty scrub round 2.** Strip the "100% on GPT-4o / 95% don't need premium reasoning" workload split and the "92% confidence" evidence-pack sample from `app/report/template.html` at source. Flagged in handoff — close the loop.
- **R2 — Reconcile the two SUBMISSION.md files.** Root and `Context/` tell different model stories. Make root authoritative (Track 3 + ADK + Vertex + A2A). Replace any "claude-sonnet-4-6" claim with "ADK SequentialAgent on Gemini 2.5 Flash via Vertex AI."
- **R3 — Replace the `{` empty file at repo root.** It's noise that diligence will see.
- **R4 — Add a one-line `MCP server: written, not wired (roadmap)` badge** wherever the README/SUBMISSION mentions MCP. The current Context submission already does this honestly; mirror it.

### 15.2 Productize the Ontology thesis (90 days)
- **R5 — Ship Ontology v1.** Healthcare-first. Three deliverables: (a) RDF/Turtle vocabulary in `backend/app/ontology/healthcare.ttl`; (b) loader + query API; (c) Insights agent prompt grounded in vocabulary lookups (not just survey answers).
- **R6 — Ship Evidence Pack v1.** When the insights agent makes a claim, attach `{source_id, ontology_term, source_excerpt, hash}`. Persist to a new `audit_trail_entries` table with `prev_hash` linking — Merkle-style. This is the cryptographic lineage in Layer 8.
- **R7 — Wire MCP at startup.** `python -m app.mcp_server` entrypoint; expose `calculate_ai_readiness` and `query_domain_ontology` as standards-compliant tools. Even one Claude Desktop screenshot calling these tools turns Layer 7 from roadmap to live.

### 15.3 Engineering hygiene (now, before next demo)
- **R8 — Decompose `Dashboard.jsx`.** Each tab → its own file under `pages/dashboard/`. 5,674 LOC in one component is a reviewability and reliability risk. Likely 1–2 day refactor; high payoff for future investor diligence.
- **R9 — Delete or implement the unused tabs.** `Control Tower`, `Plugin Marketplace`, `Tools`, `Tasks`, `Insights` — if they don't have a backend in 30 days, hide them behind a `SHOW_*` flag like `SHOW_AI_READINESS_NAV`. Promise = what the demo actually does.
- **R10 — Adopt Alembic.** Replace the startup-time `ALTER TABLE` block in `main.py` with proper migrations. Mandatory before multi-instance Cloud Run / Postgres.
- **R11 — Remove the global `verify=False` SSL monkey-patch** from `adk_pipeline.py` and `llm_client.py`. Move it behind an explicit `DEV_INSECURE_TLS=true` env flag that warns loudly on start. Production runs on Cloud Run anyway — keep dev hacks out of the production-imported module.
- **R12 — Add a single CI workflow.** GitHub Actions: `pytest`, `npm run build`, lint, and a "scoring firewall" check (`git diff` against `app/agents/score_agent.py` must be empty unless explicitly allowlisted). Make the 52-passing claim continuously verifiable.
- **R13 — Strengthen `security_scanner.py`.** Add a recognized library (e.g., `llm-guard`, `rebuff`) or document the threat model the current scanner covers. For a governance product, this surface deserves more.
- **R14 — Structured logging + one OpenTelemetry trace** through the ADK pipeline. The "every step is auditable" claim wants a trace.

### 15.4 Product surface (next sprint)
- **R15 — Make A2A a customer story, not a demo story.** Publish the agent-card spec; expose `/.well-known/agent-card.json` from the main app too; document a 5-minute "connect your agent" guide. The differentiator only matters if a third party uses it.
- **R16 — Drop the "OccupancySpikeAlert / pre-cooling" A2A scenarios** in `routers/a2a.py`. They distract from the real A2A producer/consumer story. Replace with `EvaluateAgentReadiness` and `ExportEvidencePack` intents.
- **R17 — Real ingestion for the Agent Builder.** Implement PDF + DOCX parsing in `add_agent_document` (PyMuPDF + python-docx). Stub SharePoint behind a feature flag rather than shipping it as a card the user can click.
- **R18 — Tenant scoping.** `Agent.tenant_id` is nullable and unused. Either delete it or wire it into `get_current_user` + every query — half-built multi-tenancy is worse than none.

### 15.5 Distribution & GTM (next quarter)
- **R19 — Marketplace Helm chart.** Package and submit the listing. The Marketplace take-rate + committed-spend story only monetizes when listed.
- **R20 — Pursue Snowflake in parallel.** Add `LLM_PROVIDER=cortex` and one Snowflake read connector; submit as a Snowflake Native App. Same code, second distribution motion.
- **R21 — Design partners.** One healthcare + one BFSI named pilot before Series A conversation.
- **R22 — Publish the "honesty contract"** as a public README section: "every visible number is computed; never fabricated. Where data isn't real, the UI says so." This is differentiated positioning; let it travel.

### 15.6 Long-term moat
- **R23 — Open-source the ontology vocabularies** (Apache-2.0 like the app). Become the de-facto reference vocabulary for governed enterprise AI in healthcare. Community contribution → defensibility.
- **R24 — Certification track.** "CertaintyAI-Aligned" badge for third-party agents that pass the assessment over A2A. This is the path from product → standard.

---

*End of audit. No source files were modified by this review.*
