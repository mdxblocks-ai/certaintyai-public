import React from 'react'
import { Link } from 'react-router-dom'
import StatusChip, { normalizeStatus } from './StatusChip'

const DOMAIN_ICONS = {
  healthcare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
  cybersecurity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  'ai-advisory': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  ),
}

export default function CopilotCard({ copilot, domain }) {
  const icon = DOMAIN_ICONS[copilot.domain]
  const canonical = normalizeStatus(copilot.status)

  // Per-status CTA. Only ready-for-demo shows an actionable "Request Demo →"
  // link. The other two show a non-interactive status indicator with a tooltip.
  const ctaByStatus = {
    'ready-for-demo': {
      kind: 'link',
      label: 'Request Demo',
      href: '/signup?intent=demo',
      color: '#047857',
    },
    'working-in-progress': {
      kind: 'text',
      label: 'Coming Soon',
      tooltip: 'Currently under development',
      color: '#B45309',
    },
    'on-roadmap': {
      kind: 'text',
      label: 'Roadmap',
      tooltip: 'Planned future capability',
      color: '#1E40AF',
    },
  }
  const cta = ctaByStatus[canonical]

  return (
    <article
      className="relative bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-7 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col"
      style={{ borderTop: `3px solid ${domain.accent}` }}
    >
      <div
        aria-hidden
        className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${domain.glow} 0%, transparent 70%)` }}
      />

      <header className="flex items-start justify-between gap-3 mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#FBF8F0]"
            style={{ backgroundColor: domain.accent }}
            aria-hidden
          >
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-[#73706A]">
              {copilot.subdomainName || domain.name}
            </div>
            <div className="text-[10px] text-[#73706A] mt-0.5">{copilot.persona}</div>
          </div>
        </div>
        <StatusChip status={canonical} />
      </header>

      <h3 className="font-serif-brand text-xl text-[#14161A] font-semibold leading-snug mb-2">
        {copilot.name}
      </h3>
      <p className="text-[13px] text-[#3B3D42] leading-relaxed mb-5">
        {copilot.tagline}
      </p>

      <ul className="space-y-1.5 mb-5 text-[12.5px] text-[#3B3D42]">
        {copilot.capabilities.map((c) => (
          <li key={c} className="flex gap-2 leading-snug">
            <span
              className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: domain.accent }}
              aria-hidden
            />
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {copilot.frameworks.map((f) => (
          <span
            key={f}
            className="text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded-md border border-[#14161A]/10 text-[#3B3D42] bg-[#F4F0E6]"
          >
            {f}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#14161A]/8 pt-4">
        <span className="text-[10.5px] uppercase tracking-widest text-[#73706A] font-semibold">
          Defensible by design
        </span>
        {cta && cta.kind === 'link' && (
          <Link
            to={cta.href}
            className="text-[12.5px] font-bold transition hover:translate-x-0.5"
            style={{ color: cta.color }}
          >
            {cta.label} →
          </Link>
        )}
        {cta && cta.kind === 'text' && (
          <span
            className="text-[12.5px] font-bold opacity-80 cursor-default"
            style={{ color: cta.color }}
            title={cta.tooltip}
          >
            {cta.label}
          </span>
        )}
      </div>
    </article>
  )
}
