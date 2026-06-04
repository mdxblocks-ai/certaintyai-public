import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRegion, REGIONS } from '../context/RegionContext'
import LogoMark from './LogoMark'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { region, setRegion, activeRegion } = useRegion()
  const navigate = useNavigate()
  const location = useLocation()

  const [regionOpen, setRegionOpen] = useState(false)
  const [oeOpen, setOeOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [accountOpen, setAccountOpen] = useState(false)

  // Close menus on page change
  useEffect(() => {
    setRegionOpen(false)
    setOeOpen(false)
    setAccountOpen(false)
  }, [location])

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside() {
      setRegionOpen(false)
      setOeOpen(false)
      setAccountOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setAccountOpen(false)
    navigate('/', { replace: true })
  }

  function handleArchClick(e) {
    e.preventDefault()
    navigate('/architecture')
  }

  function openExplorer() {
    setOeOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById('explorer')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } else {
      const el = document.getElementById('explorer')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Determine styling based on whether the user is logged in or parchment theme is active
  const isParchment = !user || (() => {
    const theme = localStorage.getItem('dashboard_theme')
    return theme === null ? true : theme === 'parchment'
  })()
  const headerClass = isParchment
    ? "theme-parchment bg-[#F4F0E6] border-b border-[#14161A]/10 text-[#14161A] sticky top-0 z-50 transition-all duration-300"
    : "border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 shadow-[0px_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300"

  const linkClass = ({ isActive }) => {
    if (isParchment) {
      return `nav-link ${isActive ? 'active' : ''}`
    } else {
      return [
        'text-sm font-medium transition duration-200 px-3 py-1.5 rounded-lg relative',
        isActive ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
      ].join(' ')
    }
  }

  return (
    <>
      <header className={headerClass}>
        <div className={`${user ? 'max-w-full' : 'max-w-7xl'} mx-auto px-6 h-20 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
              <div className={isParchment 
                ? "w-[42px] h-[42px] border-[1.5px] border-[#14161A] rounded-[9px] flex items-center justify-center bg-[#FBF8F0] shrink-0" 
                : "w-10 h-10 border border-slate-800 rounded-lg flex items-center justify-center bg-slate-900 group-hover:border-slate-700 shrink-0 transition"
              }>
                <LogoMark className={isParchment ? "w-[28px] h-[28px] text-[#14161A]" : "w-[24px] h-[24px] text-cyan-400 group-hover:text-cyan-300 transition duration-300"} />
              </div>
              <div className="leading-tight">
                <div className={isParchment 
                  ? "font-serif-brand font-bold text-lg text-[#14161A]" 
                  : "font-semibold tracking-tight text-slate-100 group-hover:text-white transition duration-200"
                }>
                  CertaintyAI<sup className="text-[10px] ml-0.5 font-sans">™</sup>
                </div>
                <div className={isParchment 
                  ? "text-[10px] text-[#73706A] italic font-medium font-serif-brand" 
                  : "text-[9px] uppercase tracking-[0.25em] text-slate-400"
                }>
                  {isParchment ? activeRegion.tag : 'by MDxBlocks'}
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-2">
            {!user && (
              <>
                <NavLink to="/" end className={linkClass}>Home</NavLink>
                <NavLink to="/foundry" className={linkClass}>About Our Foundry</NavLink>
                <NavLink to="/architecture" className={linkClass}>Open Architecture</NavLink>
                <NavLink to="/survey" className={linkClass}>AI Readiness</NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isParchment && (
              <>
                {/* Ontology Engine Status Dropdown */}
                <div className="relative oe">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setOeOpen(!oeOpen)
                      setRegionOpen(false)
                    }}
                    className="status status-btn flex items-center gap-1"
                  >
                    <span className="dot"></span>
                    <span>Ontology Engine</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ marginLeft: '2px' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {oeOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="oe-pop open"
                    >
                      <div className="oe-h">
                        <span className="t">Ontology Engine</span>
                        <span className="oe-live"><span className="d"></span>Operational</span>
                      </div>
                      <div className="oe-row">
                        <span>Industries loaded</span>
                        <b>5</b>
                      </div>
                      <div className="oe-row">
                        <span>Active model</span>
                        <b>Healthcare</b>
                      </div>
                      <div className="oe-row">
                        <span>Entities mapped</span>
                        <b>37</b>
                      </div>
                      <div className="oe-row">
                        <span>Relationships</span>
                        <b>36</b>
                      </div>
                      <div className="oe-row">
                        <span>Reasoning mode</span>
                        <b>GraphRAG</b>
                      </div>
                      <div className="oe-note">
                        Live status. Connecting the engine to your own data is a Phase 2 deployment step.
                      </div>
                      <button 
                        onClick={openExplorer}
                        className="btn"
                      >
                        Open ontology explorer →
                      </button>
                    </div>
                  )}
                </div>

                {/* Region Switcher */}
                <div className="relative region">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setRegionOpen(!regionOpen)
                      setOeOpen(false)
                    }}
                    className="region-btn"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M3 12h18M12 3a15 15 0 0 1 0 18A15 15 0 0 1 12 3Z"/>
                    </svg>
                    <span>{activeRegion.label}</span>
                  </button>
                  {regionOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="region-menu open"
                    >
                      {Object.entries(REGIONS).map(([key, value]) => (
                        <button 
                          key={key}
                          onClick={() => {
                            setRegion(key)
                            setRegionOpen(false)
                          }}
                        >
                          <div className="r-name">{value.name}</div>
                          <div className="r-tag">{value.tag}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {user ? (
              <div className="relative">
                {/* Account Trigger Button */}
                <button 
                  onClick={() => setAccountOpen(!accountOpen)}
                  className={isParchment
                    ? "flex items-center gap-2 text-xs font-semibold text-[#14161A] bg-[#ECE5D6] border border-[#14161A]/10 px-3 py-2 rounded-lg hover:border-[#14161A]/20 transition"
                    : "flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-400 font-semibold bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 transition"
                  }
                >
                  <span>👤 {user.email}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Account Dropdown */}
                {accountOpen && (
                  <div className={isParchment
                    ? "absolute right-0 mt-2 bg-[#FBF8F0] border border-[#14161A]/14 rounded-xl shadow-lg w-[200px] py-1.5 z-50 text-xs"
                    : "absolute right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl w-[200px] py-1.5 z-50 text-xs text-slate-300"
                  }>
                    <div className="px-4 py-2 border-b border-[#14161A]/6 text-[#73706A] font-semibold">
                      Account Menu
                    </div>
                    <Link 
                      to="/dashboard?tab=home"
                      onClick={() => setAccountOpen(false)}
                      className="w-full block text-left px-4 py-2.5 hover:bg-[#ECE5D6]/40 transition text-[#14161A]"
                    >
                      🖥 View Dashboard
                    </Link>
                    <Link 
                      to="/dashboard?tab=settings"
                      onClick={() => setAccountOpen(false)}
                      className="w-full block text-left px-4 py-2.5 hover:bg-[#ECE5D6]/40 transition text-[#14161A]"
                    >
                      ⚙ Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setAccountOpen(false)
                        setAuthMode('changepass')
                        setAuthModalOpen(true)
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#ECE5D6]/40 transition text-[#14161A] font-medium"
                    >
                      🔑 Change Password
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-[#7C5723] hover:bg-[#ECE5D6]/40 transition font-bold border-t border-[#14161A]/6"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin')
                  setAuthModalOpen(true)
                }}
                className={isParchment
                  ? "px-5 py-2 rounded-lg text-sm bg-[#14161A] text-[#F4F0E6] font-semibold hover:bg-[#7C5723] hover:text-white transition duration-200 shadow"
                  : "px-5 py-2 rounded-lg text-sm bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-semibold hover:from-cyan-400 hover:to-cyan-300 transition duration-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                }
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </>
  )
}
