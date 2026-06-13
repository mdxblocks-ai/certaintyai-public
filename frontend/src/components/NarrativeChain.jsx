import React from 'react'
import NarrativeNode from './NarrativeNode'
import { NARRATIVE_CHAIN } from '../lib/branding'

export default function NarrativeChain({ nodes = NARRATIVE_CHAIN }) {
  return (
    <div className="max-w-3xl mx-auto space-y-0">
      {nodes.map((n, i) => (
        <NarrativeNode key={n.id} node={n} isLast={i === nodes.length - 1} />
      ))}
    </div>
  )
}
