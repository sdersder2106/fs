const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

// Check if WebSocket should be disabled
const DISABLE_WEBSOCKET = process.env.DISABLE_WEBSOCKET === 'true' || 
                          process.env.RAILWAY_ENVIRONMENT || 
                          process.env.RAILWAY_PUBLIC_DOMAIN;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server ONLY if not disabled
  if (!DISABLE_WEBSOCKET) {
    try {
      const { wsServer } = require('./lib/websocket');
      wsServer.initialize(server);
      console.log('> WebSocket server initialized');
    } catch (error) {
      console.log('> WebSocket initialization skipped:', error.message);
    }
  } else {
    console.log('> WebSocket disabled for this deployment');
  }

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    if (DISABLE_WEBSOCKET) {
      console.log('> Running without WebSocket support (Railway mode)');
    }
  });
});
