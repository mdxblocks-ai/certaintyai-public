import React from 'react'

const DEFAULT_STAGES = [
  {
    name: 'Foundational',
    range: '0 – 39',
    tone: 'bg-[#FBF8F0] border-[#A87C3C]/35',
    badgeBg: '#A87C3C',
    badgeText: '#FBF8F0',
    eyebrowColor: 'text-[#7C5723]',
    bullets: ['No governance', 'Disconnected data', 'Experimental AI'],
  },
  {
    name: 'Piloting',
    range: '40 – 74',
    tone: 'bg-[#FBF8F0] border-[#D8B061]/55',
    badgeBg: '#D8B061',
    badgeText: '#1E3A36',
    eyebrowColor: 'text-[#7C5723]',
    bullets: ['Initial copilots', 'Governance controls', 'Business validation'],
  },
  {
    name: 'Scale',
    range: '75 – 100',
    tone: 'bg-[#1E3A36] border-[#1E3A36]/60 text-[#F4F0E6]',
    badgeBg: '#D8B679',
    badgeText: '#1E3A36',
    eyebrowColor: 'text-[#D8B679]',
    bullets: ['Enterprise AI platform', 'AI Control Tower', 'Continuous governance'],
    dark: true,
  },
]

export default function MaturityProgression({
  stages = DEFAULT_STAGES,
  showHeading = true,
  eyebrow = 'Maturity Progression',
  heading = 'Foundational → Piloting → Scale.',
  description = 'The same three-tier model your AI Readiness score lands in — and the same three tiers your board will track quarter to quarter.',
  showFineprint = true,
}) {
  return (
    <div>
      {showHeading && (
        <div className="max-w-3xl mb-10">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#A87C3C] uppercase block mb-3">
            {eyebrow}
          </span>
          <h3 className="font-serif-brand text-2xl sm:text-3xl text-[#14161A] font-normal leading-tight">
            {heading}
          </h3>
          {description && (
            <p className="text-sm text-[#3B3D42] mt-3">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {stages.map((stage, i, arr) => (
          <React.Fragment key={stage.name}>
            <article
              className={`flex-1 border rounded-2xl p-6 shadow-sm transition duration-200 hover:shadow-md ${stage.tone}`}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className={`text-[10px] font-bold tracking-[0.22em] uppercase ${stage.eyebrowColor}`}>
                  Stage {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: stage.badgeBg, color: stage.badgeText }}
                >
                  {stage.range}
                </span>
              </div>
              <h4
                className={`font-serif-brand text-2xl font-semibold leading-tight mb-4 ${
                  stage.dark ? 'text-[#F4F0E6]' : 'text-[#14161A]'
                }`}
              >
                {stage.name}
              </h4>
              <ul className="space-y-2">
                {stage.bullets.map((b) => (
                  <li
                    key={b}
                    className={`flex items-start gap-2 text-[13px] leading-snug ${
                      stage.dark ? 'text-[#F4F0E6]/88' : 'text-[#3B3D42]'
                    }`}
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.badgeBg }}
                      aria-hidden
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>

            {i < arr.length - 1 && (
              <div className="flex items-center justify-center text-[#A87C3C] shrink-0 select-none" aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 md:hidden"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="5 12 12 19 19 12" />
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="hidden md:block w-6 h-6"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {showFineprint && (
        <div className="mt-8 text-[12px] text-[#73706A] tracking-wide">
          <b className="uppercase tracking-widest text-[#14161A]/70">Tier bands</b>
          <span className="mx-2 text-[#14161A]/20">·</span>
          Foundational <span className="text-[#14161A]/30">0–39</span>
          <span className="mx-2 text-[#14161A]/20">·</span>
          Piloting <span className="text-[#14161A]/30">40–74</span>
          <span className="mx-2 text-[#14161A]/20">·</span>
          Scale <span className="text-[#14161A]/30">75–100</span>
          <span className="mx-2 text-[#14161A]/20">·</span>
          <i>Matches the deterministic AI Readiness scoring engine.</i>
        </div>
      )}
    </div>
  )
}
