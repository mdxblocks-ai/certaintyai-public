# CertaintyAI — Defensible AI for Regulated Industries

**Google for Startups AI Agents Challenge 2026 · Track 3 (Enterprise distribution via Google Cloud Marketplace / Gemini Enterprise)**
By **MDxBlocks Inc.**

---

## Elevator Pitch

CertaintyAI is an ontology-driven, auditable **AI Readiness Assessment** for regulated mid-market enterprises — healthcare first. It is built as a multi-agent system on **Google's Agent Development Kit (ADK)**: a deterministic scoring engine and a generative insights engine cooperate inside an ADK `SequentialAgent` pipeline, and a second agent runs in a **separate process and exchanges work over the open Agent-to-Agent (A2A) protocol**. The result is an assessment whose every on-screen number is either real computed data or an honest empty state — defensible AI for industries that have to answer to auditors.

---

## Submission Checklist

| Requirement | Status |
|---|---|
| Public repository + OSS license | ✅ `https://github.com/mdxblocks-ai/certaintyai-public` — Apache-2.0 |
| Deployed, publicly accessible build | ✅ Frontend: `https://certaintyai-frontend-217783557903.us-central1.run.app` |
| | ✅ Backend: `https://certaintyai-backend-217783557903.us-central1.run.app` |
| Architecture diagram | ✅ `Docs/architecture.png` (in repo) |
| Demo video (≤2 min, public) | https://www.youtube.com/watch?v=VwuKJTi20PU |
| Track 3 alignment | ✅ See below |

**Live demo login** (intended public credentials — not a secret): `demo@mdxblocks.com` / `Certainty2026!`

> Deployment runs on **Cloud Run** in project `certaintyai-prod` (`us-central1`), as two separate services. Vertex AI access is via **Application Default Credentials (a service account)** — **no API keys are committed** anywhere in the repository.

---

## Track 3 Alignment

CertaintyAI is purpose-built for the Google Cloud distribution motion that Track 3 targets:

- **Built on Google's agent stack.** ADK `SequentialAgent` orchestration, Gemini 2.5 Flash reasoning via Vertex AI, and native **A2A** interoperability — the same validations Google Cloud Marketplace surfaces for AI agents.
- **Marketplace-ready packaging.** The product is a self-contained, deployable agent service designed to list on Google Cloud Marketplace and integrate with Gemini Enterprise.
- **Regulated-industry focus.** Auditability, provenance, and governance scoring are the core deliverable — exactly the buyer concern that gates enterprise AI adoption.

---

## Technical Implementation

CertaintyAI is a multi-agent system, not a single prompt wrapper.

**1. Deterministic scoring engine (`app/agents/score_agent.py`).**
The assessment's numeric backbone is fully deterministic and unit-tested. Functions `calculate_scores` and `calculate_dynamic_scores` produce five sub-scores — **Semantic Alignment, RAG Accuracy, Audit & Provenance, Governance Oversight, Data Maturity** — and a maturity band: **Foundational (0–39) / Piloting (40–74) / Scaling (75–100)**. Because scoring is deterministic and test-gated, the same inputs always produce the same auditable result.

**2. ADK `SequentialAgent` pipeline (`app/agents/adk_pipeline.py`).**
The deterministic scorer and a generative insights agent are composed as cooperating stages inside an ADK `SequentialAgent`, orchestrated via `orchestrator.py` → `generate_readiness_report`. Generative reasoning runs on **Gemini 2.5 Flash through Vertex AI**.

**3. Live, cross-process A2A interoperability — the key differentiator.**
A second agent (`ProducerInsightsAgent`) is wrapped with ADK `to_a2a` and served by `run_a2a_producer.py` as an independent process on port 8001. It publishes a standards-compliant agent card at `/.well-known/agent-card.json`, and the main application consumes it as an A2A **consumer** (`RemoteA2aAgent`). This is verified working **cross-process**: agent-card discovery (`GET 200`), A2A task submission (`POST 200`), and Gemini-backed responses over the wire. This is genuine open-protocol agent interoperability, not an in-process function call.

**4. Deployment.**
React/Vite frontend and FastAPI backend deploy as two separate Cloud Run services from local builds (`gcloud builds submit` + `gcloud run deploy`). State is a SQLite store that re-seeds the demo user on launch.

**Test gate:** the backend suite passes at **52 passing, 3 skipped, 0 failed**. The deterministic scoring logic is held under a strict change-firewall and verified zero-diff at every checkpoint.

