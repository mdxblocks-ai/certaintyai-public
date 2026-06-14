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
    id: 'it-consulting',
    name: 'IT Consulting',
    accent: '#7C3AED',                          // Purple
    glow: 'rgba(124, 58, 237, 0.22)',
    blurb:
      'Delivery-grade copilots for consultancies — proposal velocity, knowledge capture, and engagement governance, all with audit-ready provenance.',
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
    name: 'AI Advisory & Governance',
    accent: '#4F46E5',                          // Indigo / royal blue
    glow: 'rgba(79, 70, 229, 0.22)',
    blurb:
      'Boardroom-ready AI advisors that translate readiness, governance, and investment posture into decisions the C-suite can defend.',
  },
]

export const COPILOTS = [
  // ============================================================
  // Healthcare
  // ============================================================
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
    status: 'ready-for-demo',
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
    status: 'ready-for-demo',
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
    status: 'working-in-progress',
    persona: 'Utilization Mgmt · Revenue Cycle · Payer Operations',
  },
  {
    id: 'healthcare-compliance',
    domain: 'healthcare',
    name: 'Healthcare Compliance Copilot',
    tagline: 'Continuous HIPAA / HITECH / state-rule attestation with evidence on demand.',
    capabilities: [
      'Continuous control attestation against HIPAA / HITECH baselines',
      'Privacy-impact triage for AI-influenced workflows',
      'Breach-notification readiness pack assembly',
      'Auditor-ready evidence retrieval with citation lineage',
    ],
    frameworks: ['HIPAA', 'HITECH', 'NIST AI RMF', 'State Privacy Acts'],
    status: 'working-in-progress',
    persona: 'CCO · Privacy Officer · Compliance Operations',
  },
  {
    id: 'care-coordination',
    domain: 'healthcare',
    name: 'Care Coordination Assistant',
    tagline: 'Bridge clinical, social-determinant, and operational signal so the right next step is obvious.',
    capabilities: [
      'Cross-source case-conference summary with cited evidence',
      'SDoH-aware care-plan suggestions with clinician-override gate',
      'Follow-up adherence tracking with privacy-preserving aggregations',
      'Care-team-ready briefing assembly with traceable lineage',
    ],
    frameworks: ['HIPAA', 'NIST AI RMF', 'ISO 42001', 'SDoH Guidelines'],
    status: 'on-roadmap',
    persona: 'CMIO · Care Management · Population Health',
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
    id: 'financial-controls',
    domain: 'finance',
    name: 'Financial Controls Copilot',
    tagline: 'SOX-aligned controls attestation with evidence retrieval and exception triage.',
    capabilities: [
      'Continuous SOX control monitoring with traceable evidence',
      'Segregation-of-duties anomaly detection',
      'Quarter-close pack assembly with cited workpapers',
      'Policy-aware exception routing for finance leadership',
    ],
    frameworks: ['SOX', 'COSO', 'GAAP / IFRS', 'NIST AI RMF'],
    status: 'working-in-progress',
    persona: 'CFO · Controller · Internal Audit',
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
  {
    id: 'audit-readiness',
    domain: 'finance',
    name: 'Audit Readiness Assistant',
    tagline: 'Always-on assembly of the audit-pack the regulators are about to ask for.',
    capabilities: [
      'Control-narrative drafting grounded in your evidence vault',
      'Workpaper retrieval with policy + version citation',
      'PBC-list assembly with completeness scoring',
      'Materiality-aware risk routing for the audit committee',
    ],
    frameworks: ['SOX', 'PCAOB', 'COSO', 'NIST AI RMF'],
    status: 'on-roadmap',
    persona: 'Controller · Internal Audit · CFO',
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
    id: 'curriculum-intelligence',
    domain: 'education',
    name: 'Curriculum Intelligence Assistant',
    tagline: 'Map programs to competencies, accreditation standards, and labor-market signal.',
    capabilities: [
      'Program-to-competency mapping with citation lineage',
      'Accreditation gap analysis against discipline standards',
      'Labor-market alignment scoring with traceable signal',
      'Faculty-in-the-loop review on every curriculum change',
    ],
    frameworks: ['FERPA', 'Accreditation Standards', 'NIST AI RMF'],
    status: 'on-roadmap',
    persona: 'Provost · Curriculum Council · Workforce Office',
  },
  {
    id: 'institutional-analytics',
    domain: 'education',
    name: 'Institutional Analytics Assistant',
    tagline: 'Enrollment, retention, and outcomes analytics with governance the board will accept.',
    capabilities: [
      'Enrollment and retention forecasting with cited drivers',
      'Cohort outcomes analytics with equity guardrails',
      'Board-ready memo synthesis from the same audit trail',
      'Privacy-preserving aggregations for federal reporting',
    ],
    frameworks: ['FERPA', 'IPEDS', 'NIST AI RMF', 'ISO 42001'],
    status: 'on-roadmap',
    persona: 'CIO · Provost · Institutional Research',
  },

  // ============================================================
  // IT Consulting
  // ============================================================
  {
    id: 'rfp-response',
    domain: 'it-consulting',
    name: 'RFP Response Copilot',
    tagline: 'Compose defensible RFP responses grounded in your past wins and current capabilities.',
    capabilities: [
      'Question-by-question response drafting with cited prior wins',
      'Capability-matrix grounding against the firm\'s service catalog',
      'Compliance-clause detection with red-flag routing',
      'Partner-in-the-loop sign-off on every consequential commitment',
    ],
    frameworks: ['SOC 2', 'ISO 27001', 'NIST AI RMF', 'Firm Policy'],
    status: 'on-roadmap',
    persona: 'Pursuit Lead · Practice Director · Bid Manager',
  },
  {
    id: 'knowledge-management',
    domain: 'it-consulting',
    name: 'Knowledge Management Copilot',
    tagline: 'Turn engagement deliverables into a defensible, retrievable institutional memory.',
    capabilities: [
      'Project artifact capture with provenance tagging',
      'Practice-area search grounded in your taxonomy',
      'Confidentiality enforcement at retrieval time',
      'Reuse analytics so partners see what\'s actually leveraged',
    ],
    frameworks: ['SOC 2', 'ISO 27001', 'NIST AI RMF', 'Firm Policy'],
    status: 'on-roadmap',
    persona: 'CIO · Knowledge Officer · Practice Director',
  },
  {
    id: 'project-delivery',
    domain: 'it-consulting',
    name: 'Project Delivery Assistant',
    tagline: 'Engagement governance copilot — status, risk, and escalation with cited evidence.',
    capabilities: [
      'Status-report drafting from time and milestone data',
      'Risk surface from project artifacts with cited rationale',
      'Escalation routing aligned to firm policy',
      'Partner sign-off trail for client commitments',
    ],
    frameworks: ['PMI', 'SOC 2', 'NIST AI RMF', 'Firm Policy'],
    status: 'on-roadmap',
    persona: 'Engagement Manager · Delivery Director · PMO',
  },
  {
    id: 'proposal-intelligence',
    domain: 'it-consulting',
    name: 'Proposal Intelligence Assistant',
    tagline: 'Win/loss intelligence and pricing recommendations grounded in your firm\'s history.',
    capabilities: [
      'Win/loss pattern analysis with cited engagements',
      'Pricing benchmarks grounded in past deal data',
      'Competitive positioning with confidence bands',
      'Partner-in-the-loop review on every recommended ask',
    ],
    frameworks: ['SOC 2', 'NIST AI RMF', 'Firm Policy'],
    status: 'on-roadmap',
    persona: 'Sales Operations · Pricing Council · Practice Director',
  },

  // ============================================================
  // Cybersecurity
  // ============================================================
  {
    id: 'ai-security-auditor',
    domain: 'cybersecurity',
    name: 'AI Security Auditor',
    tagline: 'Audit AI workloads against NIST AI RMF + your control catalog with cited evidence.',
    capabilities: [
      'Continuous AI control attestation against NIST AI RMF',
      'Vendor model risk triage with policy guardrails',
      'Evidence retrieval from your control catalog with citations',
      'Auditor-ready report assembly with traceable lineage',
    ],
    frameworks: ['NIST AI RMF', 'ISO 42001', 'SOC 2', 'ISO 27001'],
    status: 'on-roadmap',
    persona: 'CISO · Internal Audit · Security Operations',
  },
  {
    id: 'soc-analyst',
    domain: 'cybersecurity',
    name: 'SOC Analyst Copilot',
    tagline: 'Tier-1 triage assistant that respects rules of engagement and cites every conclusion.',
    capabilities: [
      'Alert enrichment with cited playbook references',
      'Triage recommendations bounded by rules-of-engagement policy',
      'Analyst-in-the-loop on every escalation',
      'Lineage for every disposition for downstream review',
    ],
    frameworks: ['NIST SP 800-61', 'MITRE ATT&CK', 'SOC 2', 'NIST AI RMF'],
    status: 'on-roadmap',
    persona: 'SOC Manager · Tier-1/2 Analyst · CISO',
  },
  {
    id: 'threat-intelligence',
    domain: 'cybersecurity',
    name: 'Threat Intelligence Copilot',
    tagline: 'Curate, score, and brief on threat actors and TTPs without hallucinating attribution.',
    capabilities: [
      'Source-grounded threat-actor profiles with citations',
      'TTP mapping against MITRE ATT&CK with confidence bands',
      'Sector-relevance scoring with cited reasoning',
      'Brief generation for executive consumption',
    ],
    frameworks: ['MITRE ATT&CK', 'NIST AI RMF', 'TLP', 'ISO 27001'],
    status: 'on-roadmap',
    persona: 'CTI Lead · CISO · Threat Hunter',
  },
  {
    id: 'incident-response',
    domain: 'cybersecurity',
    name: 'Incident Response Assistant',
    tagline: 'Runbook-grounded IR copilot with chain-of-custody on every artifact.',
    capabilities: [
      'Runbook-grounded action recommendations with citations',
      'Chain-of-custody capture on every artifact touched',
      'Communications draft templates with legal review gates',
      'Post-incident report assembly from the same audit trail',
    ],
    frameworks: ['NIST SP 800-61', 'MITRE ATT&CK', 'SOC 2', 'NIST AI RMF'],
    status: 'on-roadmap',
    persona: 'IR Lead · CISO · Legal & Comms',
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
