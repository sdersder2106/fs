const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { wsServer } = require('./lib/websocket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server
  wsServer.initialize(server);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log('> WebSocket server initialized');
  });
});
