import React from 'react'
import { Link } from 'react-router-dom'
import { CTA } from '../lib/branding'

export default function CTABand({
  primary = CTA.exploreArchitecture,
  activation = CTA.startFree,
  tertiary = CTA.readinessCheck,
  heading = 'Stand up the open architecture your auditors will accept.',
  sub = 'Start with the live stack, build a copilot, or run the 2-minute readiness check. Pick the door that fits.',
}) {
  return (
    <section className="page-container py-16">
      <div className="bg-[#14161A] text-[#F4F0E6] rounded-3xl p-10 sm:p-12 text-center relative overflow-hidden isolate shadow-2xl">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(500px_260px_at_50%_120%,rgba(168,124,60,0.3),transparent)]"
        />
        <h2 className="font-serif-brand text-3xl sm:text-4xl font-normal leading-tight mb-4">
          {heading}
        </h2>
        <p className="text-sm text-[#F4F0E6]/78 max-w-xl mx-auto mb-8 leading-relaxed">
          {sub}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={primary.href}
            className="inline-block py-3.5 px-7 rounded-lg bg-[#D8B679] text-[#14161A] font-bold text-sm hover:bg-[#F4F0E6] transition shadow"
          >
            {primary.label} →
          </Link>
          <Link
            to={activation.href}
            className="inline-block py-3.5 px-7 rounded-lg bg-[#F4F0E6] text-[#14161A] font-bold text-sm hover:bg-[#D8B679] transition shadow"
          >
            {activation.label} →
          </Link>
          <Link
            to={tertiary.href}
            className="inline-block py-3.5 px-7 rounded-lg border border-[#F4F0E6]/30 text-[#F4F0E6] font-bold text-sm hover:bg-[#F4F0E6]/10 transition"
          >
            {tertiary.label} →
          </Link>
        </div>
      </div>
    </section>
  )
}
