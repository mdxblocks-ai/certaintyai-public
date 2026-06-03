import { useMemo, useState } from 'react'
import OntologyGraph from './OntologyGraph'
import { nodes as allNodes, links as allLinks } from '../lib/ontologyData'

// Phase 1.5.9 — Interactive industry picker drives the ontology graph.
// Visitors pick their industry and the graph filters to that cluster +
// the central CertaintyAI Ontology hub. The headline and supporting copy
// also swap to industry-specific language so the moment becomes "this is
// MY world, modeled" — not "look at this generic data structure".

const DOMAINS = [
  { key: 'all',           label: 'All domains',   color: '#cbd5e1' },
  { key: 'healthcare',    label: 'Healthcare',    color: '#F472B6' },
  { key: 'education',     label: 'Education',     color: '#FBBF24' },
  { key: 'cybersecurity', label: 'Cybersecurity', color: '#EF4444' },
  { key: 'finops',        label: 'FinOps',        color: '#34D399' },
  { key: 'itconsulting',  label: 'IT Consulting', color: '#A78BFA' },
  { key: 'bfsi',          label: 'Banking & Finance', color: '#38BDF8' },
]

const NARRATIVES = {
  all: {
    eyebrow:  'The ontology layer',
    headline: 'One semantic backbone, every regulated domain.',
    sub:
      'CertaintyAI unifies entities from healthcare, education, cybersecurity, ' +
      'FinOps, and IT consulting into a single ontology — the shared layer ' +
      'your AI agents reason over. Pick your industry to see your world.',
  },
  healthcare: {
    eyebrow:  'Healthcare ontology',
    headline: 'Your patient world, unified.',
    sub:
      'Patient → Encounter → Condition → Observation → Medication → Provider. ' +
      'Every AI answer about care quality, readmission risk, or population ' +
      'health traces back through these connected entities — and onward to ' +
      'EHR, claims, and consent records — with HIPAA controls on the path.',
  },
  education: {
    eyebrow:  'Education ontology',
    headline: 'Your student-success world, unified.',
    sub:
      'Student → Course → Assessment → Attendance → Learning Gap → Teacher. ' +
      'Early-warning models, intervention recommendations, and outcome ' +
      'reporting all share the same vocabulary — with FERPA controls baked in.',
  },
  cybersecurity: {
    eyebrow:  'Cybersecurity ontology',
    headline: 'Your risk surface, unified.',
    sub:
      'Asset → Identity → Vulnerability → Threat Actor → Alert → Incident → Risk. ' +
      'Detection, triage and exposure scoring reason over the same graph your ' +
      'GRC team reports against — with NIST 800-53 and ISO 27001 controls mapped.',
  },
  finops: {
    eyebrow:  'FinOps ontology',
    headline: 'Your cost surface, unified.',
    sub:
      'Account → Cost Center → Budget → Expense → Forecast → Anomaly. ' +
      'Cloud spend, vendor commitments, and forecast variance reason over ' +
      'one chart of accounts — with SOX and audit-trail controls preserved.',
  },
  itconsulting: {
    eyebrow:  'IT Consulting ontology',
    headline: 'Your engagement world, unified.',
    sub:
      'Engagement → Client → Project → Workstream → Deliverable → Resource. ' +
      'Capacity planning, margin analysis, and delivery-risk insights all ' +
      'share the same model — across every client, region and practice.',
  },
  bfsi: {
    eyebrow:  'Banking & Finance ontology',
    headline: 'Your customer-to-risk chain, unified.',
    sub:
      'Customer → Account → Transaction → Loan → Credit Risk → AML Alert. ' +
      'Underwriting, AML monitoring, and regulator-facing reporting reason over ' +
      'the same graph — with PCI DSS, SOX, GLBA and Basel III controls mapped to ' +
      'every node, every link, every answer.',
  },
}

function FilterChip({ d, selected, onSelect }) {
  const active = d.key === selected
  return (
    <button
      onClick={() => onSelect(d.key)}
      className={[
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition',
        active
          ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]'
          : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100',
      ].join(' ')}
      aria-pressed={active}
    >
      <span
        aria-hidden
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: d.color }}
      />
      {d.label}
    </button>
  )
}

export default function OntologySection() {
  const [selected, setSelected] = useState('all')

  // Filter the full ontology down to core + selected domain.
  // Recomputed when `selected` changes; the child OntologyGraph is keyed
  // on `selected` so it remounts with a fresh force-simulation.
  const graphData = useMemo(() => {
    if (selected === 'all') {
      return {
        nodes: allNodes,
        links: allLinks,
      }
    }
    const keep = new Set(
      allNodes
        .filter((n) => n.domain === 'core' || n.domain === selected)
        .map((n) => n.id),
    )
    return {
      nodes: allNodes.filter((n) => keep.has(n.id)),
      links: allLinks.filter((l) => keep.has(l.source) && keep.has(l.target)),
    }
  }, [selected])

  const narrative = NARRATIVES[selected]
  const visibleEntities = graphData.nodes.length
  const visibleLinks = graphData.links.length

  return (
    <section id="ontology" className="py-16 border-t border-slate-800 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: industry picker + contextual narrative */}
        <div className="lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            {narrative.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-100 tracking-tight">
            {narrative.headline}
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">{narrative.sub}</p>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-2">
              Choose your industry
            </div>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <FilterChip key={d.key} d={d} selected={selected} onSelect={setSelected} />
              ))}
            </div>
          </div>

          {/* Live stats so the picker feels grounded in real data */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Entities visible</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">{visibleEntities}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Relationships</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">{visibleLinks}</div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-slate-500">
            Drag a node, scroll to zoom. Static visualization — the live ontology service is Phase 2.
          </p>
        </div>

        {/* RIGHT: interactive force-graph, remounted on filter change */}
        <div className="lg:col-span-8">
          <OntologyGraph key={selected} graphData={graphData} />
        </div>
      </div>
    </section>
  )
}
