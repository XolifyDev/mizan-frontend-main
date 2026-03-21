import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createSocketIOServer } from './lib/socketio/server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url!, true);
      
      // Handle Socket.IO requests
      if (parsedUrl.pathname?.startsWith('/socket.io/')) {
        // Let Socket.IO handle these requests
        return;
      }

      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Create Socket.IO server
  const io = createSocketIOServer(server);

  // Start the server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on ws://${hostname}:${port}`);
  });
}); 