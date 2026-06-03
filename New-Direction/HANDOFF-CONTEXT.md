# CertaintyAI — Session Handoff Context

> **Purpose.** Paste this file into a new chat to resume work without re-explaining.
> It captures *what CertaintyAI is, what's been built, every deliverable, key
> decisions, and the open next steps* as of the end of the prior session.
> Last updated: 2026-06-02.

---

## 0. How to resume (read this first)
You are acting as **co-product strategist + builder** for **CertaintyAI** (by **MDxBlocks Inc.**).
Two parallel workstreams are live:
1. **A standalone HTML landing-page + assessment SPA** (`certaintyai.html`) — a design/UX reference build.
2. **Winning the Google for Startups AI Agents Challenge** (Devpost hackathon, Track 3).

**Critical recurring point:** Changes made by the assistant go into the **downloaded `certaintyai.html`** file. The user *also* has a **real React/Vite + FastAPI product** running on `localhost:5173` (their own codebase, built via "Antigravity"). The HTML file is a reference/prototype; the user's developer (or the Antigravity agent) ports features from it into the React app. The user has repeatedly been confused that localhost "doesn't show changes" — it won't; only the HTML file does.

**Verification rule learned the hard way:** Always verify the *delivered* file in `/mnt/user-data/outputs/`, not just the working copy — a chained `&& cp` once got skipped when a test errored, shipping a stale file.

---

## 1. The product
**CertaintyAI** — an ontology-driven enterprise AI platform that turns fragmented enterprise data into **governed, explainable, operational intelligence** for **regulated industries**: healthcare, finance/BFSI, cybersecurity, education, FinOps, IT consulting.

- **Killer feature:** a 2-minute **AI Readiness Assessment** → instant board-ready report (McKinsey-style), with a **deterministic, auditable scoring engine** + LLM-generated insights/narrative.
- **Positioning:** *"Palantir for the other 99%"* — democratizing ontology-driven AI for mid-market regulated companies. Ontology treated as a **real architectural layer** between data and AI reasoning.
- **Differentiators:** deterministic+auditable scoring (not a black box), an explicit **Governance Layer**, **GraphRAG + multi-agent + human-in-the-loop**, hybrid/multi-cloud.
- **Tagline (North America):** "Defensible AI for regulated industries."

---

## 2. The real product codebase (user's, via Antigravity)
- **Location:** `C:\Project\MDx-CoPilots\Copilots\AntiGravity\MDxCAI\Source` (active root). The HTML + specs were copied to `...\Source\New-Direction`. (An earlier `CONTEXT.md` header referenced a `ClaudeCode\CAI-AIP\Source` path — the AntiGravity path is current.)
- **Stack:** Vite + React 18 frontend (Tailwind, React Router, `react-force-graph-2d`); FastAPI + Python backend; SQLAlchemy + SQLite (pgvector/Postgres in later phases); JWT auth (bcrypt direct).
- **Agentic layer:** a multi-agent **`ReadinessReportAgent`** orchestrator + **deterministic `ScoreCalculationAgent`** (no LLM) + **`InsightsGenerationAgent`** + **`NarrativeAgent`**. Plus a **FastMCP server** (`mcp_server.py`) exposing `calculate_ai_readiness` and `query_domain_ontology`.
- **LLM config:** provider-agnostic via `LLM_PROVIDER` env var; default was `anthropic` (`claude-sonnet-4-6`), OpenAI override; voice KB references Gemini. **For the hackathon this should flip to Gemini on Vertex AI as primary.**
- **Run:** backend `uvicorn app.main:app --reload` (:8000); frontend `npm run dev` (:5173).
- **Already shipped (per their CONTEXT.md):** landing page, 5-step survey, report generation, auth + profile/password-change, C-suite **Dashboard**, **Saved Reports/assessment history**, **Voice AI Assistant** (grounded rules KB), HIPAA-specific rules, **FastMCP server**, role-specific report sections, Marketplace/GSA cooperative-procurement modal.
- **Demo users:** password `Certainty2026!` for all; e.g. `demo@mdxblocks.com`.

---

## 3. The HTML reference build (`certaintyai.html`) — what the assistant created
A single self-contained file (no build step, no server) — drop on `mdxblocks.com/certaintyai` and it runs. **Design direction: editorial / institutional luxury** (deliberately NOT the old neon-cyan look):
- Palette: parchment `#F4F0E6`, ink `#14161A`, brass `#A87C3C`, teal `#1E3A36`. Fonts: **Fraunces** (serif display) + **Hanken Grotesk** (sans).

