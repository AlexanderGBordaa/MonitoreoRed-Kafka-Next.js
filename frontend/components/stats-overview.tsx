import React from 'react'

export default function StatsOverview({ stats }: { stats: { totalActive: number, avgLatency: number, totalConnections: number, alarmsCount: number } }) {
  return (
    <section style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
        <div style={{ fontSize: 12, color: '#666' }}>Nodos activos</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.totalActive}</div>
      </div>
      <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
        <div style={{ fontSize: 12, color: '#666' }}>Latencia media (ms)</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.avgLatency}</div>
      </div>
      <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
        <div style={{ fontSize: 12, color: '#666' }}>Conexiones totales</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.totalConnections}</div>
      </div>
      <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
        <div style={{ fontSize: 12, color: '#666' }}>Alarmas activas</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#d00' }}>{stats.alarmsCount}</div>
      </div>
    </section>
  )
}
