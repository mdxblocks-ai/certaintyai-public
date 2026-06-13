import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import ArchitectureStack from '../components/ArchitectureStack'
import NarrativeChain from '../components/NarrativeChain'
import ProofStrip from '../components/ProofStrip'
import ExecutiveEngagement from '../components/ExecutiveEngagement'
import StatusChip from '../components/StatusChip'
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

      {/* ===== Hero (MDxBlocks dark theme) ===== */}
      <section
        className="relative bg-[#0A0A0E] text-[#F4F0E6] overflow-hidden isolate"
        style={{
          backgroundImage:
            'radial-gradient(900px 480px at 12% 0%, rgba(216,182,121,0.12), transparent 60%), radial-gradient(700px 360px at 90% 30%, rgba(224,132,67,0.10), transparent 60%)',
        }}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D8B679]/35 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-20 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#D8B679] uppercase">
              <span className="w-6 h-px bg-gradient-to-r from-[#D8B679] to-transparent" />
              {BRAND.positioningEyebrow}
            </div>
            <h1 className="font-serif-brand text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.02] tracking-tight mt-6 text-[#F4F0E6]">
              {BRAND.tagline.split(' for ')[0]}{' '}
              <em className="not-italic bg-gradient-to-r from-[#F0CE8C] via-[#D8B679] to-[#E08443] bg-clip-text text-transparent">for regulated industries.</em>
            </h1>
            <p className="text-lg sm:text-xl text-[#F4F0E6]/72 leading-relaxed mt-7 mb-9 max-w-2xl">
              Assess your organization's AI maturity, explore industry-specific AI copilots, and establish a trusted path from experimentation to operationalization.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <Link
                to="/copilots"
                className="py-4 px-7 rounded-lg bg-gradient-to-br from-[#F0CE8C] via-[#D8B679] to-[#A87C3C] text-[#0A0A0E] hover:from-[#F4D89A] hover:via-[#E0BD7C] hover:to-[#B8884C] transition font-bold text-sm shadow-[0_8px_28px_-6px_rgba(216,182,121,0.55)] hover:shadow-[0_8px_36px_-6px_rgba(216,182,121,0.75)]"
              >
                Explore AI Copilots →
              </Link>
              <Link
                to={CTA.startFree.href}
                className="py-4 px-7 rounded-lg bg-gradient-to-br from-[#E08443] to-[#C77A57] text-[#0A0A0E] hover:from-[#EE9755] hover:to-[#D88A66] transition font-bold text-sm shadow-[0_8px_24px_-6px_rgba(224,132,67,0.55)]"
              >
                Get Started →
              </Link>
              <Link
                to="/ai-readiness"
                className="py-4 px-7 rounded-lg border border-[#D8B679]/30 text-[#F4F0E6] hover:bg-[#D8B679]/8 hover:border-[#D8B679]/55 transition font-bold text-sm"
              >
                Assess Your AI Readiness →
              </Link>
            </div>

            <div className="mt-10 text-[11.5px] text-[#F4F0E6]/55 tracking-wide font-sans-brand flex flex-wrap items-center gap-x-2 gap-y-1">
              <b className="uppercase tracking-widest text-[#D8B679]/80">Built on</b>
              {BRAND.trustStrip.map((t, i) => (
                <React.Fragment key={t}>
                  <span>{t}</span>
                  {i < BRAND.trustStrip.length - 1 && (
                    <span className="text-[#D8B679]/25">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="#narrative-chain"
                onClick={scrollToChain}
                className="text-[12px] font-bold text-[#E0A47C] hover:text-[#F0CE8C] transition tracking-wide"
              >
                See the 7-step architecture narrative ↓
              </a>
            </div>
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D8B679]/25 to-transparent pointer-events-none" />
      </section>

      {/* ===== Designed For (MDxBlocks dark) ===== */}
      <section
        id="designed-for"
        className="relative bg-[#0A0A0E] text-[#F4F0E6] py-16"
        style={{ backgroundImage: 'radial-gradient(700px 320px at 70% 50%, rgba(216,182,121,0.08), transparent 60%)' }}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase block mb-3">
              Designed For
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#F4F0E6] font-normal leading-tight">
              Built for the executives regulators ask hard questions of.
            </h2>
            <p className="text-sm text-[#F4F0E6]/65 mt-3 max-w-2xl">
              Six leadership roles. One open architecture they can all defend.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { abbr: 'CEO',     full: 'Chief Executive Officer',                outcome: 'Defensible AI strategy',     accent: '#D8B679' },
              { abbr: 'CIO/CTO', full: 'Chief Information / Technology Officer', outcome: 'Operationalize at scale',    accent: '#A87C3C' },
              { abbr: 'CISO',    full: 'Chief Information Security Officer',     outcome: 'Continuous risk visibility', accent: '#2F7D6B' },
              { abbr: 'CFO',     full: 'Chief Financial Officer',                outcome: 'Value & cost transparency',  accent: '#3A7E92' },
              { abbr: 'CDO',     full: 'Chief Data Officer',                     outcome: 'Governed semantic layer',    accent: '#E08443' },
              { abbr: 'AI GOV',  full: 'AI Governance Council',                  outcome: 'Audit-ready oversight',      accent: '#A8506A' },
            ].map((r) => (
              <article
                key={r.abbr}
                className="bg-[#15161B] border border-[#D8B679]/15 rounded-2xl p-5 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_28px_-6px_rgba(216,182,121,0.25)] hover:border-[#D8B679]/45 transition duration-200 flex items-center gap-4"
                style={{ borderLeft: `3px solid ${r.accent}` }}
              >
                <div
                  className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-serif-brand text-[#0A0A0E] font-semibold shadow-[0_0_18px_-4px_rgba(216,182,121,0.45)]"
                  style={{
                    background: `linear-gradient(135deg, ${r.accent} 0%, ${r.accent}cc 100%)`,
                  }}
                  aria-hidden
                >
                  <span className={r.abbr.length > 4 ? 'text-[10px] tracking-widest' : 'text-base tracking-wide'}>
                    {r.abbr}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif-brand text-base font-semibold text-[#F4F0E6] leading-tight">{r.full}</div>
                  <div className="text-[12px] text-[#F4F0E6]/65 mt-1 leading-snug">{r.outcome}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why Organizations Struggle With AI (MDxBlocks dark) ===== */}
      <section
        id="why-struggle"
        className="relative bg-[#101116] text-[#F4F0E6] py-16 border-y border-[#D8B679]/12"
        style={{ backgroundImage: 'radial-gradient(800px 360px at 80% 50%, rgba(224,132,67,0.08), transparent 60%)' }}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase block mb-3">
              Why Organizations Struggle With AI
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl lg:text-5xl text-[#F4F0E6] font-normal leading-tight">
              The gap is governance and readiness —{' '}
              <em className="not-italic bg-gradient-to-r from-[#F0CE8C] via-[#D8B679] to-[#E08443] bg-clip-text text-transparent">not models.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t border-[#D8B679]/25 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#F4F0E6]">
                95<span className="text-[#E08443] text-2xl font-sans-brand font-normal">%</span>
              </div>
              <div className="text-sm text-[#F4F0E6]/72 mt-2.5">
                of enterprise generative-AI pilots show no measurable P&amp;L impact.
              </div>
              <div className="text-[10px] text-[#F4F0E6]/45 mt-1.5 italic font-serif-brand">Source: MIT Project NANDA — The GenAI Divide: State of AI in Business 2025 (2025)</div>
            </div>
            <div className="border-t border-[#D8B679]/25 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#F4F0E6]">
                60<span className="text-[#E08443] text-2xl font-sans-brand font-normal">%</span>
              </div>
              <div className="text-sm text-[#F4F0E6]/72 mt-2.5">
                of AI projects lacking AI-ready data will be abandoned through 2026.
              </div>
              <div className="text-[10px] text-[#F4F0E6]/45 mt-1.5 italic font-serif-brand">Source: Gartner (2025)</div>
            </div>
            <div className="border-t border-[#D8B679]/25 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#F4F0E6]">
                40<span className="text-[#E08443] text-2xl font-sans-brand font-normal">%</span>
              </div>
              <div className="text-sm text-[#F4F0E6]/72 mt-2.5">
                of agentic-AI projects are forecast to be canceled by end of 2027 — for cost, value, or risk-control gaps.
              </div>
              <div className="text-[10px] text-[#F4F0E6]/45 mt-1.5 italic font-serif-brand">Source: Gartner (2025)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Executive Outcomes (MDxBlocks dark) ===== */}
      <section
        id="executive-outcomes"
        className="relative bg-[#0A0A0E] text-[#F4F0E6] py-20"
        style={{
          backgroundImage:
            'radial-gradient(900px 420px at 20% 0%, rgba(216,182,121,0.10), transparent 60%), radial-gradient(700px 360px at 80% 100%, rgba(224,132,67,0.10), transparent 60%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase block mb-3">
              Executive Outcomes
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#F4F0E6] font-normal leading-tight">
              Move from AI experimentation to{' '}
              <em className="not-italic bg-gradient-to-r from-[#F0CE8C] via-[#D8B679] to-[#E08443] bg-clip-text text-transparent">measurable business value.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                title: 'Govern AI Risk',
                blurb: 'Vendor, model, prompt, and policy risk surfaced in one auditable view — mapped to NIST AI RMF, ISO 27001, EU AI Act.',
                accent: '#A87C3C',
                href: '/ai-readiness',
                cta: 'Assess governance',
              },
              {
                title: 'Operationalize AI',
                blurb: 'From disconnected pilots to a governed enterprise platform — ontology, orchestration, and a control tower on open standards.',
                accent: '#2F7D6B',
                href: '/architecture',
                cta: 'See the architecture',
              },
              {
                title: 'Measure Business Value',
                blurb: 'Concrete domain copilots with cited outcomes per role — defensible numbers for the board, every quarter.',
                accent: '#3A7E92',
                href: '/copilots',
                cta: 'Explore copilots',
              },
            ].map((o) => (
              <Link
                key={o.title}
                to={o.href}
                className="bg-[#15161B] border border-[#D8B679]/12 rounded-2xl p-7 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.65)] hover:shadow-[0_12px_42px_-10px_rgba(216,182,121,0.3)] hover:border-[#D8B679]/45 transition duration-200 group flex flex-col"
                style={{ borderTop: `4px solid ${o.accent}` }}
              >
                <h3 className="font-serif-brand text-xl text-[#F4F0E6] font-semibold leading-snug mb-3">
                  {o.title}
                </h3>
                <p className="text-[13px] text-[#F4F0E6]/68 leading-relaxed mb-6 flex-1">
                  {o.blurb}
                </p>
                <span
                  className="inline-flex items-center text-[13px] font-bold transition group-hover:translate-x-0.5"
                  style={{ color: o.accent }}
                >
                  {o.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Trusted Frameworks (MDxBlocks dark) ===== */}
      <section
        id="trusted-frameworks"
        className="relative bg-[#101116] text-[#F4F0E6] py-16 border-y border-[#D8B679]/12"
        style={{ backgroundImage: 'radial-gradient(800px 360px at 50% 50%, rgba(216,182,121,0.07), transparent 60%)' }}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#E08443] uppercase block mb-3">
              Trusted Frameworks
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#F4F0E6] font-normal leading-tight">
              Built on the standards your auditors already use.
            </h2>
            <p className="text-sm text-[#F4F0E6]/68 mt-3 max-w-2xl">
              Run on Google Cloud's production-grade Vertex AI. Scored against NIST AI RMF. Mapped to ISO 42001 and EU AI Act. Defensible at every join.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: 'Google Cloud', category: 'Platform',       role: 'Production runtime' },
              { name: 'Vertex AI',    category: 'Model',          role: 'Gemini · ADC auth' },
              { name: 'NIST AI RMF',  category: 'Risk framework', role: 'GOVERN · MEASURE scored' },
              { name: 'ISO 42001',    category: 'Standard',       role: 'AI management system' },
              { name: 'EU AI Act',    category: 'Regulation',     role: 'Risk-tier mapping' },
            ].map((f) => (
              <article
                key={f.name}
                className="bg-[#15161B] border border-[#D8B679]/15 rounded-2xl p-5 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_28px_-6px_rgba(216,182,121,0.25)] hover:border-[#D8B679]/45 transition duration-200 text-center flex flex-col items-center"
              >
                <div className="text-[10px] uppercase tracking-widest text-[#D8B679] font-bold mb-2">
                  {f.category}
                </div>
                <div className="font-serif-brand text-base font-semibold text-[#F4F0E6] leading-tight mb-2">
                  {f.name}
                </div>
                <div className="text-[11px] text-[#F4F0E6]/55 leading-snug">
                  {f.role}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Industry AI Copilots (MDxBlocks dark) ===== */}
      <section
        id="industry-copilots"
        className="relative bg-[#0A0A0E] text-[#F4F0E6] py-20"
        style={{
          backgroundImage:
            'radial-gradient(800px 380px at 0% 30%, rgba(216,182,121,0.10), transparent 60%), radial-gradient(700px 360px at 100% 70%, rgba(224,132,67,0.10), transparent 60%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative">

          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase block mb-3">
              Industry AI Copilots
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#F4F0E6] font-normal leading-tight">
              Pre-built AI copilots,{' '}
              <em className="not-italic bg-gradient-to-r from-[#F0CE8C] via-[#D8B679] to-[#E08443] bg-clip-text text-transparent">for regulated industries.</em>
            </h2>
            <p className="text-sm sm:text-base text-[#F4F0E6]/68 mt-3 max-w-3xl leading-relaxed">
              Pre-built AI copilots designed for regulated industries with governance, explainability, security, and compliance built in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: 'healthcare',
                title: 'Healthcare',
                accent: '#A8506A',
                href: '/copilots#healthcare',
                copilots: [
                  { name: 'AI-CDSS Copilot',                status: 'pilot' },
                  { name: 'AI-PFIS Copilot',                status: 'pilot' },
                  { name: 'Prior Authorization Copilot',    status: 'coming-soon' },
                  { name: 'Care Coordination Assistant',    status: null },
                ],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                ),
              },
              {
                id: 'finance',
                title: 'Financial Services & Accounting',
                accent: '#3A7E92',
                href: '/copilots#finance',
                copilots: [
                  { name: 'AI Tax Planner Copilot',         status: 'available' },
                  { name: 'Quanto FinOps Copilot',          status: 'coming-soon' },
                  { name: 'Audit Readiness Assistant',      status: null },
                  { name: 'Financial Controls Assistant',   status: null },
                ],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <rect x="3" y="9" width="18" height="11" rx="1.5" />
                    <path d="M3 9l9-6 9 6" />
                    <line x1="7" y1="13" x2="7" y2="17" />
                    <line x1="12" y1="13" x2="12" y2="17" />
                    <line x1="17" y1="13" x2="17" y2="17" />
                  </svg>
                ),
              },
              {
                id: 'cybersecurity',
                title: 'Cybersecurity',
                accent: '#2F7D6B',
                href: '/copilots#cybersecurity',
                copilots: [
                  { name: 'AI Security Auditor',        status: 'pilot' },
                  { name: 'SOC Analyst Copilot',        status: null },
                  { name: 'Threat Intelligence Copilot', status: null },
                  { name: 'Incident Response Assistant', status: null },
                ],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ),
              },
              {
                id: 'education',
                title: 'Education',
                accent: '#D8B061',
                href: '/copilots#education',
                copilots: [
                  { name: 'GradeUP Copilot',                  status: 'available' },
                  { name: 'SkillUP Copilot',                  status: 'available' },
                  { name: 'Curriculum Intelligence Assistant', status: null },
                  { name: 'Institutional Analytics Assistant', status: null },
                ],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                ),
              },
              {
                id: 'it-consulting',
                title: 'IT Consulting',
                accent: '#A87C3C',
                href: '/copilots',
                copilots: [
                  { name: 'RFP Response Copilot',          status: null },
                  { name: 'Knowledge Management Copilot',  status: null },
                  { name: 'Project Delivery Assistant',    status: null },
                  { name: 'Proposal Intelligence Assistant', status: null },
                ],
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                ),
              },
            ].map((ind) => (
              <article
                key={ind.id}
                className="bg-[#15161B] border border-[#D8B679]/12 rounded-2xl p-6 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.65)] hover:shadow-[0_12px_42px_-10px_rgba(216,182,121,0.3)] hover:border-[#D8B679]/45 transition duration-200 flex flex-col"
                style={{ borderTop: `4px solid ${ind.accent}` }}
              >
                <header className="flex items-center gap-3 mb-5">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[#0A0A0E] shadow-[0_0_18px_-4px_rgba(216,182,121,0.4)]"
                    style={{
                      background: `linear-gradient(135deg, ${ind.accent} 0%, ${ind.accent}cc 100%)`,
                    }}
                    aria-hidden
                  >
                    {ind.icon}
                  </div>
                  <h3 className="font-serif-brand text-lg sm:text-xl font-semibold text-[#F4F0E6] leading-tight">
                    {ind.title}
                  </h3>
                </header>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {ind.copilots.map((c) => (
                    <li key={c.name} className="flex items-start gap-2.5 text-[13px] text-[#F4F0E6]/82 leading-snug">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: ind.accent }}
                        aria-hidden
                      />
                      <span className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{c.name}</span>
                        {c.status && <StatusChip status={c.status} />}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={ind.href}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold transition hover:translate-x-0.5 mt-auto self-start"
                  style={{ color: ind.accent }}
                >
                  View Demo →
                </Link>
              </article>
            ))}
          </div>

          {/* ----- Final CTA band within the section ----- */}
          <div
            className="mt-14 relative bg-[#15161B] border border-[#D8B679]/18 rounded-2xl p-8 sm:p-10 text-center shadow-[0_12px_44px_-12px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(700px 280px at 50% 0%, rgba(216,182,121,0.10), transparent 70%)',
            }}
          >
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase block mb-2">
              See It In Action
            </span>
            <h3 className="font-serif-brand text-2xl sm:text-3xl text-[#F4F0E6] font-normal leading-tight mb-3">
              See Industry AI Copilots in Action.
            </h3>
            <p className="text-sm text-[#F4F0E6]/65 max-w-2xl mx-auto mb-7 leading-relaxed">
              Pick the door that fits your role — explore the copilots, assess your readiness, or speak with an advisor.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/copilots"
                className="py-3.5 px-6 rounded-lg bg-gradient-to-br from-[#F0CE8C] via-[#D8B679] to-[#A87C3C] text-[#0A0A0E] hover:from-[#F4D89A] hover:via-[#E0BD7C] hover:to-[#B8884C] transition font-bold text-sm shadow-[0_8px_24px_-6px_rgba(216,182,121,0.55)]"
              >
                Explore AI Copilots →
              </Link>
              <Link
                to="/ai-readiness"
                className="py-3.5 px-6 rounded-lg bg-gradient-to-br from-[#E08443] to-[#C77A57] text-[#0A0A0E] hover:from-[#EE9755] hover:to-[#D88A66] transition font-bold text-sm shadow-[0_8px_24px_-6px_rgba(224,132,67,0.55)]"
              >
                Assess Your AI Readiness →
              </Link>
              <Link
                to="/signup"
                className="py-3.5 px-6 rounded-lg border border-[#D8B679]/30 text-[#F4F0E6] hover:bg-[#D8B679]/8 hover:border-[#D8B679]/55 transition font-bold text-sm"
              >
                Talk to an AI Advisor →
              </Link>
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
