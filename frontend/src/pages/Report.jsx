import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const SHOW_AI_READINESS_NAV = false;

// Lucide-like custom inline SVGs for premium look & feel
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Readiness: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Portfolio: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Reports: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <circle cx="8" cy="9" r="1" />
    </svg>
  )
}

// Phase 1.5.2 — Toolbar removed (header lives inside the iframe report itself).
// Single gold banner: "Save report / Print" on the right. Auth state handled
// inside the banner so anonymous users see Save, logged-in users see Saved-✓.
export default function Report() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const iframeRef = useRef(null)
  const [html, setHtml] = useState('')
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isParchment = !user || (() => {
    const theme = localStorage.getItem('dashboard_theme')
    return theme === null ? true : theme === 'parchment'
  })()

  const handleIframeLoad = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.postMessage({ type: 'SET_THEME', theme: isParchment ? 'parchment' : 'dark' }, '*');
    }
  };

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (win && html) {
      win.postMessage({ type: 'SET_THEME', theme: isParchment ? 'parchment' : 'dark' }, '*');
    }
  }, [isParchment, html]);

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      api.get(`/report/by-token/${token}`, {
        responseType: 'text',
        transformResponse: [(data) => data],
      }),
      api.get(`/report/by-token/${token}/data`),
    ])
      .then(([htmlRes, dataRes]) => {
        if (cancelled) return
        setHtml(htmlRes.data || '')
        setMeta(dataRes.data || null)
      })
      .catch((err) => {
        if (cancelled) return
        const status = err.response?.status
        if (status === 404) setError('Report not found. The link may have expired.')
        else setError('Could not load the report. Try refreshing.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    if (user && meta && !meta.is_claimed) {
      api.post(`/auth/claim-report/${token}`)
        .then(() => {
          setMeta((m) => (m ? { ...m, is_claimed: true } : m))
          refreshUser().catch(() => {})
        })
        .catch(() => { })
    }
  }, [user, meta, token, refreshUser])

  // Dynamically resize iframe to fit its content scrollHeight and completely eliminate nested scrolling.
  useEffect(() => {
    if (!html || !iframeRef.current) return
    const timer = setTimeout(() => {
      try {
        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (doc) {
          iframe.style.height = 'auto'; // Reset first
          iframe.style.height = (doc.documentElement.scrollHeight + 40) + 'px';
        }
      } catch (e) {
        console.warn('Iframe resize failed:', e)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [html])

  function resizeIframe() {
    try {
      const iframe = iframeRef.current
      const doc = iframe?.contentDocument || iframe?.contentWindow?.document
      if (doc && iframe) {
        iframe.style.height = 'auto';
        iframe.style.height = (doc.documentElement.scrollHeight + 40) + 'px';
      }
    } catch (e) {
      console.warn('Iframe resize failed:', e)
    }
  }

  // Listen for TRIGGER_PRINT and IFRAME_RESIZE messages from the iframe to securely execute parent operations.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'TRIGGER_PRINT') {
        handlePrint();
      } else if (event.data && event.data.type === 'IFRAME_RESIZE') {
        resizeIframe();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handlePrint() {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    try { win.focus(); win.print() } catch { window.print() }
  }

  const isAnon = meta && !meta.is_claimed && !user

  // Report content shared between both layouts
  const reportBody = (
    <div className="w-full flex-grow flex flex-col items-center bg-[var(--dash-bg)]">
      <iframe
        ref={iframeRef}
        title="AI Readiness Report"
        srcDoc={html}
        onLoad={handleIframeLoad}
        className="w-full flex-1 border-none bg-[var(--dash-bg)]"
        style={{ width: '100%', minHeight: '1200px', border: 'none', overflow: 'hidden' }}
        sandbox="allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups"
      />
    </div>
  )

  const guestHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--dash-border)] pb-3 mb-4 no-print">
      <div>
        <span className="text-xs uppercase tracking-widest text-[var(--dash-active-text)] font-bold bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-3 py-1 rounded-full">
          🛡️ Readiness &amp; Governance
        </span>
        <h2 className="text-3xl font-extrabold text-[var(--dash-text-primary)] mt-2">
          AI Readiness Assessment Report
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/signup?claim=${token}`}
          className="px-4 py-2 rounded-xl bg-[var(--dash-accent)] text-[var(--dash-newchat-text)] hover:bg-[var(--dash-accent-hover)] hover:text-[var(--dash-newchat-hover-text)] text-sm font-bold transition duration-200 flex items-center gap-2"
        >
          💾 Save Report (Free)
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl border border-[var(--dash-border)] hover:border-[var(--dash-accent)] bg-[var(--dash-card-bg)] text-sm text-[var(--dash-text-primary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] transition duration-200 font-semibold flex items-center gap-2"
        >
          🖨 Print
        </button>
        <button
          type="button"
          onClick={() => navigate('/survey')}
          className="px-4 py-2 rounded-xl border border-[var(--dash-border)] hover:border-[var(--dash-accent)] bg-[var(--dash-card-bg)] text-sm text-[var(--dash-text-primary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] transition duration-200 font-semibold flex items-center gap-2"
        >
          🔄 Start Over
        </button>
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--emerald)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--emerald)]"></span>
          </span>
          <span className="text-[var(--dash-text-secondary)]">Security: <strong className="text-[var(--emerald)] font-semibold uppercase">Locked</strong></span>
        </div>
      </div>
    </div>
  )

  const signedInHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--dash-border)] pb-3 mb-4 no-print">
      <div>
        <span className="text-xs uppercase tracking-widest text-[var(--dash-active-text)] font-bold bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-3 py-1 rounded-full">
          🛡️ Readiness &amp; Governance
        </span>
        <h2 className="text-3xl font-extrabold text-[var(--dash-text-primary)] mt-2">
          AI Readiness Assessment Report
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl border border-[var(--dash-border)] hover:border-[var(--dash-accent)] bg-[var(--dash-card-bg)] text-sm text-[var(--dash-text-primary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] transition duration-200 font-semibold flex items-center gap-2"
        >
          🖨 Print Report
        </button>
        <button
          type="button"
          onClick={() => navigate('/survey')}
          className="px-4 py-2 rounded-xl border border-[var(--dash-border)] hover:border-[var(--dash-accent)] bg-[var(--dash-card-bg)] text-sm text-[var(--dash-text-primary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] transition duration-200 font-semibold flex items-center gap-2"
        >
          🔄 Start Over
        </button>
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--emerald)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--emerald)]"></span>
          </span>
          <span className="text-[var(--dash-text-secondary)]">Security Gateways: <strong className="text-[var(--emerald)] font-semibold uppercase">Locked</strong></span>
        </div>
      </div>
    </div>
  )

  if (user) {
    return (
      <div className={`w-full flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300 bg-[var(--dash-bg)] text-[var(--dash-text-primary)] ${isParchment ? 'theme-parchment' : ''}`}>
        {/* Sidebar Navigation */}
        <aside className={`w-full transition-all duration-300 bg-[var(--dash-sidebar-bg)] border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] p-5 flex flex-col justify-between shrink-0 lg:h-full lg:overflow-y-auto ${
          isCollapsed ? 'lg:w-16' : 'lg:w-52'
        }`}>
          <div className="space-y-6 flex-grow flex flex-col">
            {/* Collapse/Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-lg border border-[var(--dash-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)] transition w-full"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
            </button>

            <nav className="space-y-1.5">
              <button
                onClick={() => navigate('/dashboard?tab=home')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] ${
                  isCollapsed ? 'lg:justify-center' : ''
                }`}
                title="Home"
              >
                <Icons.Home />
                {!isCollapsed && <span className="text-sm font-semibold">Home</span>}
              </button>

              <button
                onClick={() => navigate('/dashboard?tab=dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] ${
                  isCollapsed ? 'lg:justify-center' : ''
                }`}
                title="Dashboard"
              >
                <Icons.Dashboard />
                {!isCollapsed && <span className="text-sm font-semibold">Dashboard</span>}
              </button>

              {SHOW_AI_READINESS_NAV && (
                <button
                  onClick={() => navigate('/dashboard?tab=readiness')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)] font-bold ${
                    isCollapsed ? 'lg:justify-center' : ''
                  }`}
                  title="AI Readiness"
                >
                  <Icons.Readiness />
                  {!isCollapsed && <span className="text-sm font-semibold">AI Readiness</span>}
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard?tab=reports')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] ${
                  isCollapsed ? 'lg:justify-center' : ''
                }`}
                title="Saved Reports"
              >
                <Icons.Reports />
                {!isCollapsed && <span className="text-sm font-semibold">Saved Reports</span>}
              </button>
            </nav>
          </div>

          {/* Bottom Group: Settings & User Profile Card */}
          <div className="space-y-4 mt-auto">
            <nav className="space-y-1">
              <button
                onClick={() => navigate('/dashboard?tab=settings')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] ${
                  isCollapsed ? 'lg:justify-center' : ''
                }`}
                title="Settings"
              >
                <Icons.Settings />
                {!isCollapsed && <span className="text-sm font-semibold">Settings</span>}
              </button>
            </nav>

            {/* Co-brand Trust Block */}
            {!isCollapsed && (
              <div className="px-3 py-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card-bg)]/20 text-[10px] space-y-1.5 font-sans">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-wider text-[var(--dash-text-secondary)] font-bold">BUILT ON</span>
                  <div className="flex items-center mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[var(--dash-accent)] mr-1.5 shrink-0">
                      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.04-1.24.11A7 7 0 0 0 3 11.5c0 3.62 3.1 6.5 7 6.5h7.5z" />
                    </svg>
                    <span className="text-[11px] font-semibold text-[var(--dash-text-primary)]">Google Cloud</span>
                  </div>
                  <span className="text-[9px] mt-0.5 text-[var(--dash-text-secondary)]">Powered by Vertex AI · Cloud Run</span>
                </div>
                <div className="border-t border-[var(--dash-border)] pt-1.5 text-[8.5px] leading-normal text-[var(--dash-text-secondary)]">
                  Aligned to NIST AI RMF · ISO 42001 · EU AI Act
                </div>
              </div>
            )}

            {/* User Card */}
            <div className="pt-4 border-t border-[var(--dash-border)] hidden lg:block">
              <div className={`flex items-center gap-3 bg-[var(--dash-card-bg)] p-3 rounded-xl border border-[var(--dash-border)] transition duration-200 ${
                isCollapsed ? 'justify-center' : ''
              }`} title={user?.email}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-slate-950 text-sm shrink-0">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--dash-text-secondary)] uppercase tracking-widest font-semibold">{user?.role || 'Enterprise User'}</p>
                      <p className="text-sm text-[var(--dash-text-primary)] font-bold truncate">{user?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 p-3 lg:py-4 lg:px-6 space-y-3 overflow-y-auto w-full no-print">
          {signedInHeader}

          {/* Report Body */}
          {reportBody}
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 bg-[var(--dash-bg)] text-[var(--dash-text-primary)] ${isParchment ? 'theme-parchment' : ''}`}>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-[var(--dash-text-secondary)] text-sm">Loading report…</div>
      )}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6">
            <p className="text-[var(--rose)] text-sm">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/survey')}
              className="mt-4 px-4 py-2 rounded-lg text-sm border border-[var(--dash-border)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)] transition duration-200"
            >
              Start a new assessment
            </button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="flex-1 flex flex-col p-3 lg:py-4 lg:px-6 max-w-[1380px] mx-auto w-full">
          {guestHeader}
          {reportBody}
        </div>
      )}
    </div>
  )
}
