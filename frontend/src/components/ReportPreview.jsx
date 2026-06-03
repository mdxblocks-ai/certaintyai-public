// Phase 1.5.8 — Flagship hero visual: a stylized preview of the actual
// deliverable (the AI Readiness Report). A CIO arriving on the page
// immediately sees what they would walk away with — executive scorecard,
// framework alignment, a real recommendation, and evidence — instead of a
// data-model abstraction. Cited honestly with a SAMPLE badge.
//
// The numbers below are illustrative and approximate the output of
// the deterministic scoring engine for a mid-market healthcare profile.

const FRAMEWORKS = ['HIPAA', 'GDPR', 'NIST AI RMF', 'SOC 2', 'ISO 42001', 'HITECH']

function ScoreRing({ value }) {
  // Cheap inline ring (no chart lib) — circumference of a 32-radius circle.
  const C = 2 * Math.PI * 32
  const dash = (value / 100) * C
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      <circle cx="40" cy="40" r="32" stroke="#e2e8f0" strokeWidth="6" fill="none" />
      <circle
        cx="40" cy="40" r="32"
        stroke="#0891b2" strokeWidth="6" fill="none" strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="42" textAnchor="middle" dominantBaseline="middle"
            fontSize="20" fontWeight="700" fill="#0f172a">
        {value}
      </text>
      <text x="40" y="58" textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill="#64748b">/100</text>
    </svg>
  )
}

export default function ReportPreview({ tilt = true }) {
  return (
    <div className="relative">
      {tilt && (<>
      {/* Subtle stacked-card depth: back card peeking out behind */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-slate-800/60 border border-slate-700"
        style={{ transform: 'translate(10px, 10px) rotate(2deg)' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-slate-900/80 border border-slate-700"
        style={{ transform: 'translate(5px, 5px) rotate(1deg)' }}
      />
      </>)}

      {/* Front card — the actual report preview */}
      <div
        className="relative bg-white text-slate-900 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden"
        style={tilt ? { transform: 'rotate(-1.5deg)' } : undefined}
      >
        {/* SAMPLE badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full">
            Sample
          </span>
        </div>

        {/* Header bar */}
        <div className="bg-slate-950 text-slate-100 px-5 py-3 flex items-center gap-3">
          <img src="/certaintyai-logo-cyan.png" alt="" className="w-7 h-7 object-contain" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-400">AI Readiness Report</div>
            <div className="text-sm font-semibold truncate">ACME Corporation · John Doe</div>
          </div>
        </div>

        {/* Executive scorecard */}
        <div className="px-5 py-4 flex items-start gap-5 border-b border-slate-200">
          <ScoreRing value={64} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Maturity tier</div>
            <div className="text-base font-semibold text-slate-900">Moderate / Developing</div>
            <div className="text-xs text-slate-500 italic mt-0.5">"Pilots exist, but no operational backbone."</div>
            
            <div className="mt-2.5 flex gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Readiness</div>
                <div className="text-xs font-bold text-slate-800">64<span className="text-[9px] text-slate-400 font-normal">/100</span></div>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Priority Gaps</div>
                <div className="text-xs font-bold text-slate-800">5 <span className="text-[9px] text-slate-500 font-normal">90-day closeable</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Frameworks applied */}
        <div className="px-5 py-3 border-b border-slate-200">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Frameworks applied</div>
          <div className="flex flex-wrap gap-1.5">
            {FRAMEWORKS.map((f) => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Top recommendation */}
        <div className="px-5 py-3 border-b border-slate-200">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Top recommendation · Week 1–2</div>
          <div className="mt-1 text-sm text-slate-800 font-medium leading-snug">
            Establish a formal AI governance committee — streamline AI approvals and enhance risk management, addressing critical gaps in oversight and data quality.
          </div>
        </div>

        {/* Evidence callout */}
        <div className="px-5 py-3 bg-slate-50 flex items-start gap-2">
          <span aria-hidden className="text-cyan-600 mt-0.5">●</span>
          <div className="text-[11px] text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Every answer carries evidence.</span>{' '}
            Cited to ontology nodes → source systems → compliance controls.
            Same lineage your auditors see.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2 bg-white text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
          <span>Generated by CertaintyAI · MDxBlocks Inc</span>
          <span>Page 1 of 8</span>
        </div>
      </div>
    </div>
  )
}
