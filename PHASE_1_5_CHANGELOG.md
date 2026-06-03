# CertaintyAI — Phase 1.5 Changelog

**Date:** 2026-05-24
**Status:** Shipped — anonymous-first 14-question CertaintyAI flow + C-suite report features.

Phase 1.5 reconciles the original `CONTEXT.md` Phase 1 spec with the CertaintyAI
HTML reference (14-question survey, framework-grid report) and the user-confirmed
C-suite feature set. Phase 2 deferrals in CONTEXT.md §6 remain untouched.

---

## 1. Survey — schema rewrite

The original 5-step survey (`industry`, `company_size`, `ai_maturity`,
`data_state`, `governance`, `current_blockers`, `ai_use_cases`) is replaced by
the CertaintyAI 14-question shape. See `backend/app/schemas.py::SurveyAnswers`:

| Q | Field name(s)                                          |
|---|--------------------------------------------------------|
| 1 | `company` (company_name, contact_name, email, additional_deliverables) |
| 2 | `role` (cio_cto / cdo / compliance / head_of_ai / business_leader / security) |
| 3 | `objectives` (multi) + `objectives_other`             |
| 4 | `painPoints` (multi) + `painPoints_other`             |
| 5 | `dataState` (location, format, freshness, quality, volume) |
| 6 | `domains` (multi) + `domains_other`                   |
| 7 | `maturity` (multi)                                    |
| 8 | `semantic` (1-2_same / 3-5_aligned / 6-10_variation / 10plus_different) |
| 9 | `rag` (none / pilot_unknown / pilot_70_85 / prod_70_85 / prod_above_85) |
| 10| `audit` (yes / partial / no)                          |
| 11| `oversight` (formal_committee / partial_adhoc / none) |
| 12| `blockers` (multi) + `blockers_other`                 |
| 13| `priority` (risk_reduction / audit_readiness / standardization / cost_control / speed_to_production) |
| 14| `custom_frameworks` (free text)                       |

---

## 2. Scoring — replaces CONTEXT.md §9

`backend/app/agents/score_agent.py` now implements the CertaintyAI-weighted formula:

```
total = (semantic*0.30 + rag*0.20 + audit*0.20 + oversight*0.10 + data*0.10) + 10
```

Sub-score lookups:
- `SEMANTIC_SCORES`:  85 / 60 / 35 / 15
- `RAG_SCORES`:       20 / 30 / 70 / 75 / 88
- `AUDIT_SCORES`:    100 / 50 / 0
- `OVERSIGHT_SCORES`: 85 / 50 / 20
- `data_score` starts at 70, deducts 15 for messy / 30 for very_messy, 15 for monthly freshness, 10 for unstructured-only.

**Maturity tiers** (replaces the four Nascent/Emerging/Operational/Optimized bands):
- 0–49  → Low / Foundational
- 50–69 → Moderate / Developing
- 70–84 → High / Ready
- 85–100 → Advanced / Scalable

Also emits **NIST AI RMF sub-scores**: GOVERN (= oversight) and MEASURE (= rag).

---

## 3. New deterministic modules

| Module | What it does |
|---|---|
| `backend/app/agents/frameworks.py` | Resolves industry → frameworks. Global baseline (Gartner / NIST AI RMF / CMMI / DCAM / EU AI Act / ISO 42001 / GDPR / SOC 2) + per-industry table (HIPAA, FERPA, PCI DSS, SOX, FedRAMP, etc.) + keyword sweep (healthcare → HIPAA, payment/bank → PCI). Each framework carries display name, category, URL, and rationale. |
| `backend/app/agents/gap_analysis.py` | Conditional strengths (always: leadership commitment; per-industry expertise; production-AI line if scaling). Conditional gaps (semantic fragmentation, accuracy <95%, missing provenance, governance gaps, data-quality issues). 5 always-on prioritized recommendations with week ranges. |
| `backend/app/agents/csuite_features.py` | **Peer benchmark** (your score vs industry median / top quartile, sourced to Gartner CIO Agenda). **90-day value roadmap** ($ cost-of-inaction vs cost-of-action per phase, scaled by company size). **Evidence Pack preview** (industry-tuned sample query → ontology nodes → source systems → compliance controls satisfied → confidence %). **Regulator-conditional paragraph** for healthcare / BFSI / government / cybersecurity / education. |

---

## 4. Orchestrator — full pipeline

`backend/app/agents/orchestrator.py::generate_readiness_report` now runs:
1. `score_agent.calculate_scores`
2. `frameworks.resolve_frameworks` + `group_by_category`
3. `gap_analysis.run`
4. `csuite_features.peer_benchmark` / `value_roadmap` / `evidence_pack_preview` / `regulator_paragraph`
5. `insights_agent.generate_insights` (LLM)
6. `narrative_agent.generate_narrative` (LLM)

Returns a flat context dict directly consumable by the Jinja template.

---

## 5. Report template — CertaintyAI-aligned with C-suite blocks

`backend/app/report/template.html` rewritten with these sections in order:

