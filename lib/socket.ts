// lib/socket.ts
import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: any;
}

let io: Server | null = null;

export function getSocket(res: NextApiResponseWithSocket): Server {
  if (!res.socket.server.io) {
    console.log('[Socket] First socket initialization...');
    const httpServer: HTTPServer = res.socket.server;
    io = new Server(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: '*',
      },
    });

    // Setup socket events
    io.on('connection', socket => {
      console.log('📡 MizanTV connected:', socket.id);

      socket.on('join-room', (masjidId: string) => {
        socket.join(masjidId);
        console.log(`🔔 Device joined room: ${masjidId}`);
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
}