### Roadmap (honestly scoped — written but not yet wired)

- **MCP server** (`app/mcp_server.py`): the module is written but **not yet operational** (no runtime entrypoint, nothing imports it). Listed here as roadmap, not as a claimed live feature.
- **Gemini Enterprise endpoint integration** for Marketplace listing.
- **Persistent multi-tenant storage** (current SQLite store is ephemeral by design for the demo).

---

## Business Case

**The problem.** Enterprises are pouring money into AI and getting almost nothing back — and the failures trace to readiness, not models.

- MIT's Project NANDA report *The GenAI Divide: State of AI in Business 2025* (July 2025) found that despite an estimated $30–40B in enterprise GenAI investment, **95% of organizations saw no measurable P&L impact**; only 5% of integrated pilots extracted real value.
- Gartner predicts that **through 2026, organizations will abandon 60% of AI projects unsupported by AI-ready data** (Gartner, Feb 2025).
- Gartner further forecasts that **over 40% of agentic AI projects will be canceled by the end of 2027**, citing escalating costs, unclear business value, and inadequate risk controls (Gartner, June 2025).

For **regulated** mid-market enterprises the bar is higher still: an AI initiative that can't show provenance, governance, and auditability doesn't just underperform — it can't be deployed at all.

**The status quo** is a one-off consulting engagement: roughly **$50K and 4–6 weeks** for a manual readiness assessment that is stale the day it's delivered. CertaintyAI productizes that into a repeatable, auditable, agent-driven assessment.

**Go-to-market: Google Cloud Marketplace.** Track 3's distribution channel is also strong unit economics for an ISV:

- **Standard Marketplace revenue share is 3%**, dropping to as low as **1.5%** for large private offers (Google Cloud, 2025) — versus the historical 20%.
- Buyers can apply **committed Google Cloud spend** toward the purchase, removing budget friction in enterprise accounts.
- A Futurum Research study commissioned by Google Cloud (*Scaling Smarter*, June 2025) found Marketplace partners see **112% larger deal sizes**, close deals **2–4 weeks faster (up to 50% time savings)**, and a **14% improvement in customer retention**.

**Revenue model:** SaaS subscription tiers (self-serve → team → enterprise) plus Marketplace private offers for committed-spend enterprise deals, with services attach for regulated-industry onboarding.

---

## Innovation

- **Deterministic + generative as cooperating agents.** Most "AI assessment" tools let an LLM invent the numbers. CertaintyAI separates concerns: a deterministic, test-gated engine owns every score, and the generative agent only explains and contextualizes. Same inputs, same auditable output.
- **Open protocol over walled garden.** A2A runs cross-process between two independently deployable agents — interoperability by standard, not by monolith. This is what makes the system extensible and Marketplace-validatable.
- **Honesty as an enforced product property, not an aspiration.** Every fabricated metric was **removed at its source in the code and verified live** in a clean incognito session with a freshly generated report. Where a value isn't computed, the UI shows an honest `—` / "Not computed" / "Roadmap" — never a plausible-looking fake. For a product whose entire thesis is *defensible* AI for auditors, that property is the product.

---

## Demo

- **Live app:** `https://certaintyai-frontend-217783557903.us-central1.run.app`
- **Login:** `demo@mdxblocks.com` / `Certainty2026!`
- **Video (≤2 min):** https://www.youtube.com/watch?v=VwuKJTi20PU

The video centers on the **live two-terminal A2A proof** (producer process serving an agent card; consumer process discovering and invoking it over the wire, with real Gemini responses), then walks an honest, freshly generated readiness report and the assistant experience. All on-screen numbers in the demo match the narration.

---

## A Note for Judges on Honesty Boundaries

We held this submission — including this document — to the same honesty standard as the product. The five statistics cited in the Business Case (MIT NANDA, the two Gartner forecasts, the Marketplace revenue-share schedule, and the Futurum study) are quoted in their sources' own framing and are traceable to MIT Project NANDA, Gartner press releases, Google Cloud's partner documentation, and the Google-commissioned Futurum whitepaper respectively. Inside the application, no number is shown unless it is genuinely computed; everything else is an explicit empty state. The MCP server is described as written-but-not-wired because that is precisely its status. We would rather under-claim and be verifiable than over-claim and be wrong — which is, after all, the entire point of CertaintyAI.
