import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SHOW_AI_READINESS_NAV = false;

// Custom premium inline SVGs matching the main theme
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
  Reports: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <circle cx="8" cy="9" r="1" />
    </svg>
  ),
  AgentBuilder: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ControlTower: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Integrations: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M9 16h6M12 12v6" />
      <circle cx="12" cy="6" r="4" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Incognito-safe localStorage wrapper
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed')
      return saved === 'true'
    } catch (e) {
      return false // Safe default: expanded
    }
  })

  const handleCollapseToggle = () => {
    const newVal = !isCollapsed
    setIsCollapsed(newVal)
    try {
      localStorage.setItem('sidebar_collapsed', String(newVal))
    } catch (e) {
      // Ignore security/incognito block errors gracefully
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      navigate(`/dashboard?tab=${tabId}`)
    }
  }

  const disableNav = user && !user.first_assessment_completed

  return (
    <aside className={`w-full transition-all duration-300 bg-[var(--dash-sidebar-bg)] border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] p-5 flex flex-col justify-between shrink-0 lg:h-full lg:overflow-y-auto ${
      isCollapsed ? 'lg:w-16' : 'lg:w-52'
    }`}>
      <div className="space-y-6 flex-grow flex flex-col">
        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={handleCollapseToggle}
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
          {!disableNav && (
            <button
              onClick={() => handleClick('home')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'home'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Home"
            >
              <Icons.Home />
              {!isCollapsed && <span className="text-sm font-semibold">Home</span>}
            </button>
          )}

          {!disableNav && (
            <button
              onClick={() => handleClick('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'dashboard'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Dashboard"
            >
              <Icons.Dashboard />
              {!isCollapsed && <span className="text-sm font-semibold">Dashboard</span>}
            </button>
          )}

          {(SHOW_AI_READINESS_NAV || disableNav) && (
            <button
              onClick={() => handleClick('readiness')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'readiness'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="AI Readiness"
            >
              <Icons.Readiness />
              {!isCollapsed && <span className="text-sm font-semibold">AI Readiness</span>}
            </button>
          )}

          {!disableNav && (
            <button
              onClick={() => handleClick('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'reports'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)] font-bold'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Reports"
            >
              <Icons.Reports />
              {!isCollapsed && <span className="text-sm font-semibold">Reports</span>}
            </button>
          )}

          {!disableNav && (
            <button
              onClick={() => handleClick('agent-builder')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'agent-builder'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)] font-bold'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Agent Builder"
            >
              <Icons.AgentBuilder />
              {!isCollapsed && <span className="text-sm font-semibold">Agent Builder</span>}
            </button>
          )}

          {!disableNav && (
            <button
              onClick={() => handleClick('control-tower')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'control-tower'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)] font-bold'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Control Tower"
            >
              <Icons.ControlTower />
              {!isCollapsed && <span className="text-sm font-semibold">Control Tower</span>}
            </button>
          )}

          {!disableNav && (
            <button
              onClick={() => handleClick('integrations')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'integrations'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)] font-bold'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Integrations"
            >
              <Icons.Integrations />
              {!isCollapsed && <span className="text-sm font-semibold">Integrations</span>}
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Group: Settings & User Profile Card */}
      <div className="space-y-4 mt-auto">
        {!disableNav && (
          <nav className="space-y-1">
            <button
              onClick={() => handleClick('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 ${
                isCollapsed ? 'lg:justify-center' : ''
              } ${
                activeTab === 'settings'
                  ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                  : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-hover-text)] hover:bg-[var(--dash-hover-bg)]'
              }`}
              title="Settings"
            >
              <Icons.Settings />
              {!isCollapsed && <span className="text-sm font-semibold">Settings</span>}
            </button>
          </nav>
        )}

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
  )
}
