export const DOMAINS = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    accent: '#A8506A',
    glow: 'rgba(168, 80, 106, 0.22)',
    blurb:
      'AI that clinicians, payers, and regulators can defend — grounded in SNOMED, LOINC, ICD-10 and a real evidence trail.',
  },
  {
    id: 'finance',
    name: 'Finance',
    accent: '#3A7E92',
    glow: 'rgba(58, 126, 146, 0.22)',
    blurb:
      'Governed financial intelligence — every recommendation cites the rule, the source row, and the policy that allows it.',
  },
  {
    id: 'education',
    name: 'Education',
    accent: '#D8B061',
    glow: 'rgba(216, 176, 97, 0.26)',
    blurb:
      'Personalized learning that respects FERPA and COPPA, with faculty-in-the-loop on every consequential decision.',
  },
]

export const COPILOTS = [
  // ---------- Healthcare ----------
  {
    id: 'ai-cdss',
    domain: 'healthcare',
    name: 'AI-CDSS Copilot',
    tagline: 'Clinical decision support grounded in evidence, governance, and explainability.',
    capabilities: [
      'Evidence-grounded suggestions with SNOMED / LOINC / ICD-10 lookups',
      'Clinician-override flow on every consequential recommendation',
      'Per-recommendation audit trail with citation lineage',
      'Hallucination guardrails enforced against the ontology layer',
    ],
    frameworks: ['HIPAA', 'FDA AI/ML', 'NIST AI RMF', 'ISO 42001'],
    status: 'pilot',
    persona: 'CMIO · CMO · Clinical Quality',
  },
  {
    id: 'ai-pfis',
    domain: 'healthcare',
    name: 'AI-PFIS Copilot',
    tagline: 'Patient Financial Information System — pre-eligibility, estimation, and propensity-to-pay, governed.',
    capabilities: [
      'Real-time eligibility and benefits verification across payer rules',
      'Patient cost estimates with policy citations and confidence bands',
      'Propensity-to-pay scoring with bias guardrails',
      'Audit trail for every estimate that touches a billed encounter',
    ],
    frameworks: ['HIPAA', 'HITECH', 'NIST AI RMF', 'State Billing Rules'],
    status: 'pilot',
    persona: 'CFO · Revenue Cycle · Patient Access',
  },
  {
    id: 'prior-auth',
    domain: 'healthcare',
    name: 'Prior Authorization Copilot',
    tagline: 'Accelerate authorization workflows with AI-assisted reviews and audit trails.',
    capabilities: [
      'Policy + medical-necessity matching against payer rule sets',
      'Document evidence extraction from EHR and uploaded packets',
      'Reviewer-ready decision summary with traceable citations',
      'End-to-end decision lineage for downstream appeals',
    ],
    frameworks: ['HIPAA', 'HITECH', 'NIST AI RMF', 'State Payer Rules'],
    status: 'coming-soon',
    persona: 'Utilization Mgmt · Revenue Cycle · Payer Operations',
  },

  // ---------- Finance ----------
  {
    id: 'tax-planner',
    domain: 'finance',
    name: 'AI Tax Planner Copilot',
    tagline: 'Governed financial intelligence with explainable recommendations.',
    capabilities: [
      'Multi-jurisdiction tax-code retrieval grounded in citations',
      'Scenario modeling with deterministic math, generative explanation',
      'CFO board-ready memo synthesis from the same audit trail',
      'Policy guardrails for advice scope and disclaimer language',
    ],
    frameworks: ['SOX', 'GAAP / IFRS', 'IRC', 'NIST AI RMF'],
    status: 'available',
    persona: 'CFO · Corporate Tax · Treasury',
  },
  {
    id: 'quanto-finops',
    domain: 'finance',
    name: 'Quanto FinOps Copilot',
    tagline: 'Govern cloud and AI spend — show every dollar a cited reason.',
    capabilities: [
      'Unit-economics view across model runs, workloads, and teams',
      'Anomaly detection with policy guardrails before alerts page',
      'Committed-spend optimization recommendations with cited tradeoffs',
      'FinOps-board-ready monthly close with traceable lineage',
    ],
    frameworks: ['FinOps Framework', 'SOX', 'NIST AI RMF', 'ISO 42001'],
    status: 'coming-soon',
    persona: 'CFO · FinOps · Cloud Operations',
  },

  // ---------- Education ----------
  {
    id: 'gradeup',
    domain: 'education',
    name: 'GradeUP Copilot',
    tagline: 'Faculty-grade assistant for assessment design, grading, and learner feedback — without bias drift.',
    capabilities: [
      'Rubric-grounded assessment generation with evidence citations',
      'Bias and equity monitoring across student cohorts',
      'Faculty-in-the-loop on every grade-impacting decision',
      'Lineage on every model output for academic appeal',
    ],
    frameworks: ['FERPA', 'COPPA', 'NIST AI RMF', 'ISO 42001'],
    status: 'available',
    persona: 'Provost · Dean · Faculty Council',
  },
  {
    id: 'skillup',
    domain: 'education',
    name: 'SkillUP Copilot',
    tagline: 'Personalized learning and readiness guidance.',
    capabilities: [
      'Personalized learning paths from competency-to-curriculum mapping',
      'Privacy-first student modeling — no fine-tune on minor data',
      'Faculty-in-the-loop review on every promotion or intervention',
      'Equity & bias monitoring across cohorts',
    ],
    frameworks: ['FERPA', 'COPPA', 'NIST AI RMF', 'ISO 42001'],
    status: 'available',
    persona: 'Provost · Dean · Workforce Development',
  },

]

export function copilotsByDomain() {
  return DOMAINS.map((d) => ({
    domain: d,
    copilots: COPILOTS.filter((c) => c.domain === d.id),
  }))
}
