import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { prisma } from '@/lib/db';

interface WebSocketMessage {
  type: string;
  channel: string;
  masjidId?: string;
  display?: any;
  template?: any;
}

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message);

        switch (data.type) {
          case 'subscribe':
            if (data.channel === 'displays' && data.masjidId) {
              // Subscribe to display updates for a specific masjid
              const displays = await prisma.tVDisplay.findMany({
                where: { masjidId: data.masjidId },
              });
              ws.send(JSON.stringify({
                type: 'displays_update',
                displays,
              }));
            }
            break;

          case 'display_status':
            if (data.display) {
              // Broadcast display status update to all clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'display_update',
                    display: data.display,
                  }));
                }
              });
            }
            break;

          case 'template_update':
            if (data.template) {
              // Broadcast template update to all clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'template_update',
                    template: data.template,
                  }));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
}

// Helper function to broadcast updates to all connected clients
export function broadcastUpdate(wss: WebSocketServer, type: string, data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type,
        ...data,
      }));
    }
  });
} 