# CertaintyAI — LLM-Generated Readiness Assessment
## Build Spec + Prompt for Antigravity

**Purpose of this file.** Hand this document to Antigravity *together with* `certaintyai.html` (the template). It tells the agent exactly what to build: replace the current template-token personalization with **LLM-generated assessment questions** tailored to each visitor's intake, while keeping the scoring deterministic and auditable.

---

## 0. TL;DR for the agent

Build a feature where, after the user completes the **intake step** (sector, organization name, role, department/industry), the app calls an LLM to **generate 6–8 personalized assessment questions**. The LLM writes the wording and assigns each answer option a score; **your code computes the final weighted score**. If the LLM call fails, fall back to the template questions already in the file. Do not block the user.

---

## 1. What already exists in the template

`certaintyai.html` is a single-file SPA (editorial design, parchment/ink/brass). The **AI Readiness** view runs an 8-step assessment:

- **Step 1 — Intake.** Captures:
  - `orgType`: `"public"` or `"private"`
  - `org`: organization / agency name (free text; public sector has autocomplete)
  - `role`: e.g. CEO, CFO, CIO/CTO, Chief Data Officer, CISO, Chief Risk/Compliance Officer
  - `domain`: ontology key — one of `healthcare | finance | cyber | education | finops | consulting | other` (public sector shows mandate labels; the underlying key is the same)
- **Steps 2–8 — Seven scored questions** that today use template token-swapping (`{org}`, `{entity}`, `{framework}`, `{industry}`, `{role}`).
- **Results** — a weighted **CertaintyAI Fit Score (0–100)**, sub-metrics, gaps, fix map, ROI, downloadable report.

The intake object is stored as `answers.intake`. The seven questions live in the `QUESTIONS` array. The scoring lives in `calc()`, `getGaps()`, `getFixes()`, `getROI()`.

**Replace the static `QUESTIONS` (steps 2–8 only) with LLM-generated questions. Leave the intake step, scoring math, and results rendering intact.**

---

## 2. Non-negotiable constraints (so scoring stays trustworthy)

The Fit Score is a weighted blend of **five dimensions**. Every generated question must map to exactly one of them, and every option must carry a numeric score so the existing math still works:

| Dimension key | Weight | Meaning | Score field |
|---|---|---|---|
| `semantic` | 35% | Semantic harmony — do systems define the same entity the same way? | `s` (0–100) **and** `frag` (0–100, higher = worse) |
| `rag` | 25% | Accuracy of AI answers on complex/multi-hop questions | `s` (0–100) |
| `audit` | 20% | Ability to produce a full provenance/audit trail | `s` (0–100) |
| `maturity` | 10% | Where they are with AI (exploring → scaling) | `w` (0–100) |
| `oversight` | 10% | Formal AI governance in place | `s` (0–100) |

**Rules:**
1. The LLM **must not** output a final score. It only writes question text and assigns each option a score within the right band. Your JS computes:
   `fit = round(semantic*0.35 + rag*0.25 + audit*0.20 + maturity*0.10 + oversight*0.10)`
