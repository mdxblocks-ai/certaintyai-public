import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReportPreview from './ReportPreview'

// Phase 1.5.10 — On-demand showcase of the actual deliverable.
// Triggered by the "View Sample Report" CTA in the Hero. ESC closes,
// click-on-backdrop closes, body scroll locks while open.
export default function ReportPreviewModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sample AI Readiness Report"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal container — stop click propagation so clicks inside don't close */}
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">Sample</div>
            <div className="text-base font-semibold text-slate-100">AI Readiness Report — preview</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body — untilted version of the same component used in the hero */}
        <div className="p-5 sm:p-8">
          <ReportPreview tilt={false} />

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">✓</span>
              Executive scorecard with NIST GOVERN / MEASURE sub-scores
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">✓</span>
              Frameworks selected dynamically by your industry
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">✓</span>
              90-day prioritised roadmap with effort &amp; impact
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">✓</span>
              Peer benchmark, evidence pack &amp; regulator-ready paragraph
            </li>
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 z-10 px-5 py-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <p className="text-xs text-slate-400">
            Your own report will reflect your actual industry, data, and frameworks.
          </p>
          <Link
            to="/survey"
            onClick={onClose}
            className="shrink-0 px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition text-sm text-center"
          >
            Take the 2-minute assessment →
          </Link>
        </div>
      </div>
    </div>
  )
}
