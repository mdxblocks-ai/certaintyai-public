import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'


const SHOW_AI_READINESS_NAV = false;

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
          <span className="text-[var(--dash-text-secondary)]">Security: <strong className="text-[var(--emerald)] font-semibold uppercase">Locked</strong></span>
        </div>
      </div>
    </div>
  )

  if (user) {
    return (
      <div className={`w-full flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300 bg-[var(--dash-bg)] text-[var(--dash-text-primary)] ${isParchment ? 'theme-parchment' : ''}`}>
        <Sidebar activeTab={null} />


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
