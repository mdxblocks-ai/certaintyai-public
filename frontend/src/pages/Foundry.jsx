import React from 'react'
import { useNavigate } from 'react-router-dom'
import LogoMark from '../components/LogoMark'
import Footer from '../components/Footer'

const ONTOLOGIES = [
  {
    t: "Healthcare & Life Sciences",
    d: "Patient, encounter, condition, observation, medication, provider — clinical-grade semantics.",
    chips: ["SNOMED", "LOINC", "ICD-10", "RxNorm", "FHIR"],
    i: "M12 5v14M5 12h14"
  },
  {
    t: "Banking & Finance",
    d: "Account, transaction, exposure, counterparty, KYC — resolved into one trusted customer entity.",
    chips: ["Basel III", "SOX", "KYC/AML"],
    i: "M3 21h18M6 21V9M12 21V5M18 21v-8"
  },
  {
    t: "Cybersecurity",
    d: "Asset, identity, vulnerability, threat actor, alert — trace an attack path across silos in real time.",
    chips: ["NIST CSF", "ISO 27001", "MITRE"],
    i: "M12 3l8 4v6c0 5-4 7-8 8-4-1-8-3-8-8V7z"
  },
  {
    t: "Education",
    d: "Student, competency, learning gap, intervention, outcome — reason about why students struggle.",
    chips: ["FERPA", "xAPI", "Competency"],
    i: "M3 7l9-4 9 4-9 4zM21 7v6M7 10v5c0 1 5 3 5 3s5-2 5-3v-5"
  },
  {
    t: "FinOps",
    d: "Cost center, service, anomaly, forecast, budget — enabling true cross-cloud cost attribution.",
    chips: ["ISO 38500", "Cost model"],
    i: "M3 17l5-5 4 4 8-8"
  },
  {
    t: "IT Consulting",
    d: "Client, project, resource, deliverable, risk — utilization and delivery margin in one model.",
    chips: ["ISO 9001", "SOC 2"],
    i: "M4 7h16M4 12h16M4 17h10"
  }
]

const ADAPTERS = [
  { n: "Microsoft Purview", cat: "Azure-native catalog", lg: "P" },
  { n: "OpenMetadata", cat: "Open-source · cloud-agnostic", lg: "O" },
  { n: "Collibra", cat: "Enterprise data governance", lg: "C" },
  { n: "Alation", cat: "Enterprise data catalog", lg: "A" },
  { n: "IBM Knowledge Catalog", cat: "+ watsonx.governance", lg: "I" },
  { n: "Google Dataplex", cat: "GCP-native governance", lg: "G" }
]

