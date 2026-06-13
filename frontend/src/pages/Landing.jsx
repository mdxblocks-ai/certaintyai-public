import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import ArchitectureStack from '../components/ArchitectureStack'
import NarrativeChain from '../components/NarrativeChain'
import ProofStrip from '../components/ProofStrip'
import ExecutiveEngagement from '../components/ExecutiveEngagement'
import MaturityProgression from '../components/MaturityProgression'
import { BRAND, CTA } from '../lib/branding'

const WHY_CARDS = [
  {
    title: 'Open standards on every seam',
    blurb:
      'A2A across processes. MCP for tools. W3C semantics for meaning. OpenLineage for provenance. Apache-2.0 for the whole thing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <circle cx="12" cy="5" r="2.2" /><circle cx="5" cy="18" r="2.2" /><circle cx="19" cy="18" r="2.2" />
        <path d="M12 7.2v3M10.2 11.5l-3.6 4.7M13.8 11.5l3.6 4.7" />
      </svg>
    ),
  },
  {
    title: 'Ontology as a real layer',
    blurb:
      'A deployable middleware layer between databases and agent prompts — domain-tuned, versioned, and queryable. Not a prompt-time afterthought.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M7 9h10M7 13h7M9 18v3M15 18v3M6 21h12" />
      </svg>
    ),
  },
  {
    title: 'Governance-first for regulated industries',
    blurb:
      'HIPAA, GDPR, SOC 2, FERPA, EU AI Act, NIST AI RMF, ISO 42001 — controls baked in. Built for the sectors where AI must defend its answers.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

const INDUSTRIES = [
  {
    name: 'Healthcare & Life Sciences',
    slug: 'healthcare',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    name: 'Banking & Financial Services',
    slug: 'finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="9" y1="22" x2="9" y2="16" />
        <line x1="15" y1="22" x2="15" y2="16" />
        <line x1="9" y1="16" x2="15" y2="16" />
        <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Government & Public Sector',
    slug: 'other',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <path d="M3 11h18L12 2Z" />
      </svg>
    ),
  },
  {
    name: 'Education',
    slug: 'education',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    name: 'Cybersecurity',
    slug: 'cyber',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: 'IT Consulting',
    slug: 'consulting',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
]

const FRAMEWORKS = [
  'Gartner AI Maturity', 'NIST AI RMF', 'EU AI Act', 'ISO/IEC 42001', 'ISO/IEC 27001',
  'HIPAA', 'HITECH', 'FDA AI/ML', 'PCI DSS', 'SOX', 'GLBA', 'Basel III', 'FedRAMP',
  'FISMA', 'NIST 800-53', 'FERPA', 'COPPA', 'GDPR', 'SOC 2', 'CMMC',
]

const HONESTY_PILLARS = [
  {
    title: 'Every visible number is computed',
    body: 'No fabricated metrics. Where data isn’t real, the UI says so — “Not computed” / “Roadmap” — never a plausible-looking fake.',
  },
  {
    title: 'Deterministic scoring, generative explanation',
    body: 'A test-gated deterministic engine owns every score. Generative agents only explain and contextualize. Same inputs always produce the same auditable result.',
  },
  {
    title: 'Open source, open protocols, open seams',
    body: 'Apache-2.0. A2A on the wire. MCP for tools. Provider-agnostic LLM client. Built so a regulator can read every join in the architecture.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard?tab=home', { replace: true })
    }
  }, [user, navigate])

  const scrollToChain = (e) => {
    e.preventDefault()
    const el = document.getElementById('narrative-chain')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">

      {/* ===== Hero ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7C5723] uppercase">
            <span className="w-6 h-px bg-[#A87C3C]" />
            {BRAND.positioningEyebrow}
          </div>
          <h1 className="font-serif-brand text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.02] tracking-tight mt-6 text-[#14161A]">
            {BRAND.tagline.split(' for ')[0]} <em>for regulated industries.</em>
          </h1>
          <p className="text-lg sm:text-xl text-[#3B3D42] leading-relaxed mt-7 mb-9 max-w-2xl">
            Assess your organization's AI maturity, explore industry-specific AI copilots, and establish a trusted path from experimentation to operationalization.
          </p>

          <div className="flex flex-wrap gap-3 items-center">
            <Link
              to="/copilots"
              className="py-4 px-7 rounded-lg bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-sm shadow"
            >
              Explore AI Copilots →
            </Link>
            <Link
              to={CTA.startFree.href}
              className="py-4 px-7 rounded-lg bg-[#D8B679] text-[#14161A] hover:bg-[#A87C3C] hover:text-white transition font-bold text-sm shadow"
            >
              Get Started →
            </Link>
            <Link
              to="/ai-readiness"
              className="py-4 px-7 rounded-lg border border-[#14161A]/16 text-[#14161A] hover:bg-[#ECE5D6] hover:border-[#14161A]/30 transition font-bold text-sm"
            >
              Assess My Organization's AI Readiness →
            </Link>
          </div>

          <div className="mt-10 text-[11.5px] text-[#73706A] tracking-wide font-sans-brand flex flex-wrap items-center gap-x-2 gap-y-1">
            <b className="uppercase tracking-widest text-[#14161A]/70">Built on</b>
            {BRAND.trustStrip.map((t, i) => (
              <React.Fragment key={t}>
                <span>{t}</span>
                {i < BRAND.trustStrip.length - 1 && (
                  <span className="text-[#14161A]/20">·</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-8">
            <a
              href="#narrative-chain"
              onClick={scrollToChain}
              className="text-[12px] font-bold text-[#7C5723] hover:text-[#14161A] transition tracking-wide"
            >
              See the 7-step architecture narrative ↓
            </a>
          </div>
        </div>
      </section>

      {/* ===== Stat Strip (preserved, honest macro stats) ===== */}
      <section className="border-t border-b border-[#14161A]/10 bg-[#ECE5D6]/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="font-serif-brand text-2xl sm:text-3xl lg:text-4xl text-[#14161A] max-w-4xl leading-tight font-normal mb-12">
            In regulated industries, your data is your most valuable asset — and your <em>largest liability.</em>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t border-[#14161A]/10 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#14161A]">
                95<span className="text-[#7C5723] text-2xl font-sans-brand font-normal">%</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                of enterprise generative-AI pilots show no measurable P&amp;L impact.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">Source: MIT Project NANDA — The GenAI Divide: State of AI in Business 2025 (2025)</div>
            </div>
            <div className="border-t border-[#14161A]/10 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#14161A]">
                60<span className="text-[#7C5723] text-2xl font-sans-brand font-normal">%</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                of AI projects lacking AI-ready data will be abandoned through 2026.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">Source: Gartner (2025)</div>
            </div>
            <div className="border-t border-[#14161A]/10 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#14161A]">
                40<span className="text-[#7C5723] text-2xl font-sans-brand font-normal">%</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                of agentic-AI projects are forecast to be canceled by end of 2027 — for cost, value, or risk-control gaps.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">Source: Gartner (2025)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== The 7-step Narrative Chain ===== */}
      <section id="narrative-chain" className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
            The Open Architecture
          </span>
          <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
            Seven layers. One audit trail.
          </h2>
          <p className="text-sm text-[#3B3D42] mt-3">
            Each layer is open at its seams. Each step compounds — from the data you already own all the way through to a board-defensible outcome.
          </p>
        </div>

        <NarrativeChain />
      </section>

      {/* ===== Executive Outcomes ===== */}
      <section id="executive-outcomes" className="border-t border-[#14161A]/10 py-20">
        <div className="max-w-7xl mx-auto px-6">

          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              Executive Outcomes
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Move from AI experimentation to trusted operationalization.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              Four executive questions. Four answerable next steps. One open architecture underneath all of them — so a CIO, CFO, CTO, CISO, board member, or investor can see business value and the next move at a glance.
            </p>
          </div>

          {/* Four outcome cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-20">
            {[
              {
                index: '01',
                question: 'Where Am I Today?',
                description: 'Assess AI maturity, governance readiness, operational risk, and organizational preparedness.',
                ctaLabel: 'Run AI Readiness Assessment',
                ctaHref: '/survey',
                audience: 'CIO · CFO · Board',
              },
              {
                index: '02',
                question: 'What Should I Do Next?',
                description: 'Receive a prioritized roadmap aligned to governance, compliance, architecture, and business outcomes.',
                ctaLabel: 'View Recommended Roadmap',
                ctaHref: '/survey',
                audience: 'CTO · CIO · Head of AI',
              },
              {
                index: '03',
                question: 'What Business Value Will I Gain?',
                description: 'Reduce risk, improve productivity, control costs, accelerate adoption, and increase confidence in AI decisions.',
                ctaLabel: 'Explore Business Outcomes',
                ctaHref: '/copilots',
                audience: 'CFO · COO · Board',
              },
              {
                index: '04',
                question: 'How Do I Operationalize AI?',
                description: "Move from disconnected pilots to governed enterprise-wide AI operations using CertaintyAI's control tower and governance framework.",
                ctaLabel: 'See Operationalization Journey',
                ctaHref: '#architecture-stack',
                audience: 'CTO · CISO · Head of AI',
              },
            ].map((o) => {
              const isAnchor = o.ctaHref.startsWith('#')
              const handleAnchor = (e) => {
                if (!isAnchor) return
                e.preventDefault()
                const el = document.querySelector(o.ctaHref)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              return (
                <article
                  key={o.index}
                  className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-[#A87C3C]/55 transition duration-200 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className="w-11 h-11 rounded-xl bg-[#14161A] text-[#D8B679] flex items-center justify-center font-serif-brand text-base font-semibold shrink-0"
                      aria-hidden
                    >
                      {o.index}
                    </div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-[#73706A] mt-2 text-right">
                      {o.audience}
                    </span>
                  </div>

                  <h3 className="font-serif-brand text-xl font-semibold text-[#14161A] leading-snug mb-3">
                    {o.question}
                  </h3>
                  <p className="text-[13px] text-[#3B3D42] leading-relaxed mb-6 flex-1">
                    {o.description}
                  </p>

                  {isAnchor ? (
                    <a
                      href={o.ctaHref}
                      onClick={handleAnchor}
                      className="inline-flex items-center text-[13px] font-bold text-[#7C5723] hover:text-[#14161A] transition mt-auto"
                    >
                      {o.ctaLabel} →
                    </a>
                  ) : (
                    <Link
                      to={o.ctaHref}
                      className="inline-flex items-center text-[13px] font-bold text-[#7C5723] hover:text-[#14161A] transition mt-auto"
                    >
                      {o.ctaLabel} →
                    </Link>
                  )}
                </article>
              )
            })}
          </div>

          {/* Maturity progression (shared component) */}
          <MaturityProgression />

        </div>
      </section>

      {/* ===== Embedded Architecture Stack canvas ===== */}
      <section id="architecture-stack" className="border-t border-[#14161A]/10 bg-[#1E3A36]/4 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#A87C3C] uppercase block mb-3">
              Live Architecture Canvas
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Hover any layer. Lock the view. Inspect the components.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              The same 6-layer stack you read about above — explorable in business or technical view. Click a layer to lock; click it again to release.
            </p>
          </div>

          <ArchitectureStack />

          <div className="mt-8 text-center">
            <Link
              to={CTA.exploreArchitecture.href}
              className="text-[13px] font-bold text-[#7C5723] hover:text-[#14161A] transition"
            >
              Open the full-page canvas →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Proof Strip ===== */}
      <ProofStrip />

      {/* ===== Why an Open Architecture ===== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Why open</span>
          <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
            Closed AI stacks fail regulated audits.
          </h2>
          <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
            An auditable AI program needs portable agents, portable data, and portable governance. Every seam in CertaintyAI is an open standard so nothing about your future depends on a single vendor.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-7 shadow-sm hover:border-[#A87C3C] transition duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1E3A36] text-[#D8B679] flex items-center justify-center">
                {card.icon}
              </div>
              <h3 className="font-serif-brand text-xl font-semibold text-[#14161A] mt-5 mb-2">{card.title}</h3>
              <p className="text-xs text-[#3B3D42] leading-relaxed">{card.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Industries ===== */}
      <section id="explorer" className="border-t border-[#14161A]/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Industries &amp; Domains</span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Pre-built ontologies for regulated sectors.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3">
              Each sector ships with its own vocabulary pack, framework mapping, and copilot template — so you deploy in weeks, not months.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.name}
                className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm hover:border-[#A87C3C] transition cursor-pointer flex flex-col justify-between"
                onClick={() => navigate('/foundry')}
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#1E3A36] text-[#D8B679] flex items-center justify-center mb-4">
                    {ind.icon}
                  </div>
                  <h4 className="font-serif-brand text-lg font-semibold text-[#14161A]">{ind.name}</h4>
                </div>
                <span className="text-[11px] text-[#A87C3C] font-semibold mt-6 block">
                  Inspect domain ontology →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Honesty Contract ===== */}
      <section className="border-t border-[#14161A]/10 py-20 bg-[#1E3A36] text-[#F4F0E6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase block mb-3">The Honesty Contract</span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl font-normal leading-tight">
              Defensible isn’t a marketing word here. It’s an enforced product property.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HONESTY_PILLARS.map((h) => (
              <div
                key={h.title}
                className="bg-[#14161A]/40 border border-[#D8B679]/20 rounded-2xl p-7 backdrop-blur-sm"
              >
                <h3 className="font-serif-brand text-lg font-semibold text-[#D8B679] mb-2.5 leading-snug">{h.title}</h3>
                <p className="text-[13px] text-[#F4F0E6]/85 leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Frameworks Wall ===== */}
      <section className="border-t border-[#14161A]/10 py-20 bg-[#ECE5D6]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Auditable Compliance</span>
              <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
                Aligned to twenty global audit frameworks.
              </h2>
              <p className="text-sm text-[#3B3D42] mt-3">
                Pre-mapped to privacy, healthcare, cybersecurity, and public-sector rules, tailored dynamically during your readiness assessment.
              </p>
            </div>
            <Link
              to="/survey"
              className="text-[#A87C3C] hover:text-[#7C5723] font-bold text-sm shrink-0"
            >
              Analyze your rules list →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {FRAMEWORKS.map((fw) => (
              <span
                key={fw}
                className="px-4 py-2 text-xs rounded-lg border border-[#14161A]/10 text-[#3B3D42] bg-[#FBF8F0] shadow-sm font-semibold select-none hover:border-[#A87C3C] transition duration-150"
              >
                {fw}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Executive Engagement ===== */}
      <ExecutiveEngagement />

      <Footer />
    </div>
  )
}