**Features built (all verified working in the delivered file):**
1. **SPA nav:** Home · About Our Foundry · Open Architecture · AI Readiness. **Region switcher** (top-right globe) sets a regional **tagline under the logo** (replacing "BY MDXBLOCKS"):
   - N. America: *Defensible AI for regulated industries*
   - Singapore/SE Asia: *Governed AI, built on trust*
   - India: *Accountable AI for regulated enterprise*
   - Australia–NZ: *Responsible AI you can stand behind*
   - "BY MDxBlocks" moved to footer, extra small.
2. **Hero:** "Make every AI decision *defensible*." + tilted sample report card + standards row + stat strip (95% / 7% / 56%).
3. **Industry selector → live ontology knowledge graph** (6 industries; healthcare default).
4. **Interactive Open Architecture** (the centerpiece): isometric "crystal" with **6 jewel layers**; **Governance Layer is the hero** (gold accent, selected by default); **Business Users / Technical Users toggle** rewrites every layer's description; **click-to-lock**; **Active Layer Inspect** footer with capability chips (Policy & Audit, W3C Semantics, GraphRAG, MCP-Ready, Human-in-the-loop, Lineage Tracking) + "Live Stack Synced". Layers: AI Agent Orchestrator → Governance Layer → CertaintyAI Reasoning → Ontology Layer → Data & Cloud Infrastructure → Data Sources.
5. **Why CertaintyAI** (3 cards) + **Framework wall** (20 frameworks: NIST AI RMF, EU AI Act, ISO 42001/27001, HIPAA, HITECH, FDA AI/ML, PCI DSS, SOC 1/2, GLBA, Basel III, FedRAMP, FISMA, NIST 800-53, FINRA, CCPA, GDPR, CMMC, Gartner AI Maturity).
6. **Foundry page** (catalog = "what you get"): value strip; **6 pre-built domain ontologies**; **6 governance adapters** (Microsoft Purview, OpenMetadata, Collibra, Alation, IBM Knowledge Catalog, Google Dataplex); components grid; **dual-audience explainer** ("Ontology, explained for whoever's in the room" — business vs technical).
7. **Auth modal (front-end only, demo mode):** Sign In, Create Account, Forgot Password, Change Password, account menu. **Not real auth** — submit handlers are tagged `>>> replace with provider <<<`; recommend Supabase/Clerk/Firebase/Cognito.
8. **Clickable "Ontology Engine · Active"** status → live engine popover (industries loaded, active model, entities/relationships, GraphRAG) + "Open ontology explorer →".
9. **AI Readiness assessment (8 steps):**
   - **Step 1 = rich intake:** Private/Public toggle (relabels *Company name* ↔ *Agency name*); **Role** dropdown; adaptive 3rd field — **Industry** (private) vs **Department / Mandate** (public); **autocomplete** on agency name (type-ahead + **Tab-to-accept** the example/highlighted suggestion). No email up front (honors "no signup").
   - **Steps 2–8 = dynamically personalized questions** via token-swap (`{org}`, `{entity}`, `{framework}`, `{industry}`, `{role}`) + a "✦ Tailored for [Role] · [Industry] · [Sector]" banner. (Template-driven, not LLM yet — see §5.)
   - **Deterministic weighted Fit Score:** semantic 35% / rag 25% / audit 20% / maturity 10% / oversight 10%. **The LLM never computes the score.**
   - **Results:** score ring, sub-metrics, gaps, fix map, ROI, downloadable report; header personalizes "Prepared for [Role] · [Org]".
10. **Industry picker carry-through:** "Take the [Industry] readiness assessment →" launches the assessment with the domain pre-filled.

---

## 4. Deliverables produced (in `/mnt/user-data/outputs/`)
1. **`certaintyai.html`** — the SPA above.
2. **`certaintyai-llm-assessment-spec.md`** — build spec + verbatim LLM system prompt for an agent (Antigravity) to replace the template-token questions with **LLM-generated** questions, while keeping scoring deterministic (the "scoring firewall"). Includes JSON schema, scoring mapping, guardrails, test matrix.
3. **Research report artifact** (in chat, titled *"CertaintyAI Winning Playbook & Business Case Foundation"*) — full hackathon playbook + TAM/SAM/SOM + bottoms-up revenue model + Marketplace economics + 9-day plan. *(Lives as a chat artifact; re-export if needed.)*

**Prompts generated (in chat, not files):**
- An **Antigravity prompt** to implement the LLM-assessment spec.
- A larger **Antigravity prompt for the Google Cloud Track-3 refactor** (mission, deadline, deliverables, hard constraints).

---

