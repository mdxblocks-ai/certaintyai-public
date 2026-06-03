import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OntologyGraph from './OntologyGraph'
import ReportPreview from './ReportPreview'
import { nodes as allNodes, links as allLinks } from '../lib/ontologyData'

// Phase 1.5.12 — Hero right column carries the full personalization moment.
// Left column keeps the strong product pitch and primary/secondary CTAs.
// When a CIO picks their industry, the right column's eyebrow, headline,
// supporting paragraph, applicable controls, and the graph itself all
// rewrite — turning a generic visual into a personal one.

const DOMAINS = [
  { key: 'healthcare',    label: 'Healthcare',         color: '#F472B6' },
  { key: 'bfsi',          label: 'Banking & Finance',  color: '#38BDF8' },
  { key: 'cybersecurity', label: 'Cybersecurity',      color: '#EF4444' },
  { key: 'education',     label: 'Education',          color: '#FBBF24' },
  { key: 'finops',        label: 'FinOps',             color: '#34D399' },
  { key: 'itconsulting',  label: 'IT Consulting',      color: '#A78BFA' },
  { key: 'all',           label: 'All domains',        color: '#cbd5e1' },
]

const NARRATIVES = {
  healthcare: {
    eyebrow:  'Healthcare ontology',
    headline: 'Your patient world, unified.',
    sub:
      'Patient → Encounter → Condition → Observation → Medication → Provider. ' +
      'Every AI answer about care quality, readmission risk, or population ' +
      'health traces back through these connected entities — and onward to ' +
      'EHR, claims, and consent records.',
    controls: 'HIPAA · HITECH · FDA AI/ML · ISO 27799',
  },
  bfsi: {
    eyebrow:  'Banking & Finance ontology',
    headline: 'Your customer-to-risk chain, unified.',
    sub:
      'Customer → Account → Transaction → Loan → Credit Risk → AML Alert. ' +
      'Underwriting, AML monitoring, and regulator-facing reporting reason ' +
      'over the same graph — every node mapped to a control.',
    controls: 'PCI DSS · SOX · GLBA · Basel III',
  },
  cybersecurity: {
    eyebrow:  'Cybersecurity ontology',
    headline: 'Your risk surface, unified.',
    sub:
      'Asset → Identity → Vulnerability → Threat Actor → Alert → Incident → Risk. ' +
      'Detection, triage and exposure scoring all reason over the same graph ' +
      'your GRC team reports against.',
    controls: 'NIST 800-53 · ISO 27001 · NIST CSF',
  },
  education: {
    eyebrow:  'Education ontology',
    headline: 'Your student-success world, unified.',
    sub:
      'Student → Course → Assessment → Attendance → Learning Gap → Teacher. ' +
      'Early-warning models, intervention recommendations, and outcome ' +
      'reporting all share the same vocabulary.',
    controls: 'FERPA · COPPA · ISO 27001',
  },
  finops: {
    eyebrow:  'FinOps ontology',
    headline: 'Your cost surface, unified.',
    sub:
      'Account → Cost Center → Budget → Expense → Forecast → Anomaly. ' +
      'Cloud spend, vendor commitments, and forecast variance reason over ' +
      'one chart of accounts.',
    controls: 'SOX · audit-trail · FinOps Foundation',
  },
  itconsulting: {
    eyebrow:  'IT Consulting ontology',
    headline: 'Your engagement world, unified.',
    sub:
      'Engagement → Client → Project → Workstream → Deliverable → Resource. ' +
      'Capacity planning, margin analysis, and delivery-risk insights all ' +
      'share the same model — across every client, region and practice.',
    controls: 'ISO 9001 · ISO 27001 · SOC 2',
  },
  all: {
    eyebrow:  'The ontology layer',
    headline: 'One semantic backbone, every regulated domain.',
    sub:
      'All six clusters connected through the central CertaintyAI ontology — ' +
      'the shared layer your AI agents reason over, no matter which industry ' +
      'questions land first.',
    controls: 'Cross-domain reasoning',
  },
}

export default function Hero() {
  const { user } = useAuth()
  const [selected, setSelected] = useState('healthcare')

  const graphData = useMemo(() => {
    if (selected === 'all') {
      return { nodes: allNodes, links: allLinks }
    }
    const keep = new Set(
      allNodes.filter((n) => n.domain === 'core' || n.domain === selected).map((n) => n.id),
    )
    return {
      nodes: allNodes.filter((n) => keep.has(n.id)),
      links: allLinks.filter((l) => keep.has(l.source) && keep.has(l.target)),
    }
  }, [selected])

  const narrative = NARRATIVES[selected]
  const entityCount = graphData.nodes.length
  const relationCount = graphData.links.length

  return (
    <section className="relative isolate py-12 lg:py-16">
      <div
        aria-hidden
        className="absolute right-0 top-12 -z-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* LEFT: product pitch + dual CTAs (fixed) */}
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            CertaintyAI
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-slate-100">
            Ontology-driven AI for{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              regulated industries
            </span>
            .
          </h1>

          <p className="mt-5 text-base text-slate-400 max-w-xl">
            Two minutes of questions. An instant, governed, explainable
            <span className="text-slate-200"> AI Readiness Report</span> —
            the kind of deliverable you can hand to your CEO, your
            auditor, and your board.
          </p>

          <div className="mt-8">
            <Link
              to="/survey"
              className="inline-block px-5 py-3 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20"
            >
              Take the 2-minute readiness assessment
            </Link>
          </div>

          {!user && (
            <p className="mt-3 text-[11px] text-slate-500">
              No signup required to take the assessment.
            </p>
          )}

          <p className="mt-5 text-xs text-slate-500">
            Instant report · Aligned to Gartner, NIST AI RMF, EU AI Act, ISO 42001
          </p>

          {/* Inline preview of the deliverable — fills the empty space below
              the CTA so visitors see exactly what they'll walk away with */}
          <div className="mt-10">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-3">
              What you'll get
            </div>
            <ReportPreview />
          </div>
        </div>

        {/* RIGHT: industry picker + personalized narrative + filtered graph */}
        <div className="lg:col-span-7">
          {/* Picker chips first — primary call to interact */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Choose your industry
            </div>
            <div className="text-[11px] text-slate-500">
              {entityCount} entities · {relationCount} relationships
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {DOMAINS.map((d) => {
              const active = d.key === selected
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelected(d.key)}
                  aria-pressed={active}
                  className={[
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition',
                    active
                      ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.label}
                </button>
              )
            })}
          </div>

          {/* Personalized narrative — eyebrow + headline + sub all rewrite */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400">
              {narrative.eyebrow}
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              {narrative.headline}
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {narrative.sub}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px]">
              <span className="text-slate-500 uppercase tracking-[0.15em]">Controls applied:</span>
              <span className="text-slate-200">{narrative.controls}</span>
            </div>

            {/* The filtered, personal graph lives inside the same card so the
                narrative and the visual read as one tile, not two */}
            <div className="mt-4">
              <OntologyGraph key={selected} graphData={graphData} />
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Drag a node, scroll to zoom. Static visualization — the live
              ontology service is Phase 2.
            </p>
          </div>
        </div>
      </div>

    </section>
  )
}
