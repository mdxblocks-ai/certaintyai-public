import React from 'react'

const STYLES = {
  // ----- New MDxBlocks dark-theme variants -----
  available: {
    label: 'Available Today',
    cls: 'bg-gradient-to-r from-[#D8B679]/18 via-[#2F7D6B]/14 to-[#D8B679]/18 text-[#D8B679] border-[#D8B679]/45 shadow-[0_0_12px_-4px_rgba(216,182,121,0.55)]',
  },
  pilot: {
    label: 'Pilot Available',
    cls: 'bg-gradient-to-r from-[#E08443]/18 to-[#C77A57]/18 text-[#E0A47C] border-[#E08443]/40 shadow-[0_0_10px_-4px_rgba(224,132,67,0.45)]',
  },
  'coming-soon': {
    label: 'Coming Soon',
    cls: 'bg-[#3A7E92]/18 text-[#8FB4C4] border-[#3A7E92]/40',
  },
  // ----- Legacy variants (kept for backwards compat) -----
  live: {
    label: 'Live',
    cls: 'bg-[#1E3A36]/10 text-[#1E3A36] border-[#1E3A36]/25',
  },
  beta: {
    label: 'Beta',
    cls: 'bg-[#A87C3C]/12 text-[#7C5723] border-[#A87C3C]/35',
  },
  roadmap: {
    label: 'Roadmap',
    cls: 'bg-[#14161A]/5 text-[#3B3D42] border-[#14161A]/15',
  },
}

export default function StatusChip({ status = 'live', label, className = '' }) {
  const s = STYLES[status] || STYLES.live
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${s.cls} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label || s.label}
    </span>
  )
}
