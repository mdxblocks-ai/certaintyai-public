import React from 'react'

const PROOFS = [
  {
    label: 'Live A2A across two processes',
    sub: 'Agent card discovery + JSON-RPC 0.3.0 over the wire.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="12" r="3" />
        <path d="M9 12h6M9 10l-2-2M9 14l-2 2M15 10l2-2M15 14l2 2" />
      </svg>
    ),
  },
  {
    label: 'Deterministic scoring',
    sub: '52-passing test gate. Same inputs, same audit trail.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: 'Apache-2.0',
    sub: 'Open source. No API keys committed.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M12 22c5-2 8-6 8-12V5l-8-3-8 3v5c0 6 3 10 8 12z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Marketplace-ready',
    sub: 'Designed for Google Cloud Marketplace listing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M3 9l1-5h16l1 5" />
        <path d="M5 9v11h14V9" />
        <path d="M9 14h6" />
      </svg>
    ),
  },
]

export default function ProofStrip() {
  return (
    <section className="border-t border-b border-[#14161A]/10 bg-[#ECE5D6]/30 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROOFS.map((p) => (
            <div key={p.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1E3A36] text-[#D8B679] flex items-center justify-center shrink-0">
                {p.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-[#14161A] leading-snug">{p.label}</div>
                <div className="text-[11.5px] text-[#3B3D42] leading-relaxed mt-0.5">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
