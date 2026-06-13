import React from 'react'
import { Link } from 'react-router-dom'

function isExternalAnchor(href) {
  return typeof href === 'string' && href.startsWith('#')
}

export default function NarrativeNode({ node, isLast = false }) {
  const { index, title, blurb, caps = [], cta, accent, glow } = node

  const handleAnchorClick = (e) => {
    if (!isExternalAnchor(cta?.href)) return
    e.preventDefault()
    const el = document.querySelector(cta.href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative" id={node.id}>
      <div
        className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-[#A87C3C]/55 transition duration-200 relative overflow-hidden"
        style={{
          boxShadow: `0 1px 0 ${glow}, 0 12px 38px -22px ${glow}`,
        }}
      >
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-60 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        />

        <div className="flex items-start gap-5 relative">
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[#FBF8F0] font-serif-brand text-xl font-semibold"
            style={{ backgroundColor: accent }}
            aria-hidden
          >
            {String(index).padStart(2, '0')}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif-brand text-2xl text-[#14161A] font-normal leading-snug mb-1.5">
              {title}
            </h3>
            <p className="text-sm text-[#3B3D42] leading-relaxed mb-4 max-w-2xl">
              {blurb}
            </p>

            {caps.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {caps.map((c) => (
                  <span
                    key={c}
                    className="text-[10.5px] font-semibold tracking-wide uppercase px-2 py-1 rounded-md border border-[#14161A]/10 text-[#3B3D42] bg-[#F4F0E6]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {cta && (
              isExternalAnchor(cta.href) ? (
                <a
                  href={cta.href}
                  onClick={handleAnchorClick}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#7C5723] hover:text-[#14161A] transition"
                >
                  {cta.label} →
                </a>
              ) : (
                <Link
                  to={cta.href}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#7C5723] hover:text-[#14161A] transition"
                >
                  {cta.label} →
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="flex justify-center" aria-hidden>
          <div className="w-px h-8 bg-gradient-to-b from-[#A87C3C]/45 to-transparent" />
        </div>
      )}
    </div>
  )
}
