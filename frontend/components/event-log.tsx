import React from 'react'
import type { AlarmEvent } from '../lib/types'

export default function EventLog({ logs, alarms }: { logs: string[], alarms: AlarmEvent[] }) {
  return (
    <section style={{ marginTop: 16 }}>
      <h3>Eventos recientes</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: 160, overflow: 'auto', background: '#111', color: '#0f0', padding: 8, borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}>
            {logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>

        <div style={{ width: 420 }}>
          <h4>Alarmas (últimas 50)</h4>
          <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
            {alarms.length === 0 && <div style={{ color: '#666' }}>No hay alarmas</div>}
            {alarms.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 4px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: 20, textAlign: 'center' }}>{a.severity === 'critical' ? '⛔' : (a.severity === 'warning' ? '⚠️' : 'ℹ️')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: a.severity === 'critical' ? '#b00' : (a.severity === 'warning' ? '#b65a00' : '#0066cc') }}>{a.type}</div>
                  <div style={{ fontSize: 12, color: '#444' }}>{a.nodeName} — {a.description}</div>
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>{new Date(a.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
