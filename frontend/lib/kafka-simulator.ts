import { io, Socket } from 'socket.io-client'
import type { KafkaEvent } from './types'

type Subscriber = { cb: (ev: KafkaEvent) => void, types?: string[] }

class KafkaClient {
  socket: Socket | null = null
  subscribers: Subscriber[] = []

  connect(url?: string) {
    if (this.socket) return
    const host = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:4000` : (url || 'http://localhost:4000')
    this.socket = io(host)
    this.socket.on('event', (ev: KafkaEvent) => this._notify(ev))
    this.socket.on('kafka_event', (ev: KafkaEvent) => this._notify(ev))
    this.socket.on('connect', () => console.log('KafkaClient connected'))
  }

  disconnect() {
    if (!this.socket) return
    this.socket.disconnect()
    this.socket = null
  }

  subscribe(cb: (ev: KafkaEvent) => void, opts?: { types?: string[] }) {
    const sub = { cb, types: opts?.types }
    this.subscribers.push(sub)
    return () => { this.subscribers = this.subscribers.filter(s => s !== sub) }
  }

  _notify(ev: KafkaEvent) {
    this.subscribers.forEach(s => {
      if (!s.types || s.types.length === 0) s.cb(ev)
      else if ((ev as any).type && s.types.includes((ev as any).type)) s.cb(ev)
    })
  }
}

const client = new KafkaClient()
export default client
