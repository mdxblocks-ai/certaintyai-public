import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LogoMark from '../components/LogoMark'
import Footer from '../components/Footer'

const WHY_CARDS = [
  {
    title: 'Ontology as a layer',
    blurb:
      'A real architectural layer between your data and your AI — open, domain-tuned, and explainable end to end.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <circle cx="12" cy="5" r="2.2" /><circle cx="5" cy="18" r="2.2" /><circle cx="19" cy="18" r="2.2" />
        <path d="M12 7.2v3M10.2 11.5l-3.6 4.7M13.8 11.5l3.6 4.7" />
      </svg>
    ),
  },
  {
    title: 'Explainable agentic AI',
    blurb:
      'Multi-agent reasoning with GraphRAG and human-in-the-loop. Every recommendation cites the evidence behind it.',
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
      'HIPAA, GDPR, SOC 2, FERPA, EU AI Act — controls baked in. Built for the sectors where AI must defend its answers.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

const INDUSTRIES = [
  { name: 'Healthcare & Life Sciences', emoji: '🏥', slug: 'healthcare' },
  { name: 'Banking & Financial Services', emoji: '🏦', slug: 'finance' },
  { name: 'Government & Public Sector', emoji: '🏛️', slug: 'other' },
  { name: 'Education', emoji: '🎓', slug: 'education' },
  { name: 'Cybersecurity', emoji: '🛡️', slug: 'cyber' },
  { name: 'IT Consulting', emoji: '💼', slug: 'consulting' },
]

const FRAMEWORKS = [
  'Gartner AI Maturity',
  'NIST AI RMF',
  'EU AI Act',
  'ISO/IEC 42001',
  'ISO/IEC 27001',
  'HIPAA',
  'HITECH',
  'FDA AI/ML',
  'PCI DSS',
  'SOX',
  'GLBA',
  'Basel III',
  'FedRAMP',
  'FISMA',
  'NIST 800-53',
  'FERPA',
  'COPPA',
  'GDPR',
  'SOC 2',
  'CMMC',
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard?tab=home', { replace: true })
    }
  }, [user, navigate])

  const handleScrollToExplorer = () => {
    const el = document.getElementById('explorer')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Hero Content */}
          <div className="lg:col-span-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7C5723] uppercase">
              <span className="w-6 h-px bg-[#A87C3C]" />
              The AI Governance Layer
            </div>
            <h1 className="font-serif-brand text-5xl sm:text-6xl lg:text-7xl font-normal leading-none tracking-tight mt-6 text-[#14161A]">
              Make every AI decision <em>defensible.</em>
            </h1>
            <p className="text-lg sm:text-xl text-[#3B3D42] leading-relaxed mt-6 mb-8 max-w-xl">
              CertaintyAI is the governance layer for regulated industries — turning fragmented, siloed data into explainable, audit-ready intelligence your board, your auditors, and your regulators can trust.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link 
                to="/survey" 
                className="py-4 px-8 rounded-lg bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] hover:text-white transition font-bold text-sm shadow"
              >
                Take the 2-minute readiness assessment
              </Link>
              <button 
                onClick={handleScrollToExplorer}
                className="py-4 px-8 rounded-lg border border-[#14161A]/14 text-[#14161A] hover:bg-[#ECE5D6] hover:border-[#14161A]/30 transition font-bold text-sm"
              >
                See how it works
              </button>
            </div>
            <div className="mt-10 pb-12 text-xs text-[#73706A] tracking-wide font-sans-brand">
              <b>Aligned to</b> NIST AI RMF <span className="mx-1.5 text-[#14161A]/10">·</span> EU AI Act <span class="mx-1.5 text-[#14161A]/10">·</span> ISO 42001 <span class="mx-1.5 text-[#14161A]/10">·</span> HIPAA <span class="mx-1.5 text-[#14161A]/10">·</span> SOC 2
            </div>
          </div>

          {/* Hero Sample Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="report">
              <div className="report-head">AI Readiness Report</div>
              <div className="report-org">ACME Corporation</div>
              <div className="report-sub">Prepared for the Board · Jane Okafor, Chief Risk Officer</div>
              <div className="score-row">
                <div className="score-ring">
                  <svg viewBox="0 0 92 92">
                    <circle cx="46" cy="46" r="40" fill="none" stroke="#E4DCC9" strokeWidth="7"/>
                    <circle cx="46" cy="46" r="40" fill="none" stroke="#A87C3C" strokeWidth="7" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="161" transform="rotate(-90 46 46)"/>
                  </svg>
                  <div className="num">64</div>
                </div>
                <div className="score-meta">
                  <div className="lvl">Developing</div>
                  <div className="lvl-sub">Moderate readiness · 3 priority gaps</div>
                </div>
              </div>
              <div className="fw-chips">
                <span className="fw-chip">HIPAA</span>
                <span className="fw-chip">GDPR</span>
                <span className="fw-chip">SOC 2</span>
                <span className="fw-chip">ISO 42001</span>
                <span className="fw-chip">EU AI Act</span>
              </div>
              <div className="rec">
                <b>Top recommendation:</b> Establish a formal AI governance committee and an evidence-pack standard before scaling pilots into production decisions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Strip */}
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
                ~$30–40<span className="text-[#7C5723] text-2xl font-sans-brand font-normal">B</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                in enterprise GenAI spend in 2025, with the majority seeing no measurable return.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">Source: MIT Project NANDA — The GenAI Divide (2025)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Why CertaintyAI</span>
          <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
            Ontology as an explicit, deployable layer.
          </h2>
          <p className="text-sm text-[#3B3D42] mt-3">
            We treat vocabulary and logic constraints as a real middleware layer between databases and agent prompts, bypass high-risk database migrations, and yield explainable outcomes.
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

      {/* Industries Section */}
      <section id="explorer" className="border-t border-[#14161A]/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Industries &amp; Domains</span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Pre-built models for regulated sectors.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3">
              Deploy in weeks rather than months. Choose your sector below to see the pre-loaded standards and entities.
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
                  <div className="text-3xl mb-4">{ind.emoji}</div>
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

      {/* Frameworks Wall */}
      <section className="border-t border-[#14161A]/10 py-20 bg-[#ECE5D6]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Auditable Compliance</span>
              <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
                Aligned to audit frameworks.
              </h2>
              <p className="text-sm text-[#3B3D42] mt-3">
                Pre-mapped to over twenty global privacy, healthcare, cybersecurity, and public policy rules, tailored dynamically during your readiness assessment.
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

      {/* Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-[#14161A] text-[#F4F0E6] rounded-3xl p-10 sm:p-12 text-center relative overflow-hidden isolate shadow-2xl">
          <div aria-hidden className="absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(500px_260px_at_50%_120%,rgba(168,124,60,0.3),transparent)]" />
          <h2 className="font-serif-brand text-3xl sm:text-4xl font-normal leading-tight mb-4">
            Defensive enterprise AI in two minutes.
          </h2>
          <p className="text-sm text-[#F4F0E6]/78 max-w-xl mx-auto mb-8 leading-relaxed">
            Answer a short, role-tailored assessment to get a board-ready report on your gaps, scores, and target payback period.
          </p>
          <Link 
            to="/survey" 
            className="inline-block py-3.5 px-8 rounded-lg bg-[#F4F0E6] text-[#14161A] font-bold text-sm hover:bg-[#D8B679] hover:text-[#14161A] transition shadow"
          >
            Start your free assessment
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
