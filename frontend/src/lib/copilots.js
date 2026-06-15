// Domain × Status × Category taxonomy for the Copilot Marketplace page.
//
// Status values:
//   'ready-for-demo'        — production-ready demo today
//   'working-in-progress'   — actively under development
//   'on-roadmap'            — planned future capability
// Legacy keys ('available' / 'pilot' / 'coming-soon') are still accepted by
// StatusChip via an alias map; new entries should use the canonical keys above.
//
// Category values (long-term marketplace vision — supports future expansion
// into AI Advisors / AI Agents / Industry Templates / Compliance Packs /
// Knowledge Packs without redesign):
//   'copilot'         — industry copilot (default)
//   'advisor'         — cross-industry executive advisor
//   'agent'           — autonomous agent (future)
//   'template'        — industry-specific template pack (future)
//   'compliance-pack' — framework-aligned compliance pack (future)
//   'knowledge-pack'  — curated knowledge / ontology pack (future)
export const CATEGORIES = [
  { id: 'copilot',         name: 'Industry Copilots' },
  { id: 'advisor',         name: 'AI Advisors' },
  { id: 'agent',           name: 'AI Agents' },
  { id: 'template',        name: 'Industry Templates' },
  { id: 'compliance-pack', name: 'Compliance Packs' },
  { id: 'knowledge-pack',  name: 'Knowledge Packs' },
]

export const DOMAINS = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    accent: '#0D9488',                          // Medical teal
    glow: 'rgba(13, 148, 136, 0.22)',
    blurb:
      'AI that clinicians, payers, and regulators can defend — grounded in SNOMED, LOINC, ICD-10 and a real evidence trail.',
  },
  {
    id: 'finance',
    name: 'Financial Services & Accounting',
    accent: '#1E40AF',                          // Deep blue
    glow: 'rgba(30, 64, 175, 0.22)',
    blurb:
      'Governed financial intelligence — every recommendation cites the rule, the source row, and the policy that allows it.',
  },
  {
    id: 'education',
    name: 'Education & Workforce',
    accent: '#D8B061',                          // Gold / amber
    glow: 'rgba(216, 176, 97, 0.26)',
    blurb:
      'Personalized learning and workforce upskilling that respect FERPA and COPPA, with faculty-in-the-loop on every consequential decision.',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    accent: '#DC2626',                          // Red / crimson
    glow: 'rgba(220, 38, 38, 0.22)',
    blurb:
      'Security copilots that respect rules of engagement, ground every recommendation in the control catalog, and never act without authorization.',
  },
  {
    id: 'ai-advisory',
    name: 'AI Advisory & Governance (Cross-Industry)',
    accent: '#4F46E5',                          // Indigo / royal blue
    glow: 'rgba(79, 70, 229, 0.22)',
    blurb:
      'Boardroom-ready AI advisors that translate readiness, governance, and investment posture into decisions the C-suite can defend. Sector-agnostic.',
  },
]

