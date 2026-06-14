import React from 'react'

// Status taxonomy (canonical):
//   ready-for-demo       — green   (production-ready demo today)
//   working-in-progress  — amber   (actively under development)
//   on-roadmap           — slate   (planned future capability)
//
// Old keys are mapped via ALIAS so existing data and any older copy still works.

const STYLES = {
  // ----- Canonical product-status variants -----
  'ready-for-demo': {
    label: 'Ready for Demo',
    cls: 'bg-[#10B981]/14 text-[#047857] border-[#10B981]/55 shadow-[0_0_12px_-4px_rgba(16,185,129,0.4)]',
    dot: 'bg-[#10B981]',
  },
  'working-in-progress': {
    label: 'Working In Progress',
    cls: 'bg-[#F59E0B]/14 text-[#B45309] border-[#F59E0B]/55 shadow-[0_0_12px_-4px_rgba(245,158,11,0.4)]',
    dot: 'bg-[#F59E0B]',
  },
  'on-roadmap': {
    label: 'On Roadmap',
    cls: 'bg-[#64748B]/12 text-[#1E40AF] border-[#64748B]/55',
    dot: 'bg-[#1E40AF]',
  },
  // ----- Legacy variants kept for backwards compat -----
  live: {
    label: 'Live',
    cls: 'bg-[#1E3A36]/10 text-[#1E3A36] border-[#1E3A36]/25',
    dot: 'bg-[#1E3A36]',
  },
  beta: {
    label: 'Beta',
    cls: 'bg-[#A87C3C]/12 text-[#7C5723] border-[#A87C3C]/35',
    dot: 'bg-[#A87C3C]',
  },
  roadmap: {
    label: 'Roadmap',
    cls: 'bg-[#14161A]/5 text-[#3B3D42] border-[#14161A]/15',
    dot: 'bg-[#3B3D42]',
  },
}

// Map legacy keys to the new canonical taxonomy.
const ALIAS = {
  available: 'ready-for-demo',
  pilot: 'ready-for-demo',
  'coming-soon': 'working-in-progress',
}

export const STATUS_COLORS = {
  'ready-for-demo':      { hex: '#10B981', name: 'green' },
  'working-in-progress': { hex: '#F59E0B', name: 'amber' },
  'on-roadmap':          { hex: '#64748B', name: 'slate-blue' },
}

export function normalizeStatus(status) {
  if (!status) return 'live'
  return ALIAS[status] || status
}

export default function StatusChip({ status = 'live', label, className = '' }) {
  const canonical = normalizeStatus(status)
  const s = STYLES[canonical] || STYLES.live
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${s.cls} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label || s.label}
    </span>
  )
}
