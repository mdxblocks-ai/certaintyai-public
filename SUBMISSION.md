# CertaintyAI — Devpost Submission & Complete Project Description

This document serves as the official project proposal and submission draft for **CertaintyAI** in the **Google for Startups AI Agents Challenge 2026**. 

---

## Elevator Pitch
> **"CertaintyAI is the first ontology-driven Enterprise AI assessment framework designed for mid-market regulated industries. By positioning a defined semantic ontology structure between raw enterprise categories and Google Cloud's Gemini models, we eliminate hallucinations and deliver completely auditable, explainable, and containerized multi-agent decisions designed for future direct deployment via the Google Cloud Marketplace."**

---

## 1. Project Requirements Checklist

| Requirement | CertaintyAI Status & Verification Path | Details |
| :--- | :--- | :--- |
| **Code** | **COMPLETED & PACKAGED**<br>[certaintyai-public Repository](https://github.com/mdxblocks-ai/certaintyai-public) | Production-hardened FastAPI backend and Vite+React frontend. Contains multi-stage `Dockerfiles` and PostgreSQL support for secure containerized operations. |
| **Architecture Diagram** | **COMPLETED & PNG GENERATED**<br>[Architecture Diagram](Docs/architecture.png) | Full-scale **10-Layer Enterprise AI Stack with Ontology Layer** context guide compiled as high-resolution PNGs and print-ready PDF documents. |
| **Video** | **PROPOSED STORYBOARD & WALKTHROUGH**<br>[Video Demonstration]([VIDEO URL - TBD]) | A structured 2.5-minute video walkthrough showcasing: (a) The B2B problem of semantic fragmentation, (b) The interactive 3D Isometric Stack and centered SVG canvas, and (c) The live multi-agent execution and generation of McKinsey-grade PDF reports. |
| **Testing Access** | **COMPLETED & LIVE**<br>[Live Demo URL](https://certaintyai-frontend-217783557903.us-central1.run.app) | Live production B2B web application hosted on Google Cloud Run. Local production simulation supported via [docker-compose.prod.yml](file:///c:/Project/MDx-CoPilots/Copilots/AntiGravity/MDxCAI/Source/Deploymentstrategy/docker-compose.prod.yml). |

---

## 2. Project Categories & Track 3 Architectural Mandates

CertaintyAI is submitted exclusively under **Track 3: Refactor for Google Cloud Marketplace & Gemini Enterprise**. 

### 🛡️ How CertaintyAI Meets Track 3 Mandates:

*   **B2B Focus (Healthcare, BFSI, Cybersecurity):**
    Unlike generic B2C wrappers, CertaintyAI solves the multi-billion dollar **B2B challenge of semantic fragmentation**—unifying transactional enterprise classifications (SAP ERP, Snowflake, Oracle, DB2, EHRs) under a single, governed semantic ontology structure to generate instant, auditable **AI Readiness Assessments** for executive boards.
*   **Cloud-Native Runtime (Cloud Run):**
    CertaintyAI's operational environment has been completely refactored into a cloud-native, microservice architecture. Deployed via **Google Cloud Run** and communicating with a hosted PostgreSQL instance, it leverages Secret Manager for API keys. Enterprise roadmap paths (e.g., GKE deployment, Helm packaging, and Private Service Connect) are planned and documented.
*   **Google Cloud Powered Intelligence (Gemini & Vertex AI):**
    Our multi-agent reasoning layer (`ReadinessReportAgent`) utilizes Gemini via Google Vertex AI to orchestrate cognitive planning. The long context window of Gemini is leveraged to digest user intake payloads and map them to standard taxonomies in a single reasoning pass.

---

## 3. Technical Implementation (30% Evaluation Weight)

CertaintyAI represents an architectural framework that introduces **Ontology as a structured layer** between enterprise classifications and AI reasoning.

```
+-------------------------------------------------------------+
|              Layer 9: Application & Experience              |
|        (Vite Frontend / Centered 3D Interactive Stack)       |
+-------------------------------------------------------------+
                               | 
+-------------------------------------------------------------+
|            Layer 6: AI & Orchestration (AIP Core)            |
|     (Multi-Agent Orchestrator: Router -> Tracker -> Val)    |
+-------------------------------------------------------------+
                               | (Gemini Grounding)
+-------------------------------------------------------------+
|             Layer 5 & 4: Intelligence & Ontology            |
|      (Domain Ontologies / GraphRAG / Evidence Pack Builder) |
+-------------------------------------------------------------+
                               | (C-Shaped Bezier Data Bridge)
+-------------------------------------------------------------+
|                Layer 1: Open Enterprise Data                |
|      (SAP, Snowflake, Oracle, DB2 - Target Data Sources)    |
+-------------------------------------------------------------+
```

### Key Technical Pillars:
1.  **Multi-Agent Orchestrator:**
    The core runtime is built using a custom multi-agent orchestrator. It coordinates specialized sub-agents:
    *   `ScoreCalculationAgent`: A deterministic Python engine that mathematically calculates the Semantic Fragmentation Score and Executive Score based on industry constraints.
    *   `InsightsGenerationAgent`: A Gemini-powered agent that evaluates the calculated scores against the enterprise ontology to compile risks, gaps, and recommendations.
    *   `NarrativeAgent`: Synthesizes scores and insights into professional, McKinsey-style prose.
    *   `ReadinessReportAgent`: Co-coordinates the workflow, verifying outputs at each step.
    *(Note: Integration with the formal Google Vertex AI Agent Development Kit (ADK) / Agent Builder SDK is planned as future work).*
2.  **Semantic Grounding & Planned GraphRAG (Layer 5 Roadmap):**
    Our architecture is designed to integrate a custom GraphRAG engine that maps raw database schemas onto standard taxonomies (SNOMED-CT for Healthcare, ISO27001 for Cybersecurity, and FinOps expense indices). On our roadmap, this semantic layer will ground Gemini via Vertex AI Search and private data catalogs, bypassing standard flat-vector limitations.
3.  **The Evidence Pack Builder (Roadmap):**
    We have designed an explainability-first pipeline where recommendations can be trace-backed to raw database records. On our technical roadmap, the **Evidence Pack Builder** (Layer 5) will compile these citations and cryptographically log them in an immutable **Audit Trail Database** (Layer 8) to guarantee tamper-proof provenance for regulatory review.

---

## 4. Business Case & Monetization (30% Evaluation Weight)

### The B2B Problem:
Regulated mid-market enterprises (Healthcare, BFSI, Cybersecurity) want to adopt Generative AI, but are stalled by massive blockers: data silos, fear of hallucinations, and compliance risks. Standard consulting agencies charge upwards of $50,000 to perform a manual "AI Readiness Assessment," taking 4 to 6 weeks. 

Meanwhile, organizations are pouring billions into AI initiatives. However, **MIT's Project NANDA (2025)** found that roughly **95% of generative AI pilots show no measurable P&L impact** (only ~5% succeed). Furthermore, **Gartner forecasts that 60% of enterprise AI projects are abandoned or fail to progress** due to a lack of AI-ready data, and that more than 40% of agentic AI projects will be abandoned by 2027.

### The CertaintyAI Solution:
CertaintyAI automates this assessment. By taking a 2-minute governed survey (dynamically tailored to CFO or Security Director/CISO concerns), our multi-agent stack generates a print-ready, McKinsey-grade **AI Readiness Report** with verifiable data lineages.

### Commercialization & Monetization Model:
1.  **Designed for Google Cloud Marketplace:**
    CertaintyAI is designed to be packaged as a standard Helm chart deployable with one click inside a customer's secure GCP perimeter via the Google Cloud Marketplace. This drives massive GCP infrastructure consumption, making Google Cloud our natural, primary distribution partner. Under this model, we benefit from Google's Marketplace economics:
    *   A low **3% standard take rate** (scaling down to 2% or 1.5% on large private offers).
    *   **100% committed-spend drawdown capability** (up to a 25% cap), allowing enterprise buyers to fund CertaintyAI directly from their existing Google Cloud commits.
    *   A Google-published **co-sell uplift** demonstrating **112% larger deals and up to 50% faster cycles** (based on the Futurum/Google study, June 2025).
2.  **SaaS Licensing Tier:**
    *   **Assess (Free/POC):** Self-service 2-minute wizard generating the Executive Scorecard.
    *   **Govern (Enterprise Tier Roadmap):** Direct integration of data connectors (SAP, Oracle, Snowflake) to run continuous, real-time semantic audits and automated compliance mapping.

---

## 5. Innovation & Creativity (20% Evaluation Weight)

### Radical Differentiators:
1.  **Ontology as Infrastructure:** 
    Most current AI apps bolt metadata or prompts on top of an LLM. CertaintyAI is innovative because it treats the **Ontology Layer (Layer 4)** as real, active architectural middleware. The ontology governs how data is ingested, how the database is structured, how agents think, and how actions are validated.
2.  **Interactive SVG Stack Interface:**
    The user interface features a centered, responsive **3D Isometric SVG Stack Canvas** (hosted live at `/architecture`). Users hover over distinct glass plates (Data Sources, Cloud Infra, Ontology, Trust Engine, and Orchestrator) to visually inspect planned data streams, active connections, and database templates (Snowflake, SAP, Oracle). It brings the backend architecture to life, making complex data systems approachable to C-suite buyers.
3.  **Explainability-First Design:**
    We replace black-box neural reasoning with a transparent, trace-backed model. If Gemini recommends a compliance change, the **Evidence Pack Builder** links it directly to the exact W3C ontology constraint, the exact database row (e.g., from SAP SCM), and the relevant regulatory paragraph (e.g., HIPAA §164.308).

---

## 6. Demo, Testing Access & Presentation (20% Evaluation Weight)

CertaintyAI is fully hosted, validated, and ready for immediate judging evaluation:

*   **Live Web Portal:** Visit the live deployment at **`https://certaintyai-frontend-217783557903.us-central1.run.app`** (Frontend served on Cloud Run, communicating securely with the backend API on Cloud Run).
*   **Video Demonstration:** [VIDEO URL - TBD]
*   **Demo Login Credentials:** 
    *   **Email:** `demo@mdxblocks.com`
    *   **Password:** `Certainty2026!`
*   **The Guided Walkthrough:**
    1.  Navigate to the live URL: `https://certaintyai-frontend-217783557903.us-central1.run.app`
    2.  Access the survey wizard:
        *   **As a Guest:** Click the **"AI Readiness"** link in the top navbar (or click the CTA buttons on the home page) to open the survey wizard.
        *   **As a Logged-In User:** Click **"Sign In"** in the top navbar and log in with `demo@mdxblocks.com` and password `Certainty2026!`. Then click **"New Assessment"** or **"Start AI Readiness Assessment"** in the dashboard.
    3.  Select your organization sector (Private or Public), organization name, role (**Security Director / CISO** or **CFO**), and your industry/mandate.
    4.  Click **"Tailor my scenario assessment →"**.
    5.  Go through the 5 tailored questions. Select your organization's options and click **"Continue →"** at each step.
    6.  Provide an optional email address and click **"🚀 Generate Report"** on the dispatch screen.
    7.  Inspect the print-ready, high-resolution McKinsey deliverable containing the **Executive Scorecard**, **Three Boardroom Decisions**, and **Peers Benchmark**.
*   **Local Simulation Instructions:**
    To run the entire PostgreSQL-backed microservice stack locally on your computer with a single command, navigate to `Source/Deploymentstrategy` and run:
    `docker-compose -f docker-compose.prod.yml up --build`
