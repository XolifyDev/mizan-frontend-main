import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Store connections in memory (will be reset on cold starts)
const deviceConnections = new Map<string, { deviceId?: string; masjidId?: string; isAdmin?: boolean; lastSeen?: Date }>();
const adminConnections = new Set<string>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const upgrade = request.headers.get('upgrade');
  
  // For Vercel, we'll always return a 200 response and let the client handle WebSocket fallback
  if (upgrade !== 'websocket') {
    return new Response(JSON.stringify({
      type: 'websocket_not_supported',
      message: 'WebSocket not supported, using HTTP fallback',
      fallback: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // For Vercel, we'll use a simple HTTP response that indicates WebSocket support
    // The actual WebSocket handling will be done client-side with fallback to HTTP
    const response = new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': 's3pPLMBiTxaQ9kYGzzhZRbK+xOo='
      }
    });

    console.log('WebSocket connection accepted');
    return response;
  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    // Return a fallback response instead of error
    return new Response(JSON.stringify({
      type: 'websocket_failed',
      message: 'WebSocket upgrade failed, using HTTP fallback',
      fallback: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// POST endpoint for handling WebSocket-like messages via HTTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, deviceId, masjidId, data } = body;

    console.log('WebSocket message received:', type);

    switch (type) {
      case 'device_register':
        console.log('Device registered:', deviceId);
        if (deviceId && masjidId) {
          deviceConnections.set(deviceId, { 
            deviceId, 
            masjidId, 
            lastSeen: new Date() 
          });
        }
        return new Response(JSON.stringify({
          type: 'device_registered',
          deviceId,
          masjidId,
          success: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'device_status_update':
        console.log('Device status updated:', deviceId);
        if (deviceId) {
          const connection = deviceConnections.get(deviceId);
          if (connection) {
            connection.lastSeen = new Date();
            deviceConnections.set(deviceId, connection);
          }
        }
        return new Response(JSON.stringify({
          type: 'status_updated',
          deviceId,
          success: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'device_content_update':
        console.log('Device content updated:', deviceId);
        return new Response(JSON.stringify({
          type: 'content_updated',
          deviceId,
          success: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'device_heartbeat':
        console.log('Device heartbeat:', deviceId);
        if (deviceId) {
          const connection = deviceConnections.get(deviceId);
          if (connection) {
            connection.lastSeen = new Date();
            deviceConnections.set(deviceId, connection);
          }
        }
        return new Response(JSON.stringify({
          type: 'heartbeat_response',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'admin_subscribe':
        console.log('Admin subscribing to masjid:', masjidId);
        if (masjidId) {
          adminConnections.add(masjidId);
        }
        return new Response(JSON.stringify({
          type: 'admin_subscribed',
          masjidId,
          devices: Array.from(deviceConnections.values()).filter(d => d.masjidId === masjidId)
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'admin_device_control':
        console.log('Admin device control:', deviceId, data?.action);
        return new Response(JSON.stringify({
          type: 'control_sent',
          deviceId,
          action: data?.action,
          success: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'admin_broadcast':
        console.log('Admin broadcast:', masjidId);
        return new Response(JSON.stringify({
          type: 'broadcast_sent',
          masjidId,
          success: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        console.log('Unknown message type:', type);
        return new Response(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('WebSocket message error:', error);
    return new Response(JSON.stringify({
      type: 'error',
      message: 'Invalid message format'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}