1. Cover (company / contact / email / generated-at + big score dial + maturity tier + industry pills)
2. **Frameworks Applied** (24+ standards, grouped by category, with checkmarks and authority URLs)
3. Strategic Context (objectives / pain points / blockers as chips + Gartner Insight callout)
4. **NIST AI RMF Function Scores** (GOVERN + MEASURE with progress bars and Gartner citation)
5. Current State Analysis (LLM narrative)
6. Data Maturity Review (LLM narrative + Gartner 4-Enablers reference)
7. Findings (LLM narrative + strengths / gaps cards)
8. **Peer Benchmark** (visual bar with your-score vs median vs top-quartile markers)
9. **90-Day Value Roadmap** (5 phases with cost-of-inaction $ figures + net-value totals)
10. **Evidence Pack Preview** (sample query → ontology trail → source systems → controls)
11. Prioritized Recommendations (5 always-on with week ranges)
12. Regulator-Specific Notes (conditional paragraph)
13. Why CertaintyAI vs Generic LLM / Palantir-class
14. Executive Scorecard (LLM narrative)
15. CTAs (Print PDF / Schedule Free Consultation / Start Over)

Print-friendly CSS (light palette in `@media print`).

---

## 6. Anonymous flow

- `POST /survey` is now **public** (no auth). Survey router uses an
  `auto_error=False` bearer dep so authenticated submissions are still bound
  to the user; anonymous ones get a UUID `anon_token`.
- New `GET /report/by-token/{token}` (public) for anonymous viewers.
- New `POST /auth/claim-report/{token}` (auth) to bind an existing anonymous
  assessment to the logged-in user.
- Signup and login auto-claim any orphan assessments where the email matches.
- `Assessment.user_id` is now nullable; `anon_token` is always populated;
  `contact_email` captured from `company.email` so claim-by-email works.

---

## 7. Frontend

- `/survey` and `/report/:token` are now public routes (no `ProtectedRoute`).
- Landing CTA goes straight to `/survey` (no signup gate).
- `SurveyWizard.jsx` is data-driven from a 14-entry `QUESTIONS` array;
  5 question types (identity, radio, multi, data_state, text). Inline
  validation for "Other (please specify)". Per-question framework citations
  in subtitles.
- `Report.jsx` fetches by token, auto-claims if logged-in, shows a
  "Save this report — sign up" banner for anonymous viewers.
- `Signup.jsx` / `Login.jsx` accept a `?claim=<token>` query param and
  post-auth call `/auth/claim-report/{token}` then redirect to the report.
- `Profile.jsx` updated for the new API fields (`total_score`, `company_name`,
  `domains`, `anon_token`).

Orphaned files (still on disk but no longer imported by `SurveyWizard.jsx`):
`StepIndustry.jsx`, `StepMaturity.jsx`, `StepData.jsx`, `StepGovernance.jsx`,
`StepReview.jsx`. Safe to delete in a cleanup pass.

---

## 8. Tests

`backend/tests/` (run with `pytest`):
- `test_score_agent.py` — 12 tests (sub-score lookups, tier banding, data-state
  deductions, NIST RMF projection, full weighted-sum spot-check).
- `test_frameworks.py` — 10 tests (global baseline, industry mapping, keyword
  triggers, custom-framework parsing, deduplication, grouping).
- `test_gap_analysis.py` — 11 tests (recommendation count + week ranges,
  conditional strengths, every gap-firing condition, perfect-profile produces
  empty gap list but keeps recommendations).

**Total: 33 tests, all passing.**

---

## 9. Running

First run after this update — **delete the old SQLite DB** because the
schema changed (added `Assessment.anon_token`, made `user_id` nullable):

```bash
rm backend/data/certaintyai.db
cd backend && uvicorn app.main:app --reload
# in another tab:
cd frontend && npm run dev
```

Default LLM provider: `anthropic` / `claude-sonnet-4-6` (set
`ANTHROPIC_API_KEY` in `backend/.env`). If no key is present, both LLM
agents fall back to deterministic safe-default narrative — the report still
renders, just without the bespoke Claude prose.

---

## 10. Sanctioned Phase 1.5 deviations from CONTEXT.md

| Area | CONTEXT.md said | Phase 1.5 reality | Why |
|---|---|---|---|
| Survey shape | 5 fields per §8 | 14-question CertaintyAI shape | User-confirmed; matches the HTML reference and Amsys deliverables. |
| Scoring | Maturity-baseline + bonuses/penalties per §9 | Weighted sub-score sum + 10 base offset | CertaintyAI-spec produces tier-aligned scores (Low/Moderate/High/Advanced) that match the report's headline number more directly. |
| Survey auth | Required (ProtectedRoute) | Anonymous-allowed | C-suite buyers won't sign up to evaluate the tool; signup converts post-report instead. |
| Report shape | 4 Amsys deliverables in one HTML | Same 4 + Frameworks grid + NIST sub-scores + Peer benchmark + $ Value roadmap + Evidence Pack preview + Regulator paragraph + CTAs | Asked for explicitly to impress C-suite signers. |
| Profile claim | Not specified | Auto-claim by email match on signup/login + explicit POST /auth/claim-report/{token} | Required to convert anonymous reports into logged-in assets. |

All Phase 2 deferrals in CONTEXT.md §6 (Google ADK, A2A, MCP, pgvector,
Docker, real GraphRAG, HITL, observability) remain deferred and untouched.
