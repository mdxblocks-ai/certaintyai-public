import React, { createContext, useContext, useState } from 'react'

export const REGIONS = {
  na: { label: 'N. America', name: 'North America', tag: 'Defensible AI for regulated industries' },
  uk: { label: 'Europe & UK', name: 'Europe & United Kingdom', tag: 'Audit-ready AI for regulated enterprise' },
  gulf: { label: 'Gulf & M.East', name: 'Gulf & Middle East', tag: 'Sovereign AI for regulated enterprise' },
  in: { label: 'India', name: 'India', tag: 'Accountable AI for regulated enterprise' },
  sg: { label: 'Singapore & SE Asia', name: 'Singapore & SE Asia', tag: 'Governed AI, built on trust' },
  au: { label: 'Australia & NZ', name: 'Australia & New Zealand', tag: 'Responsible AI you can stand behind' }
}

const RegionContext = createContext(null)

export function RegionProvider({ children }) {
  const [region, setRegionState] = useState(() => {
    return localStorage.getItem('certaintyai_region') || 'na'
  })

  function setRegion(key) {
    if (REGIONS[key]) {
      setRegionState(key)
      localStorage.setItem('certaintyai_region', key)
    }
  }

  const value = {
    region,
    setRegion,
    activeRegion: REGIONS[region]
  }

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider')
  return ctx
}
