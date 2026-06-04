import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegion } from '../context/RegionContext'
import LogoMark from './LogoMark'

export default function Footer() {
  const navigate = useNavigate()
  const { activeRegion } = useRegion()

  const handleScrollToExplorer = (e) => {
    e.preventDefault()
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('explorer')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  return (
    <footer className="border-t border-[#14161A]/14 mt-24 pt-14 pb-10 bg-[#ECE5D6]/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="foot-grid">
          <div style={{ maxWidth: '300px' }}>
            <div className="brand flex items-center gap-3" style={{ cursor: 'default' }}>
              <div className="w-[42px] h-[42px] border-[1.5px] border-[#14161A] rounded-[9px] flex items-center justify-center bg-[#FBF8F0] shrink-0">
                <LogoMark className="w-[28px] h-[28px] text-[#14161A]" />
              </div>
              <div className="leading-tight">
                <div className="font-serif-brand font-bold text-lg text-[#14161A]">CertaintyAI<sup className="text-[10px] ml-0.5 font-sans">™</sup></div>
                <div className="text-[10px] text-[#73706A] italic font-medium font-serif-brand mt-0.5">
                  {activeRegion?.tag || 'Defensible AI for regulated industries'}
                </div>
              </div>
            </div>
            <p className="text-sm text-[#73706A] mt-5 leading-relaxed">
              The governance layer for AI in healthcare, finance, cybersecurity, education and beyond.
            </p>
          </div>
          <div className="foot-links">
            <div className="foot-col">
              <h5>Platform</h5>
              <Link to="/">Home</Link>
              <Link to="/foundry">About Our Foundry</Link>
              <Link to="/architecture">Open Architecture</Link>
              <Link to="/survey">AI Readiness</Link>
            </div>
            <div className="foot-col">
              <h5>Industries</h5>
              <a href="#" onClick={handleScrollToExplorer}>Healthcare</a>
              <a href="#" onClick={handleScrollToExplorer}>Banking &amp; Finance</a>
              <a href="#" onClick={handleScrollToExplorer}>Cybersecurity</a>
              <a href="#" onClick={handleScrollToExplorer}>Education</a>
            </div>
            <div className="foot-col">
              <h5>Trust</h5>
              <a href="#governance">Governance</a>
              <a href="#compliance">Compliance</a>
              <a href="#security">Security</a>
              <a href="#explainability">Explainability</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="copy">© {new Date().getFullYear()} CertaintyAI<sup className="text-[8px] ml-0.5 font-sans">™</sup>. All rights reserved.</div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--dash-text-secondary)] font-sans">
            <span className="text-[8.5px] uppercase tracking-wider font-bold">Built on</span>
            <div className="flex items-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[var(--dash-accent)] mr-1 shrink-0">
                <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.04-1.24.11A7 7 0 0 0 3 11.5c0 3.62 3.1 6.5 7 6.5h7.5z" />
              </svg>
              <span className="font-semibold text-[var(--dash-text-primary)]">Google Cloud</span>
            </div>
            <span className="mx-0.5 opacity-40">·</span>
            <span>Powered by Vertex AI</span>
            <span className="mx-0.5 opacity-40">·</span>
            <span>Cloud Run</span>
          </div>
          <div className="attrib">BY <b>MDxBlocks</b></div>
        </div>
      </div>
    </footer>
  )
}
