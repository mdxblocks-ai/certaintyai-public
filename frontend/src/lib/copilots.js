export const DOMAINS = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    accent: '#A8506A',
    glow: 'rgba(168, 80, 106, 0.18)',
    blurb:
      'AI that clinicians, payers, and regulators can defend — grounded in SNOMED, LOINC, ICD-10 and a real evidence trail.',
  },
  {
    id: 'finance',
    name: 'Finance',
    accent: '#3A7E92',
    glow: 'rgba(58, 126, 146, 0.18)',
    blurb:
      'Governed financial intelligence — every recommendation cites the rule, the source row, and the policy that allows it.',
  },
  {
    id: 'education',
    name: 'Education',
    accent: '#D8B061',
    glow: 'rgba(216, 176, 97, 0.22)',
    blurb:
      'Personalized learning that respects FERPA and COPPA, with faculty-in-the-loop on every consequential decision.',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    accent: '#2F7D6B',
    glow: 'rgba(47, 125, 107, 0.18)',
    blurb:
      'Continuous, audit-ready scrutiny of your AI estate — controls, vendors, models, prompts, and policy attestation.',
  },
]

export const COPILOTS = [
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
    status: 'roadmap',
    persona: 'CMIO · CMO · Clinical Quality',
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
    status: 'roadmap',
    persona: 'Utilization Mgmt · Revenue Cycle · Payer Operations',
  },
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
    status: 'roadmap',
    persona: 'CFO · Corporate Tax · Treasury',
  },
  {
    id: 'skillup',
    domain: 'education',
    name: 'SkillUP AI Copilot',
    tagline: 'Personalized learning and readiness guidance.',
    capabilities: [
      'Personalized learning paths from competency-to-curriculum mapping',
      'Privacy-first student modeling — no fine-tune on minor data',
      'Faculty-in-the-loop review on every promotion or intervention',
      'Equity & bias monitoring across cohorts',
    ],
    frameworks: ['FERPA', 'COPPA', 'NIST AI RMF', 'ISO 42001'],
    status: 'roadmap',
    persona: 'Provost · Dean · Workforce Development',
  },
  {
    id: 'security-auditor',
    domain: 'cybersecurity',
    name: 'AI Security Auditor',
    tagline: 'Identify AI risks, governance gaps, and compliance issues.',
    capabilities: [
      'Control-gap detection against NIST AI RMF GOVERN / MEASURE',
      'Vendor and model risk triage with provenance scoring',
      'Continuous policy attestation with evidence-pack export',
      'Red-team prompt and data-exfiltration pattern checks',
    ],
    frameworks: ['NIST AI RMF', 'ISO 27001', 'SOC 2', 'EU AI Act'],
    status: 'roadmap',
    persona: 'CISO · Security Architect · GRC',
  },
]

export function copilotsByDomain() {
  return DOMAINS.map((d) => ({
    domain: d,
    copilots: COPILOTS.filter((c) => c.domain === d.id),
  }))
}