2. Generate **at least one question per dimension** (5 minimum). You may add **1–2 extra** role- or domain-specific questions, but each extra must still be tagged to one of the five dimensions (and its score averaged in, or used as that dimension's value — see §6).
3. Total questions: **6–8**. Keep it under ~2 minutes.
4. Option scores must be **monotonic and sensible** (a "fully mature / fully governed / fully auditable" answer scores high; "none / not measured" scores low).

---

## 3. Runtime architecture

```
intake submitted
   → show loading state ("Tailoring your assessment for {role} at {org}…")
   → POST intake to your backend route  /api/generate-assessment
        (backend calls the LLM with the SYSTEM PROMPT in §4 + intake JSON)
   → receive STRICT JSON (schema in §5); validate
        ├─ valid   → set QUESTIONS = generated; render step 2
        └─ invalid → log, fall back to template QUESTIONS; render step 2
   → user answers → existing calc()/getGaps()/getFixes() run unchanged
```

**Key handling.** Never put the LLM API key in client code. In the React app, call the model from a server route / serverless function (e.g. Next.js route handler, Express endpoint, Cloud Function). The browser only ever sees the generated JSON.

**Model.** Use a fast, capable model — a small/low-latency tier (e.g. a Haiku-class model) is plenty for this and keeps cost and latency low; step up to a mid tier if you want richer wording. Set the model string to whatever is current for your provider at build time; do not hardcode an old one.

**Latency / UX.** Budget ~1–3s. Show the loading state. Optionally stream. Always keep the template fallback so a slow or failed call never traps the user.

**Caching.** Cache by a signature of the intake (`orgType|domain|role`) so identical profiles reuse a generated set and you don't pay per visit. Org *name* should personalize wording but should **not** be part of the cache key (cache on the structural fields, then string-substitute the org name client-side if you want exact name in the text).

**Privacy.** Send only the four intake fields. Do not send anything else. Treat org name as the only free-text field; sanitize before substitution.

---

## 4. THE SYSTEM PROMPT (give this verbatim to the runtime LLM)

> You are an expert advisor in AI governance and data readiness for **regulated industries** (healthcare, finance, cybersecurity, education, public sector, and similar). You design short, executive-grade readiness assessments.
>
> You will receive a JSON object describing one organization. Your job is to generate a **personalized AI-readiness questionnaire** for that specific organization and role.
>
> **Input you will receive:**
> ```json
> { "orgType": "public|private", "org": "string", "role": "string", "domain": "healthcare|finance|cyber|education|finops|consulting|other" }
> ```
>
> **What to produce:** 6 to 8 multiple-choice questions that assess how ready this organization is to deploy AI safely and defensibly. The questions must feel written specifically for this reader.
>
> **Coverage (mandatory).** Include at least one question for **each** of these five dimensions, using the exact `dimension` keys:
> - `semantic` — whether different systems define the same core entity consistently (data fragmentation / entity resolution).
> - `rag` — accuracy and trustworthiness of AI answers on complex, multi-step questions.
> - `audit` — ability to produce a full provenance / audit trail (sources, confidence, rationale) for any AI output.
> - `maturity` — how far along they are with AI (exploring → pilots → production → scaling).
> - `oversight` — whether formal AI governance, policy, and human oversight exist.
>
> You may add **one or two** extra questions specific to this role or domain, but each extra must be tagged to one of the five `dimension` keys above.
>
> **Personalization rules:**
> - Use the **right entity noun** for the domain: healthcare → "patient"; finance (private) → "customer"; finance (public) → "taxpayer"; cyber → "asset"; education → "student"; finops → "cost centre"; consulting → "client"; otherwise "core entity".
> - Reference the **right compliance frameworks** — and only ones that genuinely apply. Public sector → FISMA, FedRAMP, NIST 800-53. Private healthcare → HIPAA, HITECH. Private finance → SOX, Basel III, GLBA. Cyber → NIST CSF, ISO 27001, SOC 2. Education → FERPA. Add EU AI Act / GDPR where plausible. **Never invent a regulation or cite a statistic.**
> - **Tone by role:** business/finance/risk titles (CEO, CFO, COO, Chief Risk/Compliance) → plain business language, outcomes, board/audit framing; avoid jargon, never use the word "ontology." Technical titles (CTO, CIO, CDO, CISO, chief architect) → precise technical language (semantic layer, knowledge graph, GraphRAG, lineage, provenance).
> - Refer to the organization by name where natural.
>
> **Scoring rules (critical):**
> - For every option, assign a `score` from 0–100 reflecting how *ready* that answer is (more mature / governed / accurate / auditable = higher).
> - For `semantic` questions only, also add a `frag` value 0–100 to each option (higher = more fragmentation = worse; it should move inversely to `score`).
> - For `maturity` questions, the score still goes in `score` (0–100).
> - Make scores monotonic across options. Do **not** output any total or composite score — that is computed downstream.
>
> **Output format:** Return **only** valid JSON matching the schema below. No prose, no explanation, no markdown code fences. If you cannot comply, return `{"questions":[]}`.

(End of system prompt. The schema in §5 should be appended to the prompt as the required output contract.)

---

## 5. Required output schema

Append this to the prompt as the contract, and validate every response against it:

```json
{
  "questions": [
    {
      "id": "string (slug, unique)",
      "dimension": "semantic | rag | audit | maturity | oversight",
      "text": "string (the question, personalized)",
      "sub": "string (optional one-line helper/example)",
      "multi": false,
      "options": [
        { "value": "string", "label": "string", "score": 0,  "frag": 0 }
      ]
    }
  ]
}
```

Notes for the validator:
- `frag` is required **only** when `dimension === "semantic"`; ignore it elsewhere.
- 3–5 options per question; `score` is 0–100 integer.
- Reject and fall back if: not valid JSON, fewer than 5 questions, any of the five dimensions missing, any option missing `score`, or any score outside 0–100.

**Example of one well-formed question (private bank, CISO):**
```json
{
  "id": "entity-consistency",
  "dimension": "semantic",
  "text": "Across your core banking, CRM and risk systems, how consistently is a single customer represented?",
  "sub": "Conflicting definitions of 'customer' are the most common blocker to reliable AI at Meridian Bank.",
  "multi": false,
  "options": [
    { "value": "one",   "label": "One canonical definition, enforced everywhere", "score": 85, "frag": 15 },
    { "value": "mostly","label": "Mostly aligned across a few systems",            "score": 60, "frag": 40 },
    { "value": "varies","label": "Significant variation across 6–10 systems",      "score": 35, "frag": 70 },
    { "value": "siloed","label": "Every system defines it differently",            "score": 15, "frag": 90 }
  ]
}
```

---

## 6. Wiring the generated questions into the existing scorer

The template's `calc()` currently reads scores by question `id`. Change it to read by **dimension** so it works regardless of how many questions the LLM produced:

```js
function dimensionScore(dim, key) {
  // average the chosen option's `key` across all answered questions of this dimension
  const qs = QUESTIONS.filter(q => q.dimension === dim);
  const vals = qs.map(q => {
    const chosen = q.options.find(o => o.value === answers[q.id]);
    return chosen ? chosen[key] : null;
  }).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
}

function calc() {
  const semantic = dimensionScore('semantic','s') ?? 50; // note: rename option field to 's' or read 'score'
  const rag      = dimensionScore('rag','score')   ?? 50;
  const audit    = dimensionScore('audit','score') ?? 0;
  const maturity = dimensionScore('maturity','score') ?? 25;
  const oversight= dimensionScore('oversight','score') ?? 20;
  const frag     = dimensionScore('semantic','frag') ?? 50;
  const overall  = Math.round(semantic*0.35 + rag*0.25 + audit*0.20 + maturity*0.10 + oversight*0.10);
  return { overall, semantic, rag, audit, oversight, frag };
}
```

Keep `getGaps()`, `getFixes()`, `getROI()` driven by these dimension scores (they already are). This way the LLM can vary the questions freely while the scoring stays fixed and explainable.

---

## 7. (Optional) LLM-generated report narrative

You can also let the LLM write the **gaps, recommendations, and a one-paragraph executive summary** — but feed it the *computed* scores so it can't contradict the math. Second prompt:

> You are writing the executive summary of an AI-readiness report for {role} at {org} ({domain}, {orgType} sector). You are given the computed scores (0–100): semantic, rag, audit, maturity, oversight, overall, and a fragmentation-risk percentage. Write: (1) a 2–3 sentence board-ready summary in the correct tone for the role; (2) 2–4 specific gaps tied to the lowest scores; (3) for each gap, the matching CertaintyAI capability and a realistic time-to-value. Reference real frameworks only. State numbers exactly as given — never invent or change them. Output strict JSON: `{ "summary": "...", "gaps": [{ "title": "...", "detail": "..." }], "fixes": [{ "solution": "...", "detail": "...", "timeline": "..." }] }`. No prose outside the JSON.

Same discipline: the LLM writes prose, your code owns the numbers.

---

## 8. Guardrails & quality bar (acceptance criteria)

Antigravity should not consider this done until all of the following hold:

1. **Determinism of score.** Two users with identical answers always get the same Fit Score, regardless of how the wording was generated. (LLM never returns a total.)
2. **Schema validation + fallback.** Malformed or slow LLM responses silently fall back to the template questions; the user is never blocked or shown an error wall.
3. **Dimension coverage.** Every generated set contains all five dimensions; the validator rejects sets that don't.
4. **Tone correctness.** A CFO/CEO set contains no "ontology/GraphRAG/knowledge-graph" jargon; a CISO/CTO set does use precise technical terms. (Spot-check 3 roles × 2 sectors.)
5. **No fabricated compliance.** No invented regulations or statistics. Public-sector sets reference FISMA/FedRAMP/NIST 800-53; private-healthcare reference HIPAA; etc.
6. **Key safety.** No API key in client bundle; all model calls server-side.
7. **Latency + loading state.** Visible "Tailoring your assessment…" state; total added latency under ~3s typical.
8. **Caching.** Repeat profiles (same orgType|domain|role) don't trigger a fresh generation.
9. **Privacy.** Only the four intake fields leave the browser.
10. **Design parity.** Generated questions render in the existing question-card UI (`.q-card`, `.opt`, `.tailor` banner) with no visual regressions.

---

## 9. Suggested test matrix

| orgType | domain | role | Expect |
|---|---|---|---|
| public | healthcare | CFO | "patient", FISMA/FedRAMP, business tone, no "ontology" |
| public | finance | Chief Risk Officer | "taxpayer", NIST 800-53, audit framing |
| private | finance | CISO | "customer", SOX/Basel/ISO 27001, technical tone |
| private | healthcare | CIO/CTO | "patient", HIPAA/HITECH, GraphRAG/lineage terms |
| private | cyber | CISO | "asset", NIST CSF/SOC 2, attack-path framing |
| private | education | CEO | "student", FERPA, plain business language |

For each: all five dimensions present, scores monotonic, JSON valid, fallback works when the call is forced to fail.

---

## 10. Build order (recommended for the agent)

1. Stand up the server route `/api/generate-assessment` that proxies the model with the §4 prompt + §5 schema; add JSON validation.
2. Add a loading state after intake; call the route; on success swap `QUESTIONS`, on failure use the template set.
3. Refactor `calc()` to score by `dimension` (§6).
4. (Optional) Add the report-narrative route (§7).
5. Run the §9 matrix; satisfy the §8 acceptance criteria.

---

*Deliverable owner: CertaintyAI · by MDxBlocks. Template: `certaintyai.html`. This spec governs the LLM-generation layer only; design, intake, and scoring model are defined by the template.*
