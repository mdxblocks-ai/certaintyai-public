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
      <div
        className="relative bg-[#0A0A0E] text-[#F4F0E6] rounded-3xl p-10 sm:p-14 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden isolate border border-[#D8B679]/15"
        style={{
          backgroundImage:
            'radial-gradient(900px 420px at 0% 0%, rgba(216,182,121,0.10), transparent 65%), radial-gradient(700px 340px at 100% 100%, rgba(224,132,67,0.12), transparent 65%)',
        }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(216,182,121,0.55) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-28 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(224,132,67,0.55) 0%, transparent 70%)' }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">

          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-[#D8B679] uppercase mb-5">
              <span className="w-6 h-px bg-gradient-to-r from-[#D8B679] to-transparent" />
              Executive Engagement
            </div>

            <h2 className="font-serif-brand text-4xl sm:text-5xl font-normal leading-[1.05] tracking-tight mb-6">
              {heading.split(' ').map((word, i, arr) => {
                const isLast = i === arr.length - 1
                if (isLast) {
                  return (
                    <span key={i}>
                      {' '}
                      <span className="bg-gradient-to-r from-[#F0CE8C] via-[#D8B679] to-[#E08443] bg-clip-text text-transparent">
                        {word}
                      </span>
                    </span>
                  )
                }
                return i === 0 ? word : ` ${word}`
              })}
            </h2>

            <p className="text-base sm:text-lg text-[#F4F0E6]/75 leading-relaxed max-w-2xl">
              {description}
            </p>

            <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 max-w-2xl">
              {PROOFS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[13px] text-[#F4F0E6]/85 leading-snug">
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
              className="inline-flex items-center justify-between gap-3 py-4 px-6 rounded-xl bg-gradient-to-br from-[#F0CE8C] via-[#D8B679] to-[#A87C3C] text-[#0A0A0E] hover:from-[#F4D89A] hover:via-[#E0BD7C] hover:to-[#B8884C] transition font-bold text-sm shadow-[0_8px_24px_-6px_rgba(216,182,121,0.55)] hover:shadow-[0_8px_28px_-4px_rgba(216,182,121,0.7)]"
            >
              <span>{primary.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <Link
              to={secondary.href}
              className="inline-flex items-center justify-between gap-3 py-4 px-6 rounded-xl bg-gradient-to-br from-[#E08443]/22 to-[#C77A57]/15 border border-[#E08443]/45 text-[#F4F0E6] hover:border-[#E08443]/75 hover:from-[#E08443]/32 hover:to-[#C77A57]/22 transition font-bold text-sm"
            >
              <span>{secondary.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <Link
              to={tertiary.href}
              className="inline-flex items-center justify-between gap-3 py-4 px-6 rounded-xl border border-[#D8B679]/25 text-[#F4F0E6]/85 hover:text-[#F4F0E6] hover:border-[#D8B679]/55 hover:bg-[#D8B679]/8 transition font-bold text-sm"
            >
              <span>{tertiary.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <div className="mt-2 text-[11px] text-[#F4F0E6]/45 leading-relaxed tracking-wide">
              No demo data. No credit card. The Readiness assessment is anonymous; copilots and advisor sessions require an account.
            </div>
          </div>

        </div>

        {/* Powered by attribution */}
        <div className="mt-10 pt-6 border-t border-[#D8B679]/12 flex items-center justify-between relative">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#F4F0E6]/40">
            Powered by <span className="text-[#D8B679] font-semibold">MDxBlocks</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#F4F0E6]/30">
            Defensible AI for regulated industries
          </span>
        </div>
      </div>
    </section>
  )
}
