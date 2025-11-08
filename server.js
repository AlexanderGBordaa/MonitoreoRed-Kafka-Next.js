const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const KafkaSimulator = require('./kafka_simulator');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4000;

// Nodes state
const NODES = 5;
const nodes = {};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

const STATES = ['online', 'degraded', 'offline'];

for (let i = 1; i <= NODES; i++) {
  const initialState = 'online';
  const latency = randInt(50, 200);
  nodes[`node-${i}`] = {
    id: `node-${i}`,
    name: `Nodo ${i}`,
    state: initialState,
    connections: randInt(5, 120),
    latency,
    lastUpdated: Date.now()
  };
}

let kafkaSim = null;
const useKafkaSimulator = String(process.env.USE_KAFKA_SIMULATOR || 'true').toLowerCase() === 'true';
if (useKafkaSimulator) {
  const nodeIds = Object.keys(nodes);
  kafkaSim = new KafkaSimulator(nodeIds, { interval: 1000 });
  kafkaSim.start();
  kafkaSim.subscribe(ev => {
    const node = nodes[ev.nodeId];
    const enriched = Object.assign({}, ev, { nodeName: node && node.name });
    io.emit('kafka_event', enriched);
    console.log('KafkaSimulator ->', ev.type, ev.nodeId, ev.data || '');
  });
}

function emitEvent(event) {
  io.emit('event', event);
}

// Periodically update metrics and emit events
setInterval(() => {
  const now = Date.now();
  Object.values(nodes).forEach(n => {
    if (n.state === 'online') {
      if (Math.random() < 0.05) n.state = 'degraded';
      else if (Math.random() < 0.01) n.state = 'offline';
    } else if (n.state === 'degraded') {
      if (Math.random() < 0.2) n.state = 'online';
      else if (Math.random() < 0.1) n.state = 'offline';
    } else if (n.state === 'offline') {
      if (Math.random() < 0.15) n.state = 'degraded';
      else if (Math.random() < 0.05) n.state = 'online';
    }

    let baseLatency = n.latency || 100;
    const drift = Math.round((Math.random() * 2 - 1) * 50);
    if (n.state === 'online') baseLatency += drift;
    else if (n.state === 'degraded') baseLatency += Math.abs(drift) + 50;
    else baseLatency += Math.abs(drift) + 150;
    n.latency = clamp(baseLatency, 50, 500);

    if (typeof n.connections !== 'number') n.connections = randInt(1, 50);
    n.connections = clamp(Math.round(n.connections * (1 + (Math.random() * 0.6 - 0.3))), 0, 2000);

    n.lastUpdated = now;

    const event = {
      type: 'metric',
      nodeId: n.id,
      nodeName: n.name,
      timestamp: now,
      state: n.state,
      connections: n.connections,
      latency: n.latency,
      lastUpdated: n.lastUpdated
    };

    emitEvent(event);
  });
}, 1000);

app.get('/api/nodes', (req, res) => {
  res.json({ nodes });
});

io.on('connection', socket => {
  console.log('Client connected', socket.id);
  socket.emit('snapshot', { nodes });
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
