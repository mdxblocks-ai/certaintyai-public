import React from 'react'
import ArchitectureStack from '../components/ArchitectureStack'
import Footer from '../components/Footer'

export default function Architecture() {
  return (
    <div className="theme-parchment min-h-screen bg-[#F4F0E6] text-[#14161A] font-sans-brand relative isolate">
      <div className="page-container pt-10 pb-20">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#7C5723] uppercase block mb-3">Open Architecture</span>
          <h1 className="font-serif-brand text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-4 max-w-4xl mx-auto">
            An explicit, explainable layer for enterprise reasoning.
          </h1>
          <p className="text-base text-[#3B3D42] leading-relaxed max-w-3xl mx-auto">
            CertaintyAI models your business operations, constraints, and audit requirements as a first-class architectural layer between your enterprise data and the language model.
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto bg-[#FBF8F0] border border-[#14161A]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <ArchitectureStack />
        </div>
      </div>
      <Footer />
    </div>
  )
}
