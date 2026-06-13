import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import CopilotCard from '../components/CopilotCard'
import CTABand from '../components/CTABand'
import { BRAND, CTA } from '../lib/branding'
import { copilotsByDomain, COPILOTS } from '../lib/copilots'

export default function Copilots() {
  const groups = copilotsByDomain()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prev = document.title
      document.title = `Domain AI Copilots · ${BRAND.name}`
      return () => { document.title = prev }
    }
  }, [])

  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">

      {/* ===== Hero ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7C5723] uppercase">
            <span className="w-6 h-px bg-[#A87C3C]" />
            Domain AI Copilots
          </div>
          <h1 className="font-serif-brand text-5xl sm:text-6xl font-normal leading-[1.05] tracking-tight mt-6 text-[#14161A]">
            Pre-built copilots, <em>built for the audit.</em>
          </h1>
          <p className="text-lg text-[#3B3D42] leading-relaxed mt-6 mb-7 max-w-2xl">
            Each copilot inherits the same open architecture — ontology grounding, governance gates, evidence packs, and step traces. So a clinician, a CFO, a dean, or a CISO gets help they can actually defend.
          </p>

          <div className="flex flex-wrap gap-3 items-center">
            <Link
              to={CTA.startFree.href}
              className="py-3.5 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-sm shadow"
            >
              {CTA.startFree.label} →
            </Link>
            <Link
              to={CTA.exploreArchitecture.href}
              className="py-3.5 px-6 rounded-lg border border-[#14161A]/16 text-[#14161A] hover:bg-[#ECE5D6] hover:border-[#14161A]/30 transition font-bold text-sm"
            >
              See the architecture →
            </Link>
            <Link
              to={CTA.readinessCheck.href}
              className="py-3.5 px-6 rounded-lg text-[#7C5723] hover:text-[#14161A] transition font-bold text-sm"
            >
              {CTA.readinessCheck.label} →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Honest count strip ===== */}
      <section className="border-t border-b border-[#14161A]/10 bg-[#ECE5D6]/30 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-[#3B3D42]">
            <b className="text-[#14161A]">{COPILOTS.length} copilots</b> across <b className="text-[#14161A]">{groups.length} regulated domains</b> — all roadmap, all built on the same open seams.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#73706A] tracking-wide">
            <b className="uppercase tracking-widest text-[#14161A]/70">Built on</b>
            <span>{BRAND.trustStrip.slice(0, 5).join(' · ')}</span>
          </div>
        </div>
      </section>

      {/* ===== Domain groups ===== */}
      {groups.map((group, gi) => (
        <section
          key={group.domain.id}
          id={group.domain.id}
          className={gi % 2 === 0 ? 'py-16' : 'py-16 bg-[#ECE5D6]/15 border-y border-[#14161A]/8'}
        >
          <div className="max-w-7xl mx-auto px-6">
            <header className="flex items-start justify-between gap-6 flex-wrap mb-10">
              <div className="max-w-2xl">
                <div
                  className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase mb-3"
                  style={{ color: group.domain.accent }}
                >
                  <span className="w-5 h-px" style={{ backgroundColor: group.domain.accent }} />
                  {group.domain.name}
                </div>
                <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
                  {group.domain.name} Copilots
                </h2>
                <p className="text-sm text-[#3B3D42] mt-3">
                  {group.domain.blurb}
                </p>
              </div>
              <div className="text-right text-[11px] text-[#73706A] tracking-wide">
                <div className="uppercase font-semibold tracking-widest text-[#14161A]/70 mb-1">
                  {group.copilots.length} copilot{group.copilots.length === 1 ? '' : 's'}
                </div>
                <Link
                  to={CTA.startFree.href}
                  className="font-bold transition"
                  style={{ color: group.domain.accent }}
                >
                  Build in Copilot Studio →
                </Link>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.copilots.map((c) => (
                <CopilotCard key={c.id} copilot={c} domain={group.domain} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===== Build-your-own band ===== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-[#FBF8F0] border border-[#14161A]/10 rounded-3xl p-10 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">
                Copilot Studio
              </span>
              <h2 className="font-serif-brand text-3xl sm:text-4xl text-[#14161A] font-normal leading-tight">
                Don’t see your role? Build it in minutes.
              </h2>
              <p className="text-sm text-[#3B3D42] mt-4 leading-relaxed max-w-2xl">
                The same Agent Builder that powers these domain copilots is in the console today. Start from a CISO or CFO template, attach a knowledge base, set policies, and ship — with full step traces, retrieved-source attribution, and dynamic follow-ups out of the box.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Link
                  to="/signup"
                  className="py-3.5 px-6 rounded-lg bg-[#14161A] text-[#F4F0E6] hover:bg-[#7C5723] transition font-bold text-sm shadow"
                >
                  Open Copilot Studio →
                </Link>
                <Link
                  to="/architecture"
                  className="py-3.5 px-6 rounded-lg border border-[#14161A]/16 text-[#14161A] hover:bg-[#ECE5D6] hover:border-[#14161A]/30 transition font-bold text-sm"
                >
                  See the open architecture
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ul className="space-y-3 text-sm text-[#3B3D42]">
                <li className="flex gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#A87C3C] shrink-0" />
                  <span><b className="text-[#14161A]">Role templates.</b> CISO Vendor Risk Triage and CFO ROI Analyzer ship today; new roles inherit the same governance defaults.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#2F7D6B] shrink-0" />
                  <span><b className="text-[#14161A]">Knowledge base RAG.</b> Local uploads index into the agent’s vector store; SharePoint and Portal URLs queue as linked sources.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#A8506A] shrink-0" />
                  <span><b className="text-[#14161A]">Step traces.</b> Every run logs reasoning, tool calls, and retrieved sources for downstream audit.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#3A7E92] shrink-0" />
                  <span><b className="text-[#14161A]">Governance gates.</b> Policies, max-step limits, and tool authorization enforced at the runtime, not the prompt.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        heading="One open architecture. A copilot for every regulated role."
        sub="Start with the architecture, build your first copilot, or run the 2-minute readiness check."
      />

      <Footer />
    </div>
  )
}
