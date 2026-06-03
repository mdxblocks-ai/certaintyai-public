// Phase 1.5.2 — Replaced the Palantir / Fluree comparison table with a
// competitor-free "What sets CertaintyAI apart" panel. Per project policy,
// the report and landing page reference no competing products or companies.
const PARTNERS = [
  'Microsoft Azure',
  'IBM',
  'NVIDIA',
  'Anthropic',
  'ServiceNow',
  'Salesforce',
  'Snowflake',
  'Databricks',
]

const WHY_CARDS = [
  {
    title: 'Ontology as a layer',
    blurb:
      'A real architectural layer between your data and your AI — open, domain-tuned, and explainable end-to-end.',
  },
  {
    title: 'Explainable agentic AI',
    blurb:
      'Multi-agent reasoning with GraphRAG and a human-in-the-loop. Every recommendation cites the evidence behind it.',
  },
  {
    title: 'Governance-first for regulated industries',
    blurb:
      'HIPAA, GDPR, SOC 2, FERPA — controls baked in. Built for healthcare, education, cybersecurity, finance, and IT.',
  },
]

const DIFFERENTIATORS = [
  {
    icon: '🎯',
    title: 'Built for mid-market regulated industries',
    blurb:
      'Healthcare, BFSI, education, government, cybersecurity, IT consulting — the sectors where compliance is non-negotiable and AI is expected to defend its answers.',
  },
  {
    icon: '🔍',
    title: 'Open, domain-tuned ontology',
    blurb:
      'A business vocabulary you can read, edit, and extend — not a proprietary black box. Tuned per industry, shared across every AI use-case.',
  },
  {
    icon: '🧾',
    title: 'Evidence on every answer',
    blurb:
      'Query → ontology nodes → source systems → compliance controls. Auditors get the same lineage your operators see. No more "the model said so".',
  },
  {
    icon: '☁️',
    title: 'Hybrid / multi-cloud / on-prem',
    blurb:
      'Deploy where your data lives. No forced re-platforming, no vendor lock-in, no waiting on a year-long migration project.',
  },
]

function PartnersRow() {
  return (
    <section className="py-12 border-t border-slate-800">
      <h2 className="text-xl font-semibold text-slate-100">Built by MDxBlocks Inc</h2>
      <p className="mt-3 max-w-3xl text-sm text-slate-400">
        MDxBlocks is an independent software vendor partnering with the
        cloud and silicon leaders, and with the AI and enterprise SaaS
        platforms our customers already use to run their business.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {PARTNERS.map((name) => (
          <span
            key={name}
            className="px-3 py-1 text-xs rounded-full border border-slate-700 text-slate-300 bg-slate-900/40"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}

function WhyGrid() {
  return (
    <section className="py-12 border-t border-slate-800">
      <h2 className="text-xl font-semibold text-slate-100">Why CertaintyAI</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {WHY_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700 transition"
          >
            <h3 className="text-base font-semibold text-slate-100">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{card.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function DifferentiatorsPanel() {
  return (
    <section className="py-12 border-t border-slate-800">
      <h2 className="text-xl font-semibold text-slate-100">What sets CertaintyAI apart</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-3xl">
        Four things every CertaintyAI deployment ships with by default —
        and that mid-market regulated organisations consistently struggle to
        build on their own.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DIFFERENTIATORS.map((d) => (
          <div
            key={d.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{d.icon}</span>
              <h3 className="text-base font-semibold text-slate-100">{d.title}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{d.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function AboutSection() {
  return (
    <div>
      <PartnersRow />
      <WhyGrid />
      <DifferentiatorsPanel />
    </div>
  )
}