## 5. The hackathon objective
**Google for Startups AI Agents Challenge** (Devpost; private page `devpost.team/google-cloud-for-startups/hackathons/3197`; "Generative AI Hack"; ~1,207 registered).
- **Chosen track — Track 3: Refactor for Google Cloud Marketplace & Gemini Enterprise** (take the existing functional agent, make it Google Cloud-native + Marketplace-ready). *Do NOT pick Build or Optimize — Track 3 leverages the existing product.*
- **Judging weights:** Technical Implementation **30%** · Business Case **30%** · Innovation & Creativity **20%** · Demo & Presentation **20%**.
- **Required artifacts:** public open-source repo (+ detectable OSS license), 3-min demo video, **architecture diagram**, testing access (hosted/demo link, login if private).
- **⚠️ UNRESOLVED:** deadline + prize conflict. User's brief says **June 11, 2026, 7:00 PM CDT / $60,000**; Google's official blog says **June 5, 2026 / $90,000 + $500 credits/team**. **MUST confirm on the official Devpost rules page** — front-load work against the earlier date.

**The winning strategy (from the research report):**
- **Be unmistakably Google Cloud-native:** re-wrap `ReadinessReportAgent` in **ADK** (root orchestrator + 3 sub-agents); **keep `ScoreCalculationAgent` as a deterministic non-LLM tool** (the credibility anchor); **Gemini on Vertex AI** as default model (provider-agnostic retained; Claude available via Vertex Model Garden); **FastMCP on Cloud Run** consumed via ADK `McpToolset`; **AlloyDB (pgvector)** memory; **`adk deploy cloud_run`**; **A2A Agent Card** for Marketplace/Gemini Enterprise; **Cloud Trace** + Terraform for "production-grade" signals.
- **Framing (important):** **"Google Cloud-native FIRST, portable to Azure/IBM second."** Google's "host primarily on Google Cloud" is a hard Marketplace listing rule — keep Google as the fastest-scaling compute/data plane.
- **Business case (30%) is half the game:** lead with the data-readiness crisis (MIT NANDA 2025: ~95% of GenAI pilots show no P&L impact / only ~5% succeed; Gartner Feb 2025: 60% of AI projects abandoned through 2026 for lack of AI-ready data). Marketplace economics: 3% take rate (→2%/1.5% on large private offers), 100% committed-spend drawdown (cap 25%), Google-published co-sell uplift (112% larger deals, up to 50% faster cycles — Futurum/Google study, June 2025).
- **Bonus points:** build blog post + hashtagged social post + ADK repo contribution.

---

## 6. Key decisions & rationale (don't relitigate)
- **Design = editorial luxury, not neon** — reads "boardroom trust" to C-suite.
- **Business language over jargon** — "ontology" is for technical leaders; business leaders see outcomes ("one trusted view," "defensible decisions"). The Business/Technical toggle embodies this.
- **Scoring firewall** — LLM authors questions + assigns option scores; deterministic code computes the total. Non-negotiable for an auditable, regulated-industry tool.
- **Track 3** for the hackathon; **Google-primary** multi-cloud framing.
- **Auth is UI-only** until wired to a real provider.
- **No competitor/vendor names on the marketing page** (per their project policy) — but governance *adapter* names (Purview/Collibra/etc.) are shown as integrations.

---

## 7. Open next steps / decisions pending
1. **Confirm the real hackathon deadline & prize** on the official rules page (June 5 vs 11; $90k vs $60k).
2. **Assistant offered to draft** (user hasn't said "go" yet): **`SUBMISSION.md` business case** + **3-minute demo video script** (persuasion artifacts in the assistant's lane). Strongly recommended next.
3. **Role → report tone** (CFO=business, CISO/CTO=technical) and an optional **"email me the report"** gate at results — offered, not built.
4. **Wire auth** to a real provider (Supabase/Clerk recommended).
5. **Adapter logos** — currently single-letter placeholders; check vendor brand-usage terms before using real logos.
6. **Run the Antigravity Track-3 refactor** (prompt already drafted; update deadline line).
7. Optional HTML polish: framework wall could pre-filter by chosen industry; sample report could swap to a matching example org.

---

## 8. Quick fact sheet
- Company: **MDxBlocks Inc.** Product: **CertaintyAI**. Footer attribution style: **BY MDxBlocks**.
- Industries/ontologies: Healthcare, Banking & Finance (BFSI), Cybersecurity, Education, FinOps, IT Consulting.
- Scoring weights: semantic 35 / rag 25 / audit 20 / maturity 10 / oversight 10.
- Hackathon: Google for Startups AI Agents Challenge · Track 3 · 30/30/20/20.
- Google-native target stack: ADK + Gemini/Vertex AI + Cloud Run + AlloyDB(pgvector) + FastMCP + A2A Agent Card + Cloud Trace.
- Output files: `certaintyai.html`, `certaintyai-llm-assessment-spec.md`, this `HANDOFF-CONTEXT.md`.
