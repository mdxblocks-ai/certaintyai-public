// Static node + link data for the landing-page ontology graph.
// Sourced verbatim from CONTEXT.md §4. Each domain has a primary entity
// that connects to the central ontology node; entities within a domain
// connect in the sequence shown in CONTEXT.md.

const NODES_BY_DOMAIN = {
  core: [
    ['ontology', 'CertaintyAI Ontology'],
  ],
  healthcare: [
    ['patient', 'Patient'],
    ['encounter', 'Encounter'],
    ['condition', 'Condition'],
    ['observation', 'Observation'],
    ['medication', 'Medication'],
    ['provider', 'Provider'],
  ],
  education: [
    ['student', 'Student'],
    ['course', 'Course'],
    ['assessment', 'Assessment'],
    ['attendance', 'Attendance'],
    ['learning_gap', 'Learning Gap'],
    ['teacher', 'Teacher'],
  ],
  cybersecurity: [
    ['asset', 'Asset'],
    ['identity', 'Identity'],
    ['vulnerability', 'Vulnerability'],
    ['threat_actor', 'Threat Actor'],
    ['alert', 'Alert'],
    ['incident', 'Incident'],
    ['risk', 'Risk'],
  ],
  finops: [
    ['account', 'Account'],
    ['cost_center', 'Cost Center'],
    ['budget', 'Budget'],
    ['expense', 'Expense'],
    ['forecast', 'Forecast'],
    ['anomaly', 'Anomaly'],
  ],
  bfsi: [
    ['bfsi_customer',    'Customer'],
    ['bfsi_account',     'Account'],
    ['bfsi_transaction', 'Transaction'],
    ['bfsi_loan',        'Loan'],
    ['bfsi_credit_risk', 'Credit Risk'],
    ['bfsi_aml_alert',   'AML Alert'],
  ],
  itconsulting: [
    ['engagement', 'Engagement'],
    ['client', 'Client'],
    ['project', 'Project'],
    ['workstream', 'Workstream'],
    ['deliverable', 'Deliverable'],
    ['resource', 'Resource'],
  ],
}

// The first entity in each non-core domain is its "primary" — what links
// back to the central ontology node.
const DOMAIN_PRIMARIES = ['patient', 'student', 'asset', 'account', 'engagement', 'bfsi_customer']

export const nodes = Object.entries(NODES_BY_DOMAIN).flatMap(([domain, defs]) =>
  defs.map(([id, label]) => ({ id, label, domain }))
)

export const links = [
  // Primary-of-each-domain → core ontology
  ...DOMAIN_PRIMARIES.map((id) => ({ source: id, target: 'ontology' })),
  // Sequential links within each non-core domain
  ...Object.entries(NODES_BY_DOMAIN)
    .filter(([domain]) => domain !== 'core')
    .flatMap(([, defs]) =>
      defs.slice(0, -1).map(([id], i) => ({ source: id, target: defs[i + 1][0] }))
    ),
]
