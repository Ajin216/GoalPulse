const WebSocket = require('ws');
const cache = require('./cache');

function setupWsServer(server) {
  const wss = new WebSocket.Server({ server, path: '/live' });

  wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send immediate snapshot on connect
    const fullState = cache.get();
    ws.send(JSON.stringify({
      type: 'SNAPSHOT_FULL',
      payload: fullState,
      updatedAt: new Date().toISOString()
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'PING') {
          ws.isAlive = true;
        }
      } catch (e) {
        // Ignore invalid messages
      }
    });
  });

  // Heartbeat to drop dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // Broadcast function for poller to call
  function broadcastUpdate(type, payload) {
    const message = JSON.stringify({
      type,
      payload,
      updatedAt: new Date().toISOString()
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return { wss, broadcastUpdate };
}

module.exports = { setupWsServer };
