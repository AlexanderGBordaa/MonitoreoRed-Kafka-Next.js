function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class KafkaSimulator {
  constructor(nodeIds = [], options = {}) {
    this.nodeIds = Array.isArray(nodeIds) ? nodeIds.slice() : [];
    this.minInterval = options.minInterval || 800;
    this.maxInterval = options.maxInterval || 1500;
    this.timer = null;
    this.subscribers = [];
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._scheduleNext();
  }

  stop() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  _scheduleNext() {
    if (!this.running) return;
    const ms = randInt(this.minInterval, this.maxInterval);
    this.timer = setTimeout(() => { this._tick(); this._scheduleNext(); }, ms);
  }

  publish(event) {
    this.subscribers.forEach(s => s(event));
  }

  subscribe(cb) {
    this.subscribers.push(cb);
    return () => { this.subscribers = this.subscribers.filter(x => x !== cb); };
  }

  _pickNode() {
    if (!this.nodeIds || this.nodeIds.length === 0) return null;
    const i = randInt(0, this.nodeIds.length - 1);
    return this.nodeIds[i];
  }

  _tick() {
    const eventsCount = randInt(0, 2);
    for (let i = 0; i < eventsCount; i++) {
      const nodeId = this._pickNode();
      if (!nodeId) continue;
      const r = Math.random();
      let type;
      if (r < 0.05) type = 'alarm';
      else if (r < 0.35) type = 'latency';
      else if (r < 0.7) type = 'connection';
      else type = 'status';

      let ev = { timestamp: Date.now(), nodeId };

      if (type === 'latency') {
        ev.type = 'metric';
        ev.latency = randInt(50, 500);
      } else if (type === 'connection') {
        ev.type = 'metric';
        ev.connections = randInt(0, 200);
      } else if (type === 'status') {
        ev.type = 'metric';
        const states = ['online', 'degraded', 'offline'];
        ev.state = states[randInt(0, states.length - 1)];
      } else if (type === 'alarm') {
        ev.type = 'alarm';
        const reasons = ['service_down', 'high_latency', 'packet_loss'];
        ev.reason = reasons[randInt(0, reasons.length - 1)];
        ev.description = `Simulated ${ev.reason}`;
        ev.severity = ['info','warning','critical'][randInt(0,2)];
      }

      this.publish(ev);
    }
  }
}

module.exports = KafkaSimulator;