const CONNECTORS = [
  { t: "Standards & Vocabularies", d: "SNOMED, LOINC, ICD-10, RxNorm, NIST, ISO — pre-mapped.", i: "M12 3l8 4v6c0 5-4 7-8 8-4-1-8-3-8-8V7z" },
  { t: "Canonical Models", d: "FHIR, xAPI and industry schemas, ready to map.", i: "M4 4h7v7H4zM13 13h7v7h-7z" },
  { t: "300+ Connectors", d: "EHR, CRM, ERP, lakes, logs — connect once, no rip-and-replace.", i: "M6 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0M12 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0M9 8l6 8" },
  { t: "Agent & Skill Templates", d: "Pre-built agents for clinical, cyber, FinOps and more.", i: "M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M5 21v-2a7 7 0 0 1 14 0v2" },
  { t: "Evidence Pack Builder", d: "Full provenance and rationale for every output.", i: "M9 12l2 2 4-4" },
  { t: "Confidence Scoring", d: "Know how sure the AI is — before you act.", i: "M3 17l5-5 4 4 8-8M16 8h4v4" },
  { t: "Guardrails & HITL", d: "Policy checks, review, approval and escalation, built in.", i: "M12 3l8 4v6c0 5-4 7-8 8-4-1-8-3-8-8V7z" },
  { t: "Versioning & Governance", d: "Change control, oversight and audit on every model.", i: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" }
]

export default function Foundry() {
  const navigate = useNavigate()

  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">About Our Foundry</span>
          <h1 className="font-serif-brand text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-4 max-w-4xl mx-auto">
            Where domain expertise becomes <em>deployable</em> intelligence.
          </h1>
          <p className="text-base text-[#3B3D42] leading-relaxed max-w-3xl mx-auto">
            The Foundry is what's inside the box — pre-built, regulated-industry building blocks you assemble instead of build. It turns what used to be a 12-month consulting project into a four-week configuration.
          </p>
        </div>

        {/* Value Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#1E3A36] text-[#D8B679] flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h4 className="font-serif-brand text-xl font-semibold mb-2">Weeks, not years</h4>
            <p className="text-sm text-[#3B3D42] leading-relaxed">Pre-built domain models replace the multi-year data-harmonization project most assessments recommend.</p>
          </div>
          <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#1E3A36] text-[#D8B679] flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 4v6c0 5-4 7-8 8-4-1-8-3-8-8V7z" />
              </svg>
            </div>
            <h4 className="font-serif-brand text-xl font-semibold mb-2">Compliance, pre-loaded</h4>
            <p className="text-sm text-[#3B3D42] leading-relaxed">SNOMED, LOINC, ICD-10, NIST, and ISO standards come mapped in — the schemas your auditors expect.</p>
          </div>
          <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#1E3A36] text-[#D8B679] flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0M12 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0M9 8l6 8" />
              </svg>
            </div>
            <h4 className="font-serif-brand text-xl font-semibold mb-2">Plug into what you run</h4>
            <p className="text-sm text-[#3B3D42] leading-relaxed">Governance adapters connect directly to your existing data catalogs — no rip-and-replace required.</p>
          </div>
        </div>

        {/* Domain Ontologies */}
        <div className="mb-20">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Pre-built Domain Ontologies</span>
            <h2 className="font-serif-brand text-3xl font-normal tracking-tight mb-2">The trusted model of your business — <em>already built.</em></h2>
            <p className="text-sm text-[#3B3D42]">Each ontology is a ready-made map of how your world connects: the entities, relationships, and rules your AI reasons over.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ONTOLOGIES.map((o) => (
              <div key={o.t} className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm hover:border-[#A87C3C] transition duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#1E3A36] text-[#D8B679] flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={o.i} />
                  </svg>
                </div>
                <h4 className="font-serif-brand text-lg font-semibold mb-2">{o.t}</h4>
                <p className="text-xs text-[#3B3D42] leading-relaxed mb-4">{o.d}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {o.chips.map((c) => (
                    <span key={c} className="text-[10px] font-semibold text-[#7C5723] bg-[#ECE5D6] border border-[#14161A]/5 px-2.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Adapters */}
        <div className="mb-20">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Governance Adapters</span>
            <h2 className="font-serif-brand text-3xl font-normal tracking-tight mb-2">Your governance catalog, <em>connected.</em></h2>
            <p className="text-sm text-[#3B3D42]">CertaintyAI's Governance Layer plugs into the tools you already operate — so you extend your governance investment instead of replacing it.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ADAPTERS.map((a) => (
              <div key={a.n} className="flex items-center gap-4 bg-[#FBF8F0] border border-[#14161A]/10 rounded-xl p-5 hover:border-[#A87C3C] hover:bg-[#F4F0E6] transition duration-150">
                <div className="w-11 h-11 rounded-lg border border-[#14161A]/14 flex items-center justify-center font-serif-brand font-bold text-lg bg-[#ECE5D6] shrink-0">
                  {a.lg}
                </div>
                <div>
                  <div className="font-semibold text-sm">{a.n}</div>
                  <div className="text-xs text-[#73706A] mt-0.5">{a.cat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="mb-20">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Components &amp; Connectors</span>
            <h2 className="font-serif-brand text-3xl font-normal tracking-tight mb-2">Everything else you <em>snap in.</em></h2>
            <p className="text-sm text-[#3B3D42]">The semantic primitives, confidence scoring models, and human-in-the-loop triggers that make the platform production-ready on day one.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {CONNECTORS.map((c) => (
              <div key={c.t} className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-xl p-5 hover:bg-[#F4F0E6] transition duration-150">
                <div className="w-9 h-9 border border-[#14161A]/14 rounded-lg flex items-center justify-center text-[#7C5723] mb-4 bg-[#ECE5D6]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={c.i} />
                  </svg>
                </div>
                <h4 className="font-serif-brand text-base font-semibold mb-1">{c.t}</h4>
                <p className="text-xs text-[#73706A] leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Explainer */}
        <div className="mb-20">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">One Concept, Two Audiences</span>
            <h2 className="font-serif-brand text-3xl font-normal tracking-tight mb-2">Ontology, explained for <em>whoever's in the room.</em></h2>
            <p className="text-sm text-[#3B3D42]">The same layer, told two ways — because the CEO and the chief data architect buy for different reasons.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#ECE5D6] border border-[#14161A]/10 rounded-2xl p-8">
              <span className="text-[10px] font-bold tracking-wider text-[#D8B679] bg-[#1E3A36] px-3 py-1.5 rounded-full uppercase inline-block mb-5">For Business Leaders</span>
              <h4 className="font-serif-brand text-2xl font-semibold leading-tight mb-3">"One trusted view of your business."</h4>
              <p className="text-sm text-[#3B3D42] leading-relaxed mb-6">
                You stop arguing about whose report is right. Every system finally agrees on what a patient, a customer, or a transaction <em>is</em> — so AI yields answers you can take to the board and defend to a regulator. The word "ontology" never has to come up.
              </p>
              <ul className="space-y-2.5 text-xs text-[#3B3D42]">
                <li className="flex items-center gap-2.5"><span className="w-3 h-0.5 bg-[#A87C3C]" /> Faster, lower-risk AI adoption</li>
                <li className="flex items-center gap-2.5"><span className="w-3 h-0.5 bg-[#A87C3C]" /> Decisions that survive an regulatory audit</li>
                <li className="flex items-center gap-2.5"><span className="w-3 h-0.5 bg-[#A87C3C]" /> No multi-year database migration project</li>
              </ul>
            </div>
            <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-8">
              <span className="text-[10px] font-bold tracking-wider text-[#F4F0E6] bg-[#14161A] px-3 py-1.5 rounded-full uppercase inline-block mb-5">For Technical Leaders</span>
              <h4 className="font-serif-brand text-2xl font-semibold leading-tight mb-3">Semantic layer + knowledge graph + GraphRAG.</h4>
              <p className="text-sm text-[#3B3D42] leading-relaxed mb-6">
                An explicit ontology with object types, relationships, constraints, and lineage — driving graph-based retrieval instead of vector-only similarity. That is how accuracy moves from a 70–80% ceiling to 90–99% on complex multi-hop queries.
              </p>
              <ul className="space-y-2.5 text-xs text-[#3B3D42]">
                <li className="flex items-center gap-2.5"><span className="w-3 h-0.5 bg-[#A87C3C]" /> W3C standard semantics, versioned &amp; governed</li>
                <li className="flex items-center gap-2.5"><span className="w-3 h-0.5 bg-[#A87C3C]" /> GraphRAG reasoning over explicit relationships</li>
                <li className="flex items-center gap-2.5"><span className="w-3 h-0.5 bg-[#A87C3C]" /> Evidence packs &amp; confidence scores built-in</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#14161A] text-[#F4F0E6] rounded-3xl p-12 text-center relative overflow-hidden isolate">
          <div aria-hidden className="absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(500px_260px_at_50%_120%,rgba(168,124,60,0.3),transparent)]" />
          <h2 className="font-serif-brand text-3xl sm:text-4xl font-normal leading-tight tracking-tight mb-3">From assessment to production — <em>governed.</em></h2>
          <p className="text-sm text-[#F4F0E6]/78 max-w-xl mx-auto mb-8">
            Connect your systems once. The Foundry maps them to a trusted model, and your AI agents finally understand your business constraints.
          </p>
          <button onClick={() => navigate('/survey')} className="btn btn-primary btn-lg bg-[#F4F0E6] text-[#14161A] hover:bg-[#D8B679]">
            Start your readiness assessment
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
