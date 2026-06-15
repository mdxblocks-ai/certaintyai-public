// Domain Ontology Detail page data — single source of truth for /ontology/:slug.
//
// "Ontology Explorer" and "Foundry" are intentionally different user journeys:
//   - Ontology pages (this file)  → "what does the data model look like for this
//                                    domain, and what governance frameworks apply?"
//   - Foundry page                → "how do I deploy this ontology and stand up
//                                    domain copilots?"
//
// Each entry powers one detail page + the homepage Industry card it links from.
// `ontologyKey` matches the keys in lib/ontologyData.js so the graph layer can
// later filter to a single domain. `status: 'coming-soon'` renders an early-
// access state instead of the live entity chain.

export const DOMAIN_ONTOLOGIES = [
  {
    slug: 'healthcare',
    name: 'Healthcare & Life Sciences',
    accent: '#0D9488',
    glow: 'rgba(13, 148, 136, 0.22)',
    eyebrow: 'Healthcare ontology',
    headline: 'Your patient world, unified.',
    blurb:
      'Every AI answer about care quality, readmission risk, or population health traces back through a connected chain of patient entities — and onward to EHR, claims, and consent records — with HIPAA controls enforced on the path.',
    primaryEntity: 'Patient',
    entityChain: ['Patient', 'Encounter', 'Condition', 'Observation', 'Medication', 'Provider'],
    upstreamSystems: ['EHR', 'Claims', 'Lab', 'Pharmacy', 'Consent registry'],
    frameworks: ['HIPAA', 'HITECH', 'FDA AI/ML', 'NIST AI RMF', 'ISO 42001'],
    copilots: ['AI-CDSS Copilot™', 'AI-PFIS Copilot™', 'Prior Authorization Compliance Copilot™', 'Healthcare GRC Copilot™'],
    marketplaceAnchor: 'healthcare',
    status: 'available',
    ontologyKey: 'healthcare',
  },
  {
    slug: 'banking-finance',
    name: 'Banking & Financial Services',
    accent: '#1E40AF',
    glow: 'rgba(30, 64, 175, 0.22)',
    eyebrow: 'Banking & Finance ontology',
    headline: 'Your customer-to-risk chain, unified.',
    blurb:
      'Underwriting, AML monitoring, and regulator-facing reporting reason over a single graph that links customer, account, transaction, and risk — with PCI DSS, SOX, GLBA and Basel III controls mapped to every node, every link, every answer.',
    primaryEntity: 'Customer',
    entityChain: ['Customer', 'Account', 'Transaction', 'Loan', 'Credit Risk', 'AML Alert'],
    upstreamSystems: ['Core banking', 'Payment rails', 'KYC / sanctions feeds', 'Credit bureau', 'Risk warehouse'],
    frameworks: ['PCI DSS', 'SOX', 'GLBA', 'Basel III', 'NIST AI RMF', 'ISO 42001'],
    copilots: ['AI Tax Planner Copilot', 'Quanto FinOps Copilot'],
    marketplaceAnchor: 'finance',
    status: 'available',
    ontologyKey: 'bfsi',
  },
  {
    slug: 'government-public-sector',
    name: 'Government & Public Sector',
    accent: '#7C5723',
    glow: 'rgba(124, 87, 35, 0.22)',
    eyebrow: 'Government ontology',
    headline: 'Your citizen-services surface, modeled.',
    blurb:
      'Citizen, application, eligibility, benefit, case worker, audit trail — a single connected graph behind every public-sector AI decision, so a regulator, a citizen, and an oversight committee see the same evidence path.',
    primaryEntity: 'Citizen',
    entityChain: ['Citizen', 'Application', 'Eligibility', 'Benefit', 'Case Worker', 'Audit Trail'],
    upstreamSystems: ['Case management', 'Identity registry', 'Eligibility rules engine', 'Records archive'],
    frameworks: ['FedRAMP', 'FISMA', 'NIST 800-53', 'CMMC', 'NIST AI RMF'],
    copilots: [],
    marketplaceAnchor: null,
    status: 'coming-soon',
    ontologyKey: null,
  },
  {
    slug: 'education',
    name: 'Education & Workforce',
    accent: '#D8B061',
    glow: 'rgba(216, 176, 97, 0.26)',
    eyebrow: 'Education ontology',
    headline: 'Your student-success world, unified.',
    blurb:
      'Early-warning models, intervention recommendations, and outcome reporting all share the same vocabulary — student, course, assessment, attendance, learning gap, teacher — with FERPA and COPPA controls baked into every traversal.',
    primaryEntity: 'Student',
    entityChain: ['Student', 'Course', 'Assessment', 'Attendance', 'Learning Gap', 'Teacher'],
    upstreamSystems: ['SIS', 'LMS', 'Assessment platform', 'Workforce-development registry'],
    frameworks: ['FERPA', 'COPPA', 'NIST AI RMF', 'ISO 42001'],
    copilots: ['GradeUP Copilot', 'SkillUP Copilot', 'RankUP Copilot'],
    marketplaceAnchor: 'education',
    status: 'available',
    ontologyKey: 'education',
  },
  {
    slug: 'cybersecurity',
    name: 'Cybersecurity',
    accent: '#DC2626',
    glow: 'rgba(220, 38, 38, 0.22)',
    eyebrow: 'Cybersecurity ontology',
    headline: 'Your risk surface, unified.',
    blurb:
      'Detection, triage and exposure scoring reason over the same graph your GRC team reports against — asset, identity, vulnerability, threat actor, alert, incident, risk — with NIST 800-53 and ISO 27001 controls mapped at every node.',
    primaryEntity: 'Asset',
    entityChain: ['Asset', 'Identity', 'Vulnerability', 'Threat Actor', 'Alert', 'Incident', 'Risk'],
    upstreamSystems: ['SIEM', 'EDR', 'IAM', 'Vulnerability scanner', 'Threat-intel feed'],
    frameworks: ['NIST 800-53', 'ISO 27001', 'MITRE ATT&CK', 'SOC 2', 'NIST AI RMF'],
    copilots: ['CyberIntel Copilot'],
    marketplaceAnchor: 'cybersecurity',
    status: 'available',
    ontologyKey: 'cybersecurity',
  },
  {
    slug: 'it-consulting',
    name: 'IT Consulting',
    accent: '#4F46E5',
    glow: 'rgba(79, 70, 229, 0.22)',
    eyebrow: 'IT Consulting ontology',
    headline: 'Your engagement world, unified.',
    blurb:
      'Capacity planning, margin analysis, and delivery-risk insights all share the same model — engagement, client, project, workstream, deliverable, resource — across every client, region and practice line.',
    primaryEntity: 'Engagement',
    entityChain: ['Engagement', 'Client', 'Project', 'Workstream', 'Deliverable', 'Resource'],
    upstreamSystems: ['PSA / time-tracking', 'CRM', 'Resource-management system', 'Finance ledger'],
    frameworks: ['SOC 2', 'ISO 27001', 'NIST AI RMF', 'ISO 42001'],
    copilots: [],
    marketplaceAnchor: null,
    status: 'available',
    ontologyKey: 'itconsulting',
  },
]

export function findDomainOntology(slug) {
  return DOMAIN_ONTOLOGIES.find((d) => d.slug === slug) || null
}
