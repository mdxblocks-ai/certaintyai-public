import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { nodes as allNodes, links as allLinks } from '../lib/ontologyData'

const DOMAIN_COLORS = {
  core:          '#22D3EE', // cyan-400
  healthcare:    '#F472B6', // pink-400
  education:     '#FBBF24', // amber-400
  cybersecurity: '#EF4444', // red-500
  finops:        '#34D399', // emerald-400
  itconsulting:  '#A78BFA', // violet-400
  bfsi:          '#38BDF8', // sky-400 — Banking & Finance
}

const HEIGHT = 500

// Per-node radius — the central ontology node is drawn larger so it reads
// as the hub at a glance.
const radiusFor = (node) => (node.domain === 'core' ? 10 : 6)

// Phase 1.5.9 — Accepts an optional `graphData` prop driven by the parent
// (so an industry picker can filter the visible cluster). If no graphData
// is provided, falls back to the full multi-domain graph from ontologyData.
// The parent should pass `key={selectedDomain}` to force a clean remount
// + force-simulation restart when the filter changes.
export default function OntologyGraph({ graphData: graphDataProp }) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)
  const [width, setWidth] = useState(0)

  // Track the container width so the canvas resizes with the layout.
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.floor(entry.contentRect.width))
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Freeze graphData identity across renders. react-force-graph mutates
  // the node and link objects (adding x/y/vx/vy and resolving source/target
  // refs); re-creating the arrays each render would re-seed the simulation.
  const [graphData] = useState(() => {
    if (graphDataProp) {
      return {
        nodes: graphDataProp.nodes.map((n) => ({ ...n })),
        links: graphDataProp.links.map((l) => ({ ...l })),
      }
    }
    return {
      nodes: allNodes.map((n) => ({ ...n })),
      links: allLinks.map((l) => ({ ...l })),
    }
  })

  // When the layout settles, zoom the camera so every node is visible
  // (default force layout scatters nodes well beyond the visible canvas).
  const handleEngineStop = () => {
    fgRef.current?.zoomToFit(400, 40)
  }

  // Re-fit on width changes (e.g. window resize, hero column reflow).
  useEffect(() => {
    if (width === 0) return
    const t = setTimeout(() => fgRef.current?.zoomToFit(300, 40), 150)
    return () => clearTimeout(t)
  }, [width])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden"
      style={{ height: HEIGHT }}
    >
      {width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={HEIGHT}
          graphData={graphData}
          onEngineStop={handleEngineStop}
          backgroundColor="rgba(0,0,0,0)"
          linkColor={() => '#334155'}
          linkWidth={1}
          cooldownTicks={120}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          nodeLabel={(node) => `${node.label} • ${node.domain}`}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const r = radiusFor(node)
            ctx.beginPath()
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false)
            ctx.fillStyle = DOMAIN_COLORS[node.domain] || '#cbd5e1'
            ctx.fill()
            ctx.lineWidth = 1.5
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)'
            ctx.stroke()

            const fontSize = 11 / globalScale
            ctx.font = `${fontSize}px Inter, system-ui, -apple-system, sans-serif`
            ctx.fillStyle = '#E2E8F0'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(node.label, node.x, node.y + r + 2)
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.beginPath()
            ctx.arc(node.x, node.y, radiusFor(node) + 4, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
          }}
        />
      )}
    </div>
  )
}
