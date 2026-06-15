import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'

export default function Footer() {
  const navigate = useNavigate()

  const handleScrollToExplorer = (e) => {
    e.preventDefault()
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('explorer')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  return (
    <footer className="border-t border-[#14161A]/14 pt-10 pb-7 bg-[#ECE5D6]/20">
      <div className="page-container">
        <div className="foot-grid">
          <div className="flex-1 md:min-w-[420px]">
            <BrandLogo variant="parchment" />
            <p className="text-sm text-[#73706A] mt-5 leading-relaxed whitespace-normal md:whitespace-nowrap">
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
          <div className="copy">
            <div>© {new Date().getFullYear()} MDxBlocks Inc. All Rights Reserved.</div>
            <div className="text-[10px] text-[#73706A] mt-1">
              CertaintyAI<sup className="text-[8px] ml-0.5 font-sans">™</sup> is a product of MDxBlocks Inc.
            </div>
          </div>
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
          <div className="attrib">A Product of <b>MDxBlocks Inc.</b></div>
        </div>
      </div>
    </footer>
  )
}
