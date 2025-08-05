import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Store connections in memory (will be reset on cold starts)
const connections = new Map<string, ReadableStreamDefaultController>();
const deviceConnections = new Map<string, { controller: ReadableStreamDefaultController; deviceId?: string; masjidId?: string; isAdmin?: boolean }>();
const adminConnections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');
  const masjidId = searchParams.get('masjidId');
  const isAdmin = searchParams.get('isAdmin') === 'true';

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      console.log('SSE connection established');
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        message: 'SSE connection established'
      })}\n\n`);

      // Store connection
      if (deviceId) {
        deviceConnections.set(deviceId, { controller, deviceId, masjidId, isAdmin });
      } else if (isAdmin && masjidId) {
        adminConnections.add(controller);
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('SSE connection closed');
        handleClientDisconnect(controller);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

function handleClientDisconnect(controller: ReadableStreamDefaultController) {
  // Remove from admin connections
  adminConnections.delete(controller);

  // Remove from device connections
  for (const [deviceId, connection] of deviceConnections.entries()) {
    if (connection.controller === controller) {
      deviceConnections.delete(deviceId);
      
      // Notify admins of device disconnect
      broadcastToAdmins({
        type: 'device_disconnected',
        deviceId,
        masjidId: connection.masjidId
      });
      break;
    }
  }
}

function broadcastToAdmins(message: any) {
  adminConnections.forEach(controller => {
    try {
      controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
    } catch (error) {
      console.error('Failed to send message to admin:', error);
    }
  });
}

function broadcastToMasjidDevices(masjidId: string, message: any) {
  deviceConnections.forEach((connection, deviceId) => {
    if (connection.masjidId === masjidId) {
      try {
        connection.controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        console.error('Failed to send message to device:', error);
      }
    }
  });
}

// POST endpoint for sending messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, deviceId, masjidId, message, data } = body;

    switch (type) {
      case 'device_register':
        // Handle device registration
        console.log('Device registered:', deviceId);
        broadcastToAdmins({
          type: 'device_connected',
          deviceId,
          masjidId,
          deviceInfo: data
        });
        break;

      case 'device_status_update':
        // Handle device status update
        console.log('Device status updated:', deviceId);
        broadcastToAdmins({
          type: 'device_status_changed',
          deviceId,
          status: data.status,
          lastSeen: data.lastSeen,
          networkStatus: data.networkStatus
        });
        break;

      case 'admin_broadcast':
        // Handle admin broadcast
        console.log('Admin broadcast:', masjidId);
        broadcastToMasjidDevices(masjidId, {
          type: 'broadcast_message',
          message: message,
          messageType: data?.type || 'info'
        });
        break;

      case 'admin_device_control':
        // Handle admin device control
        console.log('Admin device control:', deviceId);
        const deviceConnection = deviceConnections.get(deviceId);
        if (deviceConnection) {
          try {
            deviceConnection.controller.enqueue(`data: ${JSON.stringify({
              type: 'admin_control',
              action: data.action,
              data: data.data
            })}\n\n`);
          } catch (error) {
            console.error('Failed to send control command:', error);
          }
        }
        break;

      default:
        console.log('Unknown message type:', type);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST error:', error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 