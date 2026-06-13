import React from 'react'

const STYLES = {
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
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label || s.label}
    </span>
  )
}