export const COPILOTS = [
  // ============================================================
  // Healthcare
  // ============================================================
  {
    id: 'ai-cdss',
    domain: 'healthcare',
    name: 'AI-CDSS Copilot™',
    tagline: 'Clinical decision support grounded in evidence, governance, and explainability.',
    capabilities: [
      'Evidence-grounded suggestions with SNOMED / LOINC / ICD-10 lookups',
      'Clinician-override flow on every consequential recommendation',
      'Per-recommendation audit trail with citation lineage',
      'Hallucination guardrails enforced against the ontology layer',
    ],
    frameworks: ['HIPAA', 'FDA AI/ML', 'NIST AI RMF', 'ISO 42001'],
    status: 'ready-for-demo',
    persona: 'CMIO · CMO · Clinical Quality',
  },
  {
    id: 'ai-pfis',
    domain: 'healthcare',
    name: 'AI-PFIS Copilot™',
    tagline: 'Patient Financial Information System — pre-eligibility, estimation, and propensity-to-pay, governed.',
    capabilities: [
      'Real-time eligibility and benefits verification across payer rules',
      'Patient cost estimates with policy citations and confidence bands',
      'Propensity-to-pay scoring with bias guardrails',
      'Audit trail for every estimate that touches a billed encounter',
    ],
    frameworks: ['HIPAA', 'HITECH', 'NIST AI RMF', 'State Billing Rules'],
    status: 'ready-for-demo',
    persona: 'CFO · Revenue Cycle · Patient Access',
  },
  {
    id: 'prior-auth',
    domain: 'healthcare',
    name: 'Prior Authorization Compliance Copilot™',
    tagline: 'Accelerate authorization workflows with AI-assisted reviews, audit trails, and continuous compliance attestation.',
    capabilities: [
      'Policy + medical-necessity matching against payer rule sets',
      'Document evidence extraction from EHR and uploaded packets',
      'Reviewer-ready decision summary with traceable citations',
      'End-to-end decision lineage for downstream appeals',
    ],
    frameworks: ['HIPAA', 'HITECH', 'NIST AI RMF', 'State Payer Rules'],
    status: 'working-in-progress',
    persona: 'Utilization Mgmt · Revenue Cycle · Payer Operations',
  },
  {
    id: 'healthcare-grc',
    domain: 'healthcare',
    name: 'Healthcare GRC Copilot™',
    tagline: 'Unified Governance, Risk, and Compliance copilot for healthcare — control attestation, risk triage, and audit assembly in one.',
    capabilities: [
      'Continuous control attestation against HIPAA / HITECH baselines',
      'Risk register grounded in your evidence vault with cited lineage',
      'Privacy-impact triage for AI-influenced clinical workflows',
      'Auditor-ready GRC pack assembly with traceable citations',
    ],
    frameworks: ['HIPAA', 'HITECH', 'NIST AI RMF', 'ISO 42001'],
    status: 'working-in-progress',
    persona: 'CCO · Privacy Officer · GRC Operations',
  },

  // ============================================================
  // Financial Services & Accounting
  // ============================================================
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
    status: 'ready-for-demo',
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
    status: 'on-roadmap',
    persona: 'CFO · FinOps · Cloud Operations',
  },

  // ============================================================
  // Education & Workforce
  // ============================================================
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
    status: 'ready-for-demo',
    persona: 'Provost · Dean · Faculty Council',
  },
  {
    id: 'skillup',
    domain: 'education',
    name: 'SkillUP Copilot (Workforce & Skills Development)',
    tagline: 'Personalized learning and workforce readiness guidance for adult learners and re-skillers.',
    capabilities: [
      'Personalized learning paths from competency-to-curriculum mapping',
      'Privacy-first learner modeling — no fine-tune on minor data',
      'Faculty / mentor-in-the-loop review on every promotion or intervention',
      'Equity & bias monitoring across cohorts',
    ],
    frameworks: ['FERPA', 'COPPA', 'NIST AI RMF', 'ISO 42001'],
    status: 'ready-for-demo',
    persona: 'Provost · Dean · Workforce Development',
  },
  {
    id: 'rankup',
    domain: 'education',
    name: 'RankUP Copilot',
    tagline: 'Accelerate exam readiness, certification success, career advancement, and performance outcomes through personalized AI-guided preparation and readiness intelligence.',
    capabilities: [
      'Personalized study and success plans based on goals and performance',
      'Competitive exam readiness for SAT, ACT, GRE, GMAT, JEE, NEET, UPSC and professional certifications',
      'Skills-gap identification with recommended learning pathways',
      'Career readiness insights aligned to industry demand and workforce trends',
      'Human-in-the-loop review for academic and career planning decisions',
    ],
    frameworks: ['EXAM READINESS', 'CAREER ADVANCEMENT', 'WORKFORCE DEVELOPMENT'],
    status: 'on-roadmap',
    persona: 'Students · Universities · Career Services · Workforce Development · Certification Programs',
  },

  // ============================================================
  // IT Consulting — DOMAIN REMOVED per spec. All 4 entries
  // (RFP Response, Knowledge Management, Project Delivery, Proposal
  // Intelligence) deleted along with the domain itself.
  // ============================================================

  // ============================================================
  // Cybersecurity
  // ============================================================
  {
    id: 'cyberintel',
    domain: 'cybersecurity',
    name: 'CyberIntel Copilot',
    tagline: 'Unified security intelligence — alert triage, threat-actor context, and incident-response support in one governed copilot.',
    capabilities: [
      'Source-grounded threat-actor and TTP context with citations',
      'Tier-1 alert enrichment bounded by rules-of-engagement policy',
      'Runbook-grounded IR action recommendations with chain-of-custody',
      'Executive-ready briefing assembly with traceable lineage',
    ],
    frameworks: ['NIST AI RMF', 'NIST SP 800-61', 'MITRE ATT&CK', 'ISO 27001'],
    status: 'on-roadmap',
    persona: 'CISO · SOC Manager · Threat Hunter',
  },

  // ============================================================
  // AI Advisory & Governance
  // ============================================================
  {
    id: 'ai-readiness-advisor',
    domain: 'ai-advisory',
    name: 'AI Readiness Advisor',
    tagline: 'Translate your AI Readiness score into a defensible 90-day action plan.',
    capabilities: [
      'Score-grounded gap analysis with cited sub-dimensions',
      'Sequenced 90-day plan with executive sponsorship',
      'Benchmark context against sector peers',
      'Board-ready summary with traceable lineage',
    ],
    frameworks: ['NIST AI RMF', 'ISO 42001', 'EU AI Act', 'OECD AI'],
    status: 'on-roadmap',
    persona: 'CIO · CDO · Chief Strategy Officer',
  },
  {
    id: 'ai-governance-advisor',
    domain: 'ai-advisory',
    name: 'AI Governance Advisor',
    tagline: 'Charter the AI Review Committee, define decision rights, and instrument continuous attestation.',
    capabilities: [
      'AI committee charter drafting grounded in your governance maturity',
      'Decision-rights mapping by use-case risk tier',
      'Policy gap analysis against NIST / ISO / EU AI Act',
      'Continuous attestation runbook with cited owners',
    ],
    frameworks: ['NIST AI RMF', 'ISO 42001', 'EU AI Act', 'OECD AI'],
    status: 'on-roadmap',
    persona: 'CIO · General Counsel · AI Committee',
  },
  {
    id: 'executive-strategy-advisor',
    domain: 'ai-advisory',
    name: 'Executive Strategy Advisor',
    tagline: 'Board-ready synthesis of AI posture, peer comparison, and investment options.',
    capabilities: [
      'Peer-comparison synthesis grounded in your readiness data',
      'Investment-option modeling with cited tradeoffs',
      'Narrative drafting for board and audit committee',
      'Risk-adjusted view of strategic AI initiatives',
    ],
    frameworks: ['NIST AI RMF', 'ISO 42001', 'EU AI Act', 'SOX'],
    status: 'on-roadmap',
    persona: 'CEO · CFO · Board AI Committee',
  },
  {
    id: 'ai-control-tower-advisor',
    domain: 'ai-advisory',
    name: 'AI Control Tower Advisor',
    tagline: 'Single-pane oversight of every AI workload in your portfolio with cited posture.',
    capabilities: [
      'Portfolio inventory with risk-tier classification',
      'Workload posture grounded in evidence and policy',
      'Drift detection against approved baseline',
      'Executive briefing assembly with traceable lineage',
    ],
    frameworks: ['NIST AI RMF', 'ISO 42001', 'SOC 2', 'EU AI Act'],
    status: 'on-roadmap',
    persona: 'CIO · CISO · AI Governance Office',
  },
  {
    id: 'ai-investment-roi-advisor',
    domain: 'ai-advisory',
    name: 'AI Investment & ROI Advisor',
    tagline: 'Investment-thesis support — unit economics, value realization, and payback you can defend.',
    capabilities: [
      'Unit-economics modeling grounded in your spend telemetry',
      'Value-realization tracking against committed business cases',
      'Payback and IRR analysis with cited assumptions',
      'Finance + IT joint briefing assembly',
    ],
    frameworks: ['FinOps Framework', 'SOX', 'NIST AI RMF', 'ISO 42001'],
    status: 'on-roadmap',
    persona: 'CFO · CIO · Finance Council',
  },
]

export function copilotsByDomain() {
  return DOMAINS.map((d) => ({
    domain: d,
    copilots: COPILOTS.filter((c) => c.domain === d.id),
  }))
}

/**
 * True iff the domain contains at least one ready-for-demo copilot.
 * Used to gate the section-level "Request Demo →" CTA per spec.
 */
export function domainHasReadyForDemo(domainId) {
  return COPILOTS.some((c) => c.domain === domainId && c.status === 'ready-for-demo')
}

/**
 * Per-domain count of copilots in each status bucket. Drives the compact
 * Industry summary on the homepage (the executive overview that links to
 * the full Copilot Marketplace).
 */
export function domainStatusCounts(domainId) {
  const list = COPILOTS.filter((c) => c.domain === domainId)
  return {
    ready:    list.filter((c) => c.status === 'ready-for-demo').length,
    wip:      list.filter((c) => c.status === 'working-in-progress').length,
    roadmap:  list.filter((c) => c.status === 'on-roadmap').length,
    total:    list.length,
  }
}
