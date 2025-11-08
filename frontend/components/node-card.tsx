import React from 'react'
import type { NodeState, AlarmEvent } from '../lib/types'

export default function NodeCard({ node, alarm }: { node: NodeState, alarm?: AlarmEvent }) {
  const stateColor = node.state === 'online' ? '#0a0' : (node.state === 'degraded' ? '#f39c12' : '#d00')
  return (
    <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
      <h4>{node.name}</h4>
      <div>Estado: <strong style={{ color: stateColor }}>{node.state}</strong></div>
      <div>Latencia: <strong>{node.latency} ms</strong></div>
      <div>Conexiones: <strong>{node.connections}</strong></div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Última: {new Date(node.lastUpdated).toLocaleTimeString()}</div>
      {alarm && <div style={{ marginTop: 8, color: '#b00', fontWeight: 700 }}>ALARM: {alarm.description || alarm.type}</div>}
    </div>
  )
}
