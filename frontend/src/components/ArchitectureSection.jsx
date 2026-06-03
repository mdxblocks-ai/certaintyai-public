// Phase 1.5.4 — Architecture section on the landing page.
//
// Distilled from two research inputs:
//   1. The market-standard five-component semantic-layer pattern
//      (metadata → taxonomy → glossary → ontology → knowledge graph)
//      and the GraphRAG accuracy gain from ~80% to 90–99% on enterprise
//      data tasks documented in industry literature.
//   2. The market-standard "open architecture" pattern of unifying
//      heterogeneous data sources (ERP, CRM, industrial DBs, documents,
//      sensors) into a semantic object layer that AI agents can reason
//      over.
//
// Per project policy, no competitor or vendor name appears in this
// section. The patterns are positioned as CertaintyAI's own architecture.

const STACK_LAYERS = [
  {
    n: '5',
    title: 'Governed AI applications',
    blurb:
      'Agentic copilots, decision-support flows, evidence-packed reports — every answer carries citations back to the ontology and source systems.',
    accent: 'cyan',
  },
  {
    n: '4',
    title: 'Agentic reasoning layer',
    blurb:
      'Multi-agent orchestration with GraphRAG retrieval, deterministic scoring, and human-in-the-loop checkpoints. Explainable end to end.',
    accent: 'violet',
  },
  {
    n: '3',
    title: 'Ontology + knowledge graph',
    blurb:
      'Entities, attributes and relationships modeled per industry. The architectural layer between your raw data and your AI — open, domain-tuned, editable.',
    accent: 'cyan',
  },
  {
    n: '2',
    title: 'Semantic foundation',
    blurb:
      'Business glossary, taxonomies, controlled vocabularies and policies — the shared meaning every downstream agent agrees on.',
    accent: 'sky',
  },
  {
    n: '1',
    title: 'Open data plane',
    blurb:
      'Federated connections to warehouses, lakes, ERPs, CRMs, EHRs, document stores and sensor streams — structured and unstructured, on-prem or cloud.',
    accent: 'slate',
  },
]

const CAPABILITY_CARDS = [
  {
    title: 'Open, domain-tuned ontology',
    blurb:
      'A business vocabulary you can read, edit, version and extend — modeled with W3C-aligned semantics (RDF / JSON-LD / SKOS), tuned per industry, shared across every AI use-case. Not a proprietary black box.',
  },
  {
    title: 'Knowledge graph + GraphRAG',
    blurb:
      'Multi-hop relationship reasoning over an enterprise knowledge graph — closing the gap between the ~80% accuracy ceiling of flat retrieval and the 90–99% accuracy enterprise workloads require.',
  },
  {
    title: 'Multi-agent reasoning with HITL',
    blurb:
      'Specialised agents (scoring, insights, narrative, evidence) coordinated by an orchestrator, with human-in-the-loop checkpoints where the answer affects a regulated decision.',
  },
  {
    title: 'Open integrations',
    blurb:
      'Federated connections to the data systems you already run — relational, lake, document, sensor, SaaS. Built on MCP and standard connectors so nothing is forklifted.',
  },
  {
    title: 'Hybrid, multi-cloud, on-prem',
    blurb:
      'Deploy where your data lives — including air-gapped and sovereign environments. The semantic layer can federate across boundaries rather than forcing data to move.',
  },
  {
    title: 'Embedded governance & lineage',
    blurb:
      'Policies enforced at the data layer, not bolted on at the app. Every query carries provenance — who, what, when, which control — so auditors see the same lineage operators do.',
  },
]

const ACCENT_CLASSES = {
  cyan: 'border-cyan-500/40 bg-cyan-500/5',
  violet: 'border-violet-500/40 bg-violet-500/5',
  sky: 'border-sky-500/40 bg-sky-500/5',
  slate: 'border-slate-700 bg-slate-900/40',
}

const ACCENT_TEXT = {
  cyan: 'text-cyan-300',
  violet: 'text-violet-300',
  sky: 'text-sky-300',
  slate: 'text-slate-300',
}

function ArchitectureDiagram() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
        Architecture at a glance
      </div>
      <div className="space-y-2.5">
        {STACK_LAYERS.map((layer) => (
          <div
            key={layer.n}
            className={`flex items-start gap-4 rounded-xl border p-4 ${ACCENT_CLASSES[layer.accent]} transition hover:bg-opacity-80`}
          >
            <div className={`shrink-0 w-9 h-9 rounded-lg border border-slate-700 bg-slate-950/60 flex items-center justify-center text-sm font-semibold ${ACCENT_TEXT[layer.accent]}`}>
              {layer.n}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100">{layer.title}</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">{layer.blurb}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>Bottom-up: raw data → meaning → reasoning → action</span>
        <span className="text-cyan-400">Open · Explainable · Governed</span>
      </div>
    </div>
  )
}

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-16 border-t border-slate-800 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: narrative + capability cards */}
        <div className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Architecture</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            Ontology as a real architectural layer — not a metadata afterthought.
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-2xl">
            CertaintyAI treats <span className="text-slate-200">semantics</span> as
            first-class infrastructure. Raw data lands in an open data plane,
            gets meaning through a governed ontology and knowledge graph,
            and is reasoned over by a multi-agent layer that always cites
            its evidence. The result: AI answers your auditors, your
            operators, and your CEO can all trust.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CAPABILITY_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-cyan-500/40 hover:bg-slate-900/70 transition"
              >
                <h3 className="text-sm font-semibold text-slate-100">{card.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">{card.blurb}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900/40">W3C RDF / JSON-LD / SKOS</span>
            <span className="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900/40">GraphRAG</span>
            <span className="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900/40">MCP-ready</span>
            <span className="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900/40">Human-in-the-loop</span>
            <span className="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900/40">Provenance + lineage</span>
          </div>
        </div>

        {/* Right: 5-layer diagram */}
        <div className="lg:col-span-5">
          <ArchitectureDiagram />
        </div>
      </div>
    </section>
  )
}
