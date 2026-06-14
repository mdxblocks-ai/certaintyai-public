import React from 'react'

const STYLES = {
  // ----- Phase 2.5 product-status variants -----
  available: {
    label: 'Available Today',
    cls: 'bg-[#10B981]/14 text-[#047857] border-[#10B981]/55 shadow-[0_0_12px_-4px_rgba(16,185,129,0.4)]',
  },
  pilot: {
    label: 'Pilot Available',
    cls: 'bg-[#F59E0B]/14 text-[#B45309] border-[#F59E0B]/55 shadow-[0_0_12px_-4px_rgba(245,158,11,0.4)]',
  },
  'coming-soon': {
    label: 'Coming Soon',
    cls: 'bg-[#64748B]/15 text-[#334155] border-[#64748B]/50',
  },
  // ----- Legacy variants kept for backwards compat -----
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

export const STATUS_COLORS = {
  available: { hex: '#10B981', name: 'green' },
  pilot: { hex: '#F59E0B', name: 'amber' },
  'coming-soon': { hex: '#64748B', name: 'slate' },
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
