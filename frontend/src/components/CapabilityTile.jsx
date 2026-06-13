import React from 'react'
import { Link } from 'react-router-dom'
import StatusChip from './StatusChip'

export default function CapabilityTile({ name, blurb, status = 'live', href, accent = '#A87C3C' }) {
  const inner = (
    <div className="h-full bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-5 shadow-sm hover:border-[#A87C3C] hover:shadow-md transition duration-200 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <StatusChip status={status} />
      </div>
      <h4 className="font-serif-brand text-base font-semibold text-[#14161A] mb-1.5 leading-tight">{name}</h4>
      <p className="text-[12px] text-[#3B3D42] leading-relaxed">{blurb}</p>
    </div>
  )
  return href ? (
    <Link to={href} className="block h-full">{inner}</Link>
  ) : inner
}
