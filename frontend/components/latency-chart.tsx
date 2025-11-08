"use client"
import React from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import type { NodeState } from '../lib/types'

export default function LatencyChart({ data, nodes }: { data: any[], nodes: Record<string, NodeState> }) {
  const colorPalette = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b']
  const nodeIds = Object.keys(nodes)
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 'dataMax + 50']} />
          <Tooltip />
          <Legend />
          {nodeIds.map((id, idx) => (
            <Line key={id} type="monotone" dataKey={id} stroke={colorPalette[idx % colorPalette.length]} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
