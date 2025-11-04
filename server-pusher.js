const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Plus de WebSocket - Utilisation de Pusher maintenant
  console.log('> Starting server with Pusher real-time support');
  
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log('> Real-time features powered by Pusher');
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
