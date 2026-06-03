import React, { useState } from 'react'

const ALL_CAPS = [
  "Policy & Audit",
  "W3C Semantics",
  "GraphRAG",
  "MCP-Ready",
  "Human-in-the-loop",
  "Lineage Tracking"
]

const ARCH_LAYERS = [
  {
    id: "agent",
    n: "06",
    t: "AI Agent Orchestrator",
    side: "r",
    col: ["#C77A57", "#9E5234"],
    edge: "#E6A77E",
    glowColor: "rgba(199, 122, 87, 0.15)",
    biz: "Coordinates AI agents to get work done — safely, under your policies.",
    tech: "Multi-Agent Orchestration & Constraint Mesh",
    badge: "Reasoning & Plan Mesh",
    caps: ["GraphRAG", "MCP-Ready", "Human-in-the-loop"],
    components: [
      { name: "Multi-Agent Router", desc: "Intelligent query classification and routing" },
      { name: "Context Assembly Window", desc: "Dynamic prompt & session state stitching" },
      { name: "State Tracking Ledger", desc: "Conversation memory & agent state machine" },
      { name: "Reasoning Flow Validator", desc: "Output audits and hallucination check gates" },
      { name: "MCP Agent Tool Interface", desc: "Exposes reasoning agents as standard Model Context Protocol (MCP) tools" }
    ]
  },
  {
    id: "governance",
    n: "05",
    t: "Governance Layer",
    side: "l",
    col: ["#D8B061", "#A87C2E"],
    edge: "#F2D88E",
    glowColor: "rgba(216, 176, 97, 0.25)",
    biz: "Policy, compliance and audit — plugs into the governance catalog you already run.",
    tech: "Policy Engine · Purview / OpenMetadata / Collibra / Alation / Dataplex adapters",
    badge: "Active Policy & Data Integration",
    accent: true,
    caps: ["Policy & Audit", "Human-in-the-loop", "Lineage Tracking", "MCP-Ready"],
    components: [
      { name: "Active Policy Engine", desc: "Automated compliance framework rule enforcement" },
      { name: "Audit Logging Service", desc: "Verifiable log database for reasoning trails" },
      { name: "Microsoft Purview Adapter", desc: "Bi-directional catalog sync with Azure Purview" },
      { name: "Collibra Connector", desc: "Enterprise glossary and governance platform linkage" },
      { name: "Alation Connector", desc: "Data steward catalog search and metadata mapping" },
      { name: "Google Dataplex Adapter", desc: "GCP-native metadata tracking and asset scanning" }
    ]
  },
  {
    id: "certainty",
    n: "04",
    t: "CertaintyAI Reasoning",
    side: "r",
    col: ["#A8506A", "#79384E"],
    edge: "#D78AA4",
    glowColor: "rgba(168, 80, 106, 0.15)",
    biz: "Trust, safety and a confidence score on every answer it gives.",
    tech: "Trust & Safety Engine · Confidence Scoring",
    badge: "Trust & Safety Engine",
    caps: ["GraphRAG", "Human-in-the-loop", "Policy & Audit"],
    components: [
      { name: "Compliance Guardrails", desc: "Real-time compliance policy checks" },
      { name: "Hallucination Detector", desc: "Cross-references LLM outputs against ontology" },
      { name: "Evidence Pack Builder", desc: "Compiles reasoning lineage and provenance" },
      { name: "Risk Mitigation Evaluator", desc: "Real-time security threat vector profiling" },
      { name: "Audit Trail Database", desc: "Cryptographically signs validation logs" }
    ]
  },
  {
    id: "ontology",
    n: "03",
    t: "Ontology Layer",
    side: "l",
    col: ["#2F7D6B", "#1E5448"],
    edge: "#5FB5A1",
    glowColor: "rgba(47, 125, 107, 0.15)",
    biz: "The trusted model of your business — meaning, relationships and rules AI can reason over.",
    tech: "Semantic Domain Intelligence Fabric",
    badge: "Semantic Domain Intelligence Fabric",
    caps: ["W3C Semantics", "GraphRAG", "Lineage Tracking"],
    components: [
      { name: "Domain Vocabulary", desc: "Glossary & Business Terms" },
      { name: "Object Types", desc: "Entities & Concepts" },
      { name: "Properties", desc: "Attributes & Data Elements" },
      { name: "Relationships (Links)", desc: "Semantic Relationships" },
      { name: "Business Rules", desc: "Logic, Constraints, Policies" },
      { name: "Taxonomies & Standards", desc: "SNOMED, LOINC, ICD-10, RxNorm, ISO, NIST, etc." },
      { name: "Contexts & Scopes", desc: "Time, Geography, Organization" },
      { name: "Versioning & Governance", desc: "Change Mgmt, Approval" }
    ]
  },
  {
    id: "infrastructure",
    n: "02",
    t: "Data & Cloud Infrastructure",
    side: "r",
    col: ["#3A7E92", "#235461"],
    edge: "#6FB3C6",
    glowColor: "rgba(58, 126, 146, 0.15)",
    biz: "Connects to your data wherever it lives — no rip-and-replace.",
    tech: "Federated Multi-Cloud Data Engines",
    badge: "Federated Database & Storage Foundation",
    caps: ["MCP-Ready", "Lineage Tracking"],
    components: [
      { name: "Snowflake Integration", desc: "Analytical cloud data warehousing and GraphRAG context mapping" },
      { name: "Oracle Database Sync", desc: "High-throughput transactional ledger ingestion gates" },
      { name: "Teradata Analytics", desc: "Enterprise analytical data warehousing semantic stitching" },
      { name: "IBM DB2 & Mainframe", desc: "Legacy enterprise ledger secure access adapters" },
      { name: "SAP ERP Connections", desc: "Real-time operational resource and supply chain ledger parsing" },
      { name: "Microsoft Azure Fabric", desc: "Federated cloud data storage and compliance mapping" },
      { name: "Amazon Web Services (S3)", desc: "High-scale unstructured document and media repository streams" },
      { name: "Google Cloud Storage", desc: "Secure multi-cloud storage and global data streams" }
    ]
  },
  {
    id: "datasources",
    n: "01",
    t: "Data Sources",
    side: "l",
    col: ["#3B6688", "#244258"],
    edge: "#6B98BC",
    glowColor: "rgba(59, 102, 136, 0.15)",
    biz: "Everything you already run — cloud, on-prem, structured and unstructured.",
    tech: "Enterprise, Unstructured, External, Cloud",
    badge: "Heterogeneous Core Feeds",
    caps: ["MCP-Ready"],
    components: [
      { name: "Enterprise Systems", desc: "Structured EHR, LMS, CRM, ERP, and relational databases" },
      { name: "Unstructured Data", desc: "PDFs, SOAP notes, support emails, dictations, and scans" },
      { name: "External Data", desc: "OpenAI, Anthropic APIs, Ollama local weight models, public data" },
      { name: "Cloud Data Sources", desc: "S3, BigQuery, Snowflake, IoT streams, and edge telemetry" }
    ]
  }
]

