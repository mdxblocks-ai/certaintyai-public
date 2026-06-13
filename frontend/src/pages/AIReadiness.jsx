import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import MaturityProgression from '../components/MaturityProgression'
import ExecutiveEngagement from '../components/ExecutiveEngagement'
import { BRAND, CTA } from '../lib/branding'

const ROLE_OUTCOMES = [
  {
    role: 'CEO',
    pain: 'Are we ahead or behind on AI?',
    outcome: 'A single board-defensible answer — score, tier, and three boardroom decisions you can quote in your next 8-K letter.',
    accent: '#14161A',
  },
  {
    role: 'CFO',
    pain: 'Where is the AI spend leaking?',
    outcome: 'A 90-day value roadmap with cost-of-inaction figures and the 3 decisions that pay back within two quarters.',
    accent: '#3A7E92',
  },
  {
    role: 'CIO',
    pain: 'What do I do next quarter?',
    outcome: 'A prioritized roadmap mapped to NIST AI RMF GOVERN and MEASURE sub-scores — sequenced for IT delivery.',
    accent: '#A87C3C',
  },
  {
    role: 'CTO',
    pain: 'Where will our AI runtime break under audit?',
    outcome: 'Architecture gap analysis across semantic alignment, RAG accuracy, audit provenance, and data maturity.',
    accent: '#C77A57',
  },
  {
    role: 'CISO',
    pain: 'What is the AI risk surface I cannot see?',
    outcome: 'Vendor, model, prompt, and policy gap inventory — pre-mapped to ISO 27001, SOC 2, and EU AI Act.',
    accent: '#2F7D6B',
  },
  {
    role: 'Board Member',
    pain: 'What should we approve, investigate, or defer?',
    outcome: 'Three Boardroom Decisions framed in dollars, risk, and time — with a peer benchmark for your sector.',
    accent: '#A8506A',
  },
]

const FLOW_STEPS = [
  {
    n: '01',
    title: 'Quick intake',
    blurb: 'Sector, role, and organization name. About 30 seconds. No account required.',
    duration: '~30s',
  },
  {
    n: '02',
    title: 'Tailored questions',
    blurb: 'Five questions that adapt to your role — CFO sees finance lens, CISO sees risk lens.',
    duration: '~90s',
  },
  {
    n: '03',
    title: 'Deterministic scoring',
    blurb: 'Your score is computed by a test-gated math engine. Same inputs always produce the same auditable result.',
    duration: 'instant',
  },
  {
    n: '04',
    title: 'Generative insights',
    blurb: 'Gemini, on Vertex AI, explains the result in your role’s language. Every claim cites the data behind it.',
    duration: '~10s',
  },
  {
    n: '05',
    title: 'Board-ready report',
    blurb: 'Print-ready PDF — executive scorecard, NIST sub-scores, frameworks, gaps, recommendations, peer benchmark.',
    duration: 'instant',
  },
]

const OPERATIONALIZATION_PHASES = [
  {
    phase: 'Experimentation',
    sub: 'You are here if…',
    accent: '#A87C3C',
    glow: 'rgba(168,124,60,0.18)',
    symptoms: [
      'Many disconnected pilots, no shared vocabulary',
      'Every team picks its own model and toolchain',
      'No common audit trail across initiatives',
    ],
    gap: 'No way to compare pilots, no defensible story to the board.',
    assessment_role: 'Surfaces the fragmentation — and quantifies the cost of staying here.',
  },
  {
    phase: 'Validation',
    sub: 'You move here when…',
    accent: '#D8B061',
    glow: 'rgba(216,176,97,0.22)',
    symptoms: [
      'Pilots gain explicit governance owners',
      'Each output cites the data and rule behind it',
      'A formal review committee meets at a cadence',
    ],
    gap: 'You can defend any single AI decision. You cannot yet defend the system end-to-end.',
    assessment_role: 'Pinpoints which sub-scores must move first to unlock the next tier.',
  },
  {
    phase: 'Operationalization',
    sub: 'You are here when…',
    accent: '#2F7D6B',
    glow: 'rgba(47,125,107,0.18)',
    symptoms: [
      'Agents run under continuously enforced policy',
      'Outcomes feed back into the ontology layer',
      'AI Control Tower is the single pane of glass',
    ],
    gap: 'You compound value with every new agent. Your audit is a click, not a project.',
    assessment_role: 'Becomes a quarterly readout your CFO and CISO both quote — not a one-time exercise.',
  },
]

