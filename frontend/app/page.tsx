'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { io } from 'socket.io-client'
import type { NodeState, AlarmEvent, KafkaEvent, MetricEvent } from '../lib/types'

const StatsOverview = dynamic(() => import('../components/stats-overview'), { ssr: false })
const LatencyChart = dynamic(() => import('../components/latency-chart'), { ssr: false })
const NodeCard = dynamic(() => import('../components/node-card'), { ssr: false })
const EventLog = dynamic(() => import('../components/event-log'), { ssr: false })

export default function Page() {
  const [nodes, setNodes] = useState<Record<string, NodeState>>({})
  const [alarms, setAlarms] = useState<AlarmEvent[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [latencyData, setLatencyData] = useState<any[]>([])

  useEffect(() => {
    const host = 'http://localhost:4000'
    const socket = io(host, { transports: ['websocket', 'polling'] })

    socket.on('connect', () => addLog('Conectado al backend'))
    socket.on('disconnect', () => addLog('Desconectado del backend'))

    socket.on('snapshot', ({ nodes: initialNodes }) => setNodes(initialNodes))

    socket.on('event', (ev: KafkaEvent) => {
      if (ev.type === 'alarm') handleAlarm(ev as AlarmEvent)
      else handleMetric(ev as MetricEvent)
    })

    socket.on('kafka_event', (ev: KafkaEvent) => {
      if (ev.type === 'alarm') handleAlarm(ev as AlarmEvent)
      else handleMetric(ev as MetricEvent)
    })

    return () => { socket.disconnect() }
  }, [])

  const addLog = (msg: string) => {
    const now = new Date().toLocaleTimeString()
    setLogs(prev => [`[${now}] ${msg}`, ...prev].slice(0, 200))
  }

  const handleAlarm = (alarm: AlarmEvent) => {
    addLog(`Alarma en ${alarm.nodeName || alarm.nodeId}: ${alarm.description || alarm.type}`)
    setAlarms(prev => [alarm, ...prev].slice(0, 50))
  }

  const handleMetric = (ev: MetricEvent) => {
    if (!ev.nodeId) return
    setNodes(prev => ({
      ...prev,
      [ev.nodeId]: {
        id: ev.nodeId,
        name: ev.nodeName || ev.nodeId,
        state: ev.state || prev[ev.nodeId]?.state || 'online',
        connections: ev.connections ?? prev[ev.nodeId]?.connections ?? 0,
        latency: ev.latency ?? prev[ev.nodeId]?.latency ?? 0,
        lastUpdated: ev.timestamp || Date.now()
      }
    }))

    if (typeof ev.latency === 'number') {
      const time = new Date().toLocaleTimeString()
      setLatencyData(prev => [...prev, { time, [ev.nodeId]: ev.latency }].slice(-20))
    }
  }

  const stats = {
    totalActive: Object.values(nodes).filter(n => n.state !== 'offline').length,
    avgLatency: Math.round(Object.values(nodes).reduce((s, n) => s + (n.latency || 0), 0) / (Object.keys(nodes).length || 1)),
    totalConnections: Object.values(nodes).reduce((s, n) => s + (n.connections || 0), 0),
    alarmsCount: alarms.length
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Monitor de Nodos</h1>
      <StatsOverview stats={stats} />
      <div style={{ marginBottom: 12 }}>
        <LatencyChart data={latencyData} nodes={nodes} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 12 }}>
        {Object.keys(nodes).length === 0 ? (
          <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>Cargando nodos...</div>
        ) : (
          Object.values(nodes).map(node => (
            <NodeCard key={node.id} node={node} alarm={alarms.find(a => a.nodeId === node.id)} />
          ))
        )}
      </div>

      <EventLog logs={logs} alarms={alarms} />
    </main>
  )
}
