import React from 'react'
import { useRegion } from '../context/RegionContext'
import LogoMark from './LogoMark'

const DEFAULT_TAGLINE = 'Defensible AI for regulated industries'

export default function BrandLogo({
  variant = 'parchment',
  tagline,
  showTagline = true,
}) {
  const { activeRegion } = useRegion()
  const resolvedTagline = tagline ?? activeRegion?.tag ?? DEFAULT_TAGLINE

  if (variant === 'dark') {
    return (
      <span className="flex items-center gap-3">
        <span className="w-[42px] h-[42px] border border-slate-800 rounded-[9px] flex items-center justify-center bg-slate-900 shrink-0 transition group-hover:border-slate-700">
          <LogoMark className="w-[28px] h-[28px] text-cyan-400 group-hover:text-cyan-300 transition duration-300" />
        </span>
        <span className="leading-tight">
          <span className="block font-semibold tracking-tight text-slate-100 group-hover:text-white transition duration-200">
            CertaintyAI<sup className="text-[10px] ml-0.5 font-sans">™</sup>
          </span>
          {showTagline && (
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400 whitespace-normal md:whitespace-nowrap">
              {resolvedTagline}
            </span>
          )}
        </span>
      </span>
    )
  }

  // Parchment (default) — used by Navbar (logged-out / parchment mode) and Footer
  return (
    <span className="flex items-center gap-3">
      <span className="w-[42px] h-[42px] border-[1.5px] border-[#14161A] rounded-[9px] flex items-center justify-center bg-[#FBF8F0] shrink-0">
        <LogoMark className="w-[28px] h-[28px] text-[#14161A]" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif-brand font-bold text-lg text-[#14161A]">
          CertaintyAI<sup className="text-[10px] ml-0.5 font-sans">™</sup>
        </span>
        {showTagline && (
          <span className="block text-[10px] text-[#73706A] italic font-medium font-serif-brand mt-0.5 whitespace-normal md:whitespace-nowrap">
            {resolvedTagline}
          </span>
        )}
      </span>
    </span>
  )
}