const FAQS = [
  {
    q: 'Do I have to take the assessment?',
    a: 'No. The AI Readiness Assessment is an optional first door. You can explore the Open Architecture, browse Domain Copilots, or start with Agent Builder instead.',
  },
  {
    q: 'Is the assessment anonymous?',
    a: 'Yes. The wizard accepts an anonymous token. You can claim a report later by signing up with the same email — your assessment auto-attaches to the account.',
  },
  {
    q: 'How long does it take?',
    a: 'Roughly two minutes end-to-end. Five role-tailored questions, plus an optional company-info screen for the report header.',
  },
  {
    q: 'Where does my data go?',
    a: 'Your answers are stored against an anonymous token until you choose to sign up. Scoring runs deterministically; explanations run on Gemini via Vertex AI under a Google Cloud service account — never with API keys committed to source.',
  },
  {
    q: 'Will I be sold to?',
    a: 'No. The only follow-up is the report itself. The tertiary “Talk to an AI Advisor” path is opt-in.',
  },
]


function SampleReport() {
  const subScores = [
    { label: 'Semantic Alignment', value: 50, color: '#A87C3C' },
    { label: 'RAG Accuracy',        value: 70, color: '#2F7D6B' },
    { label: 'Audit & Provenance',  value: 50, color: '#3A7E92' },
    { label: 'Governance Oversight', value: 50, color: '#A8506A' },
    { label: 'Data Maturity',       value: 60, color: '#D8B061' },
  ]
  const nistScores = [
    { label: 'GOVERN',  value: 50 },
    { label: 'MEASURE', value: 70 },
  ]
  const decisions = [
    { decision: 'Approve', text: 'Pilot CISO Vendor Risk Triage copilot — 90-day scope, two seats.' },
    { decision: 'Investigate', text: 'Semantic alignment across 6 systems — ontology layer feasibility.' },
    { decision: 'Defer', text: 'Production agent deployment until oversight committee chartered.' },
  ]
  return (
    <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-[#1E3A36] text-[#F4F0E6] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#D8B679] font-semibold">
            AI Readiness Report · Sample
          </div>
          <div className="font-serif-brand text-lg leading-tight mt-1">
            Atlas Regional Health · prepared 13 Jun 2026
          </div>
        </div>
        <div className="text-right text-[10.5px] text-[#F4F0E6]/75 leading-snug">
          <div>Healthcare &amp; Life Sciences</div>
          <div>For: Jane Okafor, Chief Risk Officer</div>
        </div>
      </div>

      <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-5 flex flex-col items-center text-center bg-[#F4F0E6] border border-[#14161A]/10 rounded-xl p-5">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E4DCC9" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#A87C3C"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - 0.64)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-serif-brand text-5xl text-[#14161A] leading-none">64</div>
              <div className="text-[10px] uppercase tracking-widest text-[#73706A] mt-1">/ 100</div>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8B061]/22 border border-[#D8B061]/55 text-[#7C5723] text-[11px] uppercase tracking-wider font-bold">
            Piloting · Moderate Readiness
          </div>
          <div className="text-[12px] text-[#3B3D42] mt-3 leading-snug max-w-xs">
            You sit above the healthcare peer median (52) but behind the top quartile (74). Three priority gaps drive the shortfall.
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-5">

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#7C5723] font-semibold mb-2">
              Sub-scores · CertaintyAI five-dimension model
            </div>
            <div className="space-y-2">
              {subScores.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="text-[11.5px] text-[#3B3D42] w-40 shrink-0">{s.label}</div>
                  <div className="flex-1 h-2 rounded-full bg-[#14161A]/8 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.value}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <div className="text-[11.5px] font-bold text-[#14161A] w-8 text-right">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {nistScores.map((n) => (
              <div key={n.label} className="bg-[#F4F0E6] border border-[#14161A]/10 rounded-lg p-3">
                <div className="text-[9.5px] uppercase tracking-widest text-[#73706A] font-bold">NIST AI RMF</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif-brand text-2xl text-[#14161A]">{n.value}</span>
                  <span className="text-[10.5px] text-[#73706A]">{n.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#7C5723] font-semibold mb-2">
              Frameworks applied
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['HIPAA', 'ISO 42001', 'EU AI Act', 'NIST AI RMF', 'SOC 2', 'HITECH'].map((f) => (
                <span
                  key={f}
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md border border-[#14161A]/10 text-[#3B3D42] bg-[#F4F0E6]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="px-6 sm:px-7 pb-7">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#7C5723] font-semibold mb-3">
          Three Boardroom Decisions
        </div>
        <div className="space-y-2">
          {decisions.map((d) => (
            <div
              key={d.decision}
              className="bg-[#F4F0E6] border border-[#14161A]/10 rounded-lg px-4 py-3 flex items-start gap-3"
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                style={{
                  backgroundColor:
                    d.decision === 'Approve' ? '#2F7D6B' :
                    d.decision === 'Investigate' ? '#A87C3C' : '#3B3D42',
                  color: '#F4F0E6',
                }}
              >
                {d.decision}
              </span>
              <span className="text-[12.5px] text-[#3B3D42] leading-snug">{d.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-[#14161A]/10 flex items-center justify-between flex-wrap gap-3">
          <div className="text-[10.5px] text-[#73706A] italic">
            Sample report — generated from anonymized inputs. Your live report will use your answers.
          </div>
          <div className="text-[10.5px] uppercase tracking-widest text-[#A87C3C] font-bold">
            Defensible by design
          </div>
        </div>
      </div>
    </div>
  )
}


function ExecutiveQuestionPanel() {
  const [openIdx, setOpenIdx] = useState(-1)

  const Q1Content = (
    <div className="space-y-3">
      <div className="text-[10.5px] uppercase tracking-widest text-[#73706A] font-bold">
        Show current maturity
      </div>
      {[
        {
          name: 'Foundational',
          accent: '#A87C3C',
          bullets: ['Disconnected AI experiments', 'Limited governance', 'Limited business visibility'],
        },
        {
          name: 'Piloting',
          accent: '#D8B061',
          bullets: ['Initial copilots', 'Governance emerging', 'Business value tracking beginning'],
        },
        {
          name: 'Scale',
          accent: '#2F7D6B',
          bullets: ['Enterprise AI platform', 'AI Control Tower', 'Continuous governance'],
        },
      ].map((tier) => (
        <div
          key={tier.name}
          className="bg-[#F4F0E6] border border-[#14161A]/8 rounded-lg p-3"
          style={{ borderLeft: `3px solid ${tier.accent}` }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: tier.accent }}
              aria-hidden
            />
            <span className="font-serif-brand text-[13px] font-semibold text-[#14161A] leading-none">
              {tier.name}
            </span>
          </div>
          <ul className="space-y-0.5 ml-3.5">
            {tier.bullets.map((b) => (
              <li key={b} className="text-[11.5px] text-[#3B3D42] leading-snug">
                • {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="text-[11.5px] text-[#7C5723] italic leading-relaxed pt-1">
        Your assessment identifies your current stage.
      </div>
    </div>
  )

  const SimpleBullets = ({ lead, bullets }) => (
    <div>
      <div className="text-[12px] text-[#3B3D42] mb-2.5 leading-snug">{lead}</div>
      <ul className="space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12px] text-[#3B3D42] leading-snug">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-[#A87C3C] shrink-0" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const Q2Content = (
    <SimpleBullets
      lead="Most organizations struggle because:"
      bullets={[
        'AI experimentation is fragmented',
        'Governance is incomplete',
        'Business value is difficult to measure',
        'Risk visibility is limited',
      ]}
    />
  )

  const Q3Content = (
    <SimpleBullets
      lead="The assessment provides:"
      bullets={[
        'Current maturity score',
        'Gap analysis',
        'Prioritized recommendations',
        '90-day roadmap',
      ]}
    />
  )

  const Q4Content = (
    <div className="space-y-2">
      {[
        { role: 'CEO',  accent: '#14161A', items: ['Faster AI adoption'] },
        { role: 'CFO',  accent: '#3A7E92', items: ['Cost optimization', 'Audit readiness'] },
        { role: 'CIO',  accent: '#A87C3C', items: ['Governance visibility'] },
        { role: 'CISO', accent: '#2F7D6B', items: ['Risk reduction'] },
      ].map((r) => (
        <div
          key={r.role}
          className="bg-[#F4F0E6] border border-[#14161A]/8 rounded-lg px-3 py-2.5 flex items-start gap-3"
        >
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md text-[#FBF8F0] shrink-0 mt-0.5"
            style={{ backgroundColor: r.accent }}
          >
            {r.role}
          </span>
          <ul className="space-y-0.5 flex-1 min-w-0">
            {r.items.map((it) => (
              <li key={it} className="text-[12px] text-[#3B3D42] leading-snug">
                • {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )

  const Q5Content = (
    <div className="space-y-2">
      {['Experimentation', 'Validation', 'Operationalization'].map((stage, i, arr) => (
        <React.Fragment key={stage}>
          <div
            className="bg-[#F4F0E6] border border-[#14161A]/8 rounded-lg px-3 py-2 text-center"
            style={{
              borderLeft: `3px solid ${
                i === 0 ? '#A87C3C' : i === 1 ? '#D8B061' : '#2F7D6B'
              }`,
            }}
          >
            <span className="font-serif-brand text-[13.5px] font-semibold text-[#14161A]">
              {stage}
            </span>
          </div>
          {i < arr.length - 1 && (
            <div className="flex justify-center text-[#A87C3C] select-none" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="5 12 12 19 19 12" />
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
      <div className="text-[11.5px] text-[#7C5723] italic leading-relaxed pt-2">
        The assessment identifies the shortest path to your next stage.
      </div>
    </div>
  )

  const QUESTIONS = [
    {
      n: '01',
      q: 'Where am I today?',
      preview: { label: 'Current maturity stages:', value: 'Foundational • Piloting • Scale' },
      body: Q1Content,
    },
    { n: '02', q: 'Why am I here?', body: Q2Content },
    { n: '03', q: 'What should I do next?', body: Q3Content },
    { n: '04', q: 'What business value will I gain?', body: Q4Content },
    { n: '05', q: 'How do I move from AI experimentation to AI operationalization?', body: Q5Content },
  ]

  return (
    <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[#7C5723] font-semibold mb-4">
        The five executive questions
      </div>

      <div className="space-y-2">
        {QUESTIONS.map((qd, i) => {
          const isOpen = openIdx === i
          const panelId = `eq-panel-${qd.n}`
          const headerId = `eq-header-${qd.n}`
          return (
            <div
              key={qd.n}
              className={`border rounded-lg overflow-hidden transition-colors duration-200 ${
                isOpen
                  ? 'border-[#A87C3C]/45 bg-[#F4F0E6]/55'
                  : 'border-[#14161A]/10 bg-[#F4F0E6]/25 hover:bg-[#F4F0E6]/45'
              }`}
            >
              <h3 className="m-0">
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A87C3C]/55 rounded-lg"
                >
                  <span
                    className={`font-serif-brand text-base w-6 shrink-0 leading-snug transition-colors duration-200 ${
                      isOpen ? 'text-[#7C5723]' : 'text-[#A87C3C]'
                    }`}
                  >
                    {qd.n}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-[13.5px] leading-snug font-medium transition-colors duration-200 ${
                        isOpen ? 'text-[#14161A]' : 'text-[#14161A]/90'
                      }`}
                    >
                      {qd.q}
                    </span>
                    {qd.preview && !isOpen && (
                      <span className="block mt-1 text-[11px] text-[#73706A] leading-snug">
                        {qd.preview.label}{' '}
                        <span className="text-[#3B3D42]">{qd.preview.value}</span>
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden
                    className={`text-[#A87C3C] text-lg leading-none shrink-0 transition-transform duration-200 select-none ${
                      isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    +
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                style={{
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="px-4 pb-4 pt-1 border-t border-[#14161A]/8">
                    <div className="pt-3">{qd.body}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-[#14161A]/10 text-[11.5px] text-[#73706A] leading-relaxed">
        Each question is answered with computed data, not opinion. Where a value isn’t computed, your report shows an honest “Not computed.”
      </div>
    </div>
  )
}


export default function AIReadiness() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prev = document.title
      document.title = `AI Readiness Assessment · ${BRAND.name}`
      return () => { document.title = prev }
    }
  }, [])

  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">

      {/* ===== Hero ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7C5723] uppercase">
              <span className="w-6 h-px bg-[#A87C3C]" />
              AI Readiness · Optional first step
            </div>
            <h1 className="font-serif-brand text-5xl sm:text-6xl font-normal leading-[1.04] tracking-tight mt-6 text-[#14161A]">
              Where are you on AI today — <em>and what should you do next?</em>
            </h1>
            <p className="text-lg text-[#3B3D42] leading-relaxed mt-6 mb-7 max-w-2xl">
              A two-minute, role-tailored assessment that turns disconnected AI experiments into a board-defensible readiness score, a prioritized 90-day roadmap, and a path to AI operationalization.
            </p>

            {/* Dominant primary CTA — single point of focus */}
            <div className="mt-2">
              <Link
                to="/survey"
                className="inline-flex items-center gap-3 py-5 px-9 rounded-xl bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-base shadow-[0_12px_36px_-10px_rgba(20,22,26,0.45)] hover:shadow-[0_14px_44px_-8px_rgba(124,87,35,0.55)] group"
              >
                <span>Start the 2-minute Assessment</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-[11.5px] text-[#73706A]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FBF8F0] border border-[#14161A]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D6B]" />
                Anonymous
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FBF8F0] border border-[#14161A]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A87C3C]" />
                No account required
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FBF8F0] border border-[#14161A]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8B061]" />
                Deterministic scoring
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ExecutiveQuestionPanel />
          </div>
        </div>
      </section>

      {/* ===== Below-fold secondary exits (low-emphasis link bar) ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-10 -mt-2">
        <div className="text-[12px] text-[#73706A] tracking-wide">
          Or:{' '}
          <a
            href="#sample-report"
            onClick={(e) => { e.preventDefault(); document.getElementById('sample-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
            className="text-[#7C5723] font-bold hover:text-[#14161A] transition"
          >
            see a sample report ↓
          </a>
          <span className="mx-2 text-[#14161A]/20">·</span>
          <Link to={CTA.exploreArchitecture.href} className="text-[#7C5723] font-bold hover:text-[#14161A] transition">
            explore the architecture →
          </Link>
        </div>
      </div>

      {/* ===== Q2: Why am I here? ===== */}
      <section id="why-here" className="border-t border-b border-[#14161A]/10 bg-[#ECE5D6]/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              Why am I here?
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Most AI programs stall on the same three problems.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3">
              Boards are pouring money into AI. Operators are watching pilots die. The gap is governance and readiness, not models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-t border-[#14161A]/10 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#14161A]">
                95<span className="text-[#7C5723] text-2xl font-sans-brand">%</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                of enterprise generative-AI pilots show no measurable P&amp;L impact.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">
                MIT Project NANDA — State of AI in Business 2025
              </div>
            </div>
            <div className="border-t border-[#14161A]/10 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#14161A]">
                60<span className="text-[#7C5723] text-2xl font-sans-brand">%</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                of AI projects lacking AI-ready data will be abandoned through 2026.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">
                Gartner, 2025
              </div>
            </div>
            <div className="border-t border-[#14161A]/10 pt-6">
              <div className="font-serif-brand text-5xl font-normal text-[#14161A]">
                40<span className="text-[#7C5723] text-2xl font-sans-brand">%</span>
              </div>
              <div className="text-sm text-[#3B3D42] mt-2.5">
                of agentic-AI projects forecast canceled by end of 2027 — cost, value, or risk-control gaps.
              </div>
              <div className="text-[10px] text-[#73706A] mt-1.5 italic font-serif-brand">
                Gartner, 2025
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Q1: Where am I today? — Maturity progression ===== */}
      <section id="where-today" className="border-t border-[#14161A]/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              Where am I today?
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              One score. One tier. One honest read of your AI program.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              The assessment lands your program in one of three tiers — the same tiers your CFO and CISO will track quarter to quarter.
            </p>
          </div>

          <MaturityProgression showHeading={false} />
        </div>
      </section>

      {/* ===== Q3: What should I do next? — 5-step flow ===== */}
      <section id="next-steps" className="border-t border-[#14161A]/10 py-20 bg-[#ECE5D6]/15">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              What should I do next?
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Five steps. Two minutes. One audit-ready deliverable.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              The assessment is a five-step, role-tailored flow built on the same deterministic engine that powers production CertaintyAI reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {FLOW_STEPS.map((step) => (
              <article
                key={step.n}
                className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#A87C3C]/55 transition duration-200 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#14161A] text-[#D8B679] flex items-center justify-center font-serif-brand text-sm font-semibold shrink-0"
                    aria-hidden
                  >
                    {step.n}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A87C3C] font-bold">
                    {step.duration}
                  </span>
                </div>
                <h3 className="font-serif-brand text-lg font-semibold text-[#14161A] leading-snug mb-2">
                  {step.title}
                </h3>
                <p className="text-[12.5px] text-[#3B3D42] leading-relaxed">{step.blurb}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[12px] text-[#73706A] leading-relaxed max-w-2xl">
              The scoring engine is held under a strict change-firewall and verified zero-diff at every checkpoint — <i>same inputs always produce the same auditable score.</i>
            </div>
            <Link
              to="/survey"
              className="py-3 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-sm shadow"
            >
              Start now →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Q4: What business value will I gain? — Role-specific cards ===== */}
      <section id="business-value" className="border-t border-[#14161A]/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              What business value will I gain?
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              An answer in your role’s language.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              Same deterministic findings — six executive lenses. Insights are framed for the reader the report is for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {ROLE_OUTCOMES.map((r) => (
              <article
                key={r.role}
                className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden"
                style={{ borderTop: `3px solid ${r.accent}` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#FBF8F0] font-serif-brand text-sm font-semibold"
                    style={{ backgroundColor: r.accent }}
                    aria-hidden
                  >
                    {r.role.charAt(0)}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#73706A]">
                    {r.role}
                  </div>
                </div>
                <h3 className="font-serif-brand text-base text-[#14161A] font-semibold leading-snug mb-2">
                  “{r.pain}”
                </h3>
                <p className="text-[12.5px] text-[#3B3D42] leading-relaxed">
                  {r.outcome}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sample report ===== */}
      <section id="sample-report" className="border-t border-[#14161A]/10 py-20 bg-[#1E3A36]/4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#A87C3C] uppercase block mb-3">
              Sample report preview
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              What lands in your inbox.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              An anonymized example of the report the assessment produces — executive scorecard, NIST sub-scores, frameworks, three boardroom decisions, peer benchmark.
            </p>
          </div>

          <SampleReport />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[12px] text-[#73706A] leading-relaxed max-w-2xl">
              Live reports are also generated as print-ready, McKinsey-style PDFs you can attach to a board pack.
            </div>
            <Link
              to="/survey"
              className="py-3 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-sm shadow"
            >
              Generate your own report →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Q5: How does CertaintyAI move me from experimentation to operationalization? ===== */}
      <section id="operationalization" className="border-t border-[#14161A]/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              How CertaintyAI moves you forward
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              From AI experimentation to AI operationalization.
            </h2>
            <p className="text-sm text-[#3B3D42] mt-3 max-w-2xl">
              The assessment is the entry point. The open architecture is what gets you from one phase to the next without re-platforming.
            </p>
          </div>

          <div className="space-y-5">
            {OPERATIONALIZATION_PHASES.map((p, i) => (
              <article
                key={p.phase}
                className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-7 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden"
                style={{ borderLeft: `4px solid ${p.accent}` }}
              >
                <div
                  aria-hidden
                  className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-50 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` }}
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                  <div className="md:col-span-3">
                    <div
                      className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase mb-2"
                      style={{ color: p.accent }}
                    >
                      <span className="w-5 h-px" style={{ backgroundColor: p.accent }} />
                      Phase 0{i + 1}
                    </div>
                    <h3 className="font-serif-brand text-2xl text-[#14161A] font-normal leading-tight">
                      {p.phase}
                    </h3>
                    <div className="text-[11px] text-[#73706A] mt-1 italic">{p.sub}</div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold mb-2">Symptoms</div>
                    <ul className="space-y-1.5">
                      {p.symptoms.map((s) => (
                        <li key={s} className="flex gap-2 text-[12.5px] text-[#3B3D42] leading-snug">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.accent }} />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-4">
                    <div className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold mb-2">Gap to next phase</div>
                    <p className="text-[12.5px] text-[#3B3D42] leading-relaxed mb-3">{p.gap}</p>
                    <div className="text-[10px] uppercase tracking-widest text-[#A87C3C] font-bold mb-1">Role of the assessment</div>
                    <p className="text-[12.5px] text-[#3B3D42] leading-relaxed italic">{p.assessment_role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[12px] text-[#73706A] leading-relaxed max-w-2xl">
              The same open architecture carries you from Experimentation to Operationalization. The assessment quantifies where you are and what to move first.
            </div>
            <div className="flex gap-3">
              <Link
                to="/copilots"
                className="py-3 px-5 rounded-lg border border-[#14161A]/16 text-[#14161A] hover:bg-[#ECE5D6] hover:border-[#14161A]/30 transition font-bold text-sm"
              >
                See Domain Copilots
              </Link>
              <Link
                to="/architecture"
                className="py-3 px-5 rounded-lg border border-[#14161A]/16 text-[#14161A] hover:bg-[#ECE5D6] hover:border-[#14161A]/30 transition font-bold text-sm"
              >
                Tour the Architecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ / Honesty notes ===== */}
      <section id="faq" className="border-t border-[#14161A]/10 py-20 bg-[#ECE5D6]/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
              The honesty notes
            </span>
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
              Questions everyone asks before they click.
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group bg-[#FBF8F0] border border-[#14161A]/10 rounded-xl px-5 py-4 hover:border-[#A87C3C]/45 transition"
              >
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <span className="font-serif-brand text-base text-[#14161A] font-semibold leading-snug">{f.q}</span>
                  <span className="text-[#A87C3C] text-xl leading-none mt-0.5 group-open:rotate-45 transition-transform select-none" aria-hidden>+</span>
                </summary>
                <p className="text-[13px] text-[#3B3D42] leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Executive Engagement (reused) ===== */}
      <ExecutiveEngagement
        heading="Start with the assessment, or skip it."
        description="The AI Readiness Assessment is optional — by design. Start with the two-minute wizard, explore the domain copilots, or speak with an advisor first. There is no wrong door."
      />

      <Footer />
    </div>
  )
}
