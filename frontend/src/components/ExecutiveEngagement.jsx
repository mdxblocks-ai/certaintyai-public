import React from 'react'
import { Link } from 'react-router-dom'

const PROOFS = [
  'Establish governance',
  'Connect enterprise knowledge',
  'Deploy domain copilots',
  'Operationalize with confidence',
]

export default function ExecutiveEngagement({
  heading = 'Ready to operationalize AI?',
  description = 'Whether you are exploring AI, running pilots, or scaling enterprise AI, CertaintyAI helps organizations establish governance, connect enterprise knowledge, deploy domain copilots, and operationalize AI with confidence.',
  primary = { label: 'Start AI Readiness Assessment', href: '/survey' },
  secondary = { label: 'Explore Domain AI Copilots', href: '/copilots' },
  tertiary = { label: 'Talk to an AI Advisor', href: '/signup' },
}) {
  return (
    <section id="executive-engagement" className="max-w-7xl mx-auto px-6 py-20">
      <div className="relative bg-[#1E3A36] text-[#F4F0E6] rounded-3xl p-10 sm:p-14 shadow-2xl overflow-hidden isolate">

        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(620px_320px_at_50%_120%,rgba(216,182,121,0.28),transparent)]"
        />
        <div
          aria-hidden
          className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,124,60,0.55) 0%, transparent 70%)' }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">

          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase mb-5">
              <span className="w-6 h-px bg-[#D8B679]" />
              Executive Engagement
            </div>

            <h2 className="font-serif-brand text-4xl sm:text-5xl font-normal leading-[1.05] tracking-tight mb-6">
              {heading}
            </h2>

            <p className="text-base sm:text-lg text-[#F4F0E6]/85 leading-relaxed max-w-2xl">
              {description}
            </p>

            <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 max-w-2xl">
              {PROOFS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[13px] text-[#F4F0E6]/90 leading-snug">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mt-0.5 text-[#D8B679] shrink-0"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3 w-full">
            <Link
              to={primary.href}
              className="inline-flex items-center justify-between gap-3 py-4 px-6 rounded-xl bg-[#D8B679] text-[#1E3A36] hover:bg-[#F4F0E6] transition font-bold text-sm shadow-lg shadow-black/20"
            >
              <span>{primary.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <Link
              to={secondary.href}
              className="inline-flex items-center justify-between gap-3 py-4 px-6 rounded-xl bg-[#F4F0E6]/8 border border-[#F4F0E6]/25 text-[#F4F0E6] hover:bg-[#F4F0E6]/15 hover:border-[#F4F0E6]/45 transition font-bold text-sm"
            >
              <span>{secondary.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <Link
              to={tertiary.href}
              className="inline-flex items-center justify-between gap-3 py-4 px-6 rounded-xl text-[#D8B679] hover:text-[#F4F0E6] transition font-bold text-sm"
            >
              <span>{tertiary.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <div className="mt-2 text-[11px] text-[#F4F0E6]/55 leading-relaxed tracking-wide">
              No demo data. No credit card. The Readiness assessment is anonymous; copilots and advisor sessions require an account.
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
