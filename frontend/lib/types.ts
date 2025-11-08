export type NodeState = {
  id: string
  name: string
  state: 'online' | 'degraded' | 'offline' | string
  connections: number
  latency: number
  lastUpdated: number
}

export type MetricEvent = {
  type: 'metric' | string
  timestamp: number
  nodeId: string
  nodeName?: string
  state?: string
  connections?: number
  latency?: number
}

export type AlarmEvent = {
  type?: 'alarm' | string
  timestamp: number
  nodeId: string
  nodeName?: string
  description?: string
  reason?: string
  severity?: 'critical' | 'warning' | 'info' | string
}

export type KafkaEvent = MetricEvent | AlarmEvent