export default function ArchitectureStack() {
  const [archMode, setArchMode] = useState('business')
  const [archIdx, setArchIdx] = useState(1) // Governance Layer (index 1) default
  const [archLock, setArchLock] = useState(false)

  const activeLayer = ARCH_LAYERS[archIdx]

  const cx = 500
  const hw = 82
  const hh = 38
  const bevel = 15
  const ys = [120, 210, 300, 390, 480, 570]

  const topLayerColor = activeLayer.edge

  return (
    <div className="w-full rounded-3xl bg-[#1E3A36] text-[#F4F0E6] p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300 border border-[#2F7D6B]/30 select-none">
      
      {/* 1. Dynamic Glowing Backdrop aligned to active layer */}
      <div 
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-[300px] w-[500px] rounded-full blur-3xl opacity-40 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${activeLayer.glowColor} 0%, transparent 80%)`
        }}
      />

      {/* 2. TOP PORTION: Centered 3D Isometric Stack Canvas */}
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col justify-center">
        
        {/* Eyebrow stack status info */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8B061] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D8B061]"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#ECE5D6]/80">
              Active Open Architecture Stack
            </span>
          </div>
          <span className="text-[11px] text-[#ECE5D6]/60 font-medium">
            {archLock ? (
              <span className="text-[#D8B061] flex items-center gap-1">
                🔒 View locked · click same layer to release
              </span>
            ) : (
              "Click a layer to lock view"
            )}
          </span>
        </div>

        {/* User Toggle Row */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-[#ECE5D6]/10 border border-[#ECE5D6]/20 rounded-full p-1">
            <button 
              onClick={() => setArchMode('business')}
              className={`font-sans font-bold text-xs py-1.5 px-4 rounded-full transition duration-200 flex items-center gap-1.5 ${
                archMode === 'business' ? 'bg-[#D8B061] text-[#1E3A36]' : 'text-[#ECE5D6]/70 hover:text-white'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Business Users
            </button>
            <button 
              onClick={() => setArchMode('technical')}
              className={`font-sans font-bold text-xs py-1.5 px-4 rounded-full transition duration-200 flex items-center gap-1.5 ${
                archMode === 'technical' ? 'bg-[#D8B061] text-[#1E3A36]' : 'text-[#ECE5D6]/70 hover:text-white'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
              </svg>
              Technical Users
            </button>
          </div>
        </div>

        {/* The 3D SVG Canvas */}
        <svg
          viewBox="0 0 1000 680"
          className="w-full h-auto overflow-visible transition-transform duration-500 hover:scale-[1.01]"
        >
          {/* Central Wireframe Crystal Column */}
          <g stroke="rgba(244,240,230,.16)" strokeWidth="1" fill="none">
            <polygon points="500,48 615,84 500,120 385,84"/>
            <polygon points="500,580 615,616 500,652 385,616"/>
            <line x1="385" y1="84" x2="385" y2="616"/>
            <line x1="615" y1="84" x2="615" y2="616"/>
            <line x1="500" y1="120" x2="500" y2="652"/>
            <line x1="500" y1="48" x2="500" y2="580"/>
          </g>

          {/* Dotted data-flow path */}
          <path 
            d="M 358,565 C 296,470 296,310 392,255" 
            fill="none" 
            stroke="#D8B061" 
            strokeWidth="1.6"
            strokeOpacity="0.55" 
            strokeDasharray="5 8" 
            strokeLinecap="round"
          >
            <animate attributeName="stroke-dashoffset" values="70;0" dur="2.4s" repeatCount="indefinite"/>
          </path>

          {/* Render Crystal Plates */}
          {ARCH_LAYERS.map((l, i) => {
            const cy = ys[i]
            const isActive = i === archIdx
            const isDimmed = !isActive && archIdx >= 0
            const cls = isActive ? 'act' : (isDimmed ? 'dim' : '')
            
            const topPoints = `${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}`
            const botPoints = `${cx-hw},${cy} ${cx},${cy+hh} ${cx+hw},${cy} ${cx},${cy+hh+bevel}`
            
            const subText = archMode === 'business' ? l.biz : l.tech

            // Leader Line
            let leader, labelX, anchor
            if (l.side === 'r') {
              leader = (
                <line 
                  x1={cx+hw} y1={cy} 
                  x2={700} y2={cy} 
                  stroke="#D8B061" strokeOpacity={isActive ? 0.8 : 0.25} 
                  strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round"
                />
              )
              labelX = 708
              anchor = 'start'
            } else {
              leader = (
                <line 
                  x1={cx-hw} y1={cy} 
                  x2={300} y2={cy} 
                  stroke="#D8B061" strokeOpacity={isActive ? 0.8 : 0.25} 
                  strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round"
                />
              )
              labelX = 292
              anchor = 'end'
            }

            const titleCol = isActive ? '#F4F0E6' : 'rgba(244,240,230,.82)'
            const subCol = isActive ? l.edge : 'rgba(244,240,230,.45)'

            return (
              <g 
                key={l.id} 
                className={`alayer cursor-pointer transition-opacity duration-300 ${cls}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (archLock && archIdx === i) {
                    setArchLock(false)
                  } else {
                    setArchIdx(i)
                    setArchLock(true)
                  }
                }}
                onMouseEnter={() => {
                  if (!archLock) setArchIdx(i)
                }}
                style={{
                  opacity: isActive ? 1.0 : (isDimmed ? 0.35 : 0.85)
                }}
              >
                {leader}
                {/* 3D bottom faces */}
                <polygon points={botPoints} fill={l.col[1]} opacity="0.9" />
                {/* 3D top face */}
                <polygon 
                  points={topPoints} 
                  fill={l.col[0]} 
                  stroke={l.edge} 
                  strokeWidth={l.accent ? 2.5 : 1.1} 
                  strokeOpacity="0.95" 
                />
                {/* Highlights */}
                <polygon points={`${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy} ${cx-hw},${cy}`} fill="#FFFFFF" opacity="0.10" />
                <circle cx={cx} cy={cy} r="5" fill="#FBF6EC" opacity="0.95" />
                
                {/* Labels */}
                <text 
                  x={labelX} y={cy-2} 
                  textAnchor={anchor} 
                  fontFamily="'Hanken Grotesk',sans-serif" 
                  fontSize="15" 
                  fontWeight="700" 
                  fill={titleCol} 
                  letterSpacing="0.04em"
                >
                  {l.t.toUpperCase()}
                </text>
                <text 
                  x={labelX} y={cy+15} 
                  textAnchor={anchor} 
                  fontFamily="'Hanken Grotesk',sans-serif" 
                  fontSize="11.5" 
                  fontWeight="600" 
                  fill={subCol}
                >
                  {subText}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 3. BOTTOM PORTION: Active Layer Inspect details & component grids */}
      <div className="w-full relative transition-all duration-500 mt-6 pt-6 border-t border-[#ECE5D6]/12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-[#ECE5D6]/10 bg-[#1E3A36]/80 text-[#D8B061] shadow-md transition-colors duration-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#ECE5D6]/50 block">
                {activeLayer.badge}
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight leading-none mt-1 font-serif-brand">
                {activeLayer.t}
              </h3>
            </div>
          </div>
          <p className="text-xs text-[#ECE5D6]/80 leading-relaxed md:max-w-md">
            {archMode === 'business' ? activeLayer.biz : activeLayer.tech}
          </p>
        </div>

        {/* Dynamic components grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeLayer.components.map((comp, idx) => (
            <div 
              key={idx}
              className="flex flex-col p-4 rounded-xl border border-[#ECE5D6]/10 bg-[#ECE5D6]/5 hover:bg-[#ECE5D6]/10 hover:border-[#D8B061]/50 transition-all duration-300"
            >
              <h4 className="text-xs font-bold text-white mb-1">
                {comp.name}
              </h4>
              <p className="text-[10.5px] text-[#ECE5D6]/70 leading-snug">
                {comp.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Active Layer inspect footer */}
        <div className="mt-8 pt-4 border-t border-[#ECE5D6]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10.5px] text-[#ECE5D6]/50">
          <div className="flex items-center gap-2">
            <span>Active Layer Inspect:</span>
            <strong className="font-bold text-[#D8B061] transition-colors">{activeLayer.t}</strong>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_CAPS.map(c => {
              const isOn = activeLayer.caps.includes(c)
              return (
                <span 
                  key={c} 
                  className={`px-2.5 py-0.5 rounded-full border text-[9px] font-semibold select-none transition-colors duration-300 ${
                    isOn 
                      ? 'border-[#D8B061] bg-[#D8B061]/10 text-[#D8B061]' 
                      : 'border-[#ECE5D6]/10 bg-transparent text-[#ECE5D6]/30'
                  }`}
                >
                  {c}
                </span>
              )
            })}
          </div>

          <span className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7E9A5A] animate-pulse" /> 
            Live Stack Synced
          </span>
        </div>
      </div>
    </div>
  )
}
