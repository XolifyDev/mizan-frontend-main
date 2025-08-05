import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Store connections in memory (will be reset on cold starts)
const connections = new Map<string, WebSocket>();
const deviceConnections = new Map<string, { ws: WebSocket; deviceId?: string; masjidId?: string; isAdmin?: boolean }>();
const adminConnections = new Set<WebSocket>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const upgrade = request.headers.get('upgrade');
  
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket', { status: 400 });
  }

  try {
    // Use the WebSocket API that's available in Edge Runtime
    const { socket, response } = (request as any).webSocket;
    
    console.log('WebSocket connection established');
    
    // Handle WebSocket connection
    socket.onopen = () => {
      console.log('WebSocket opened');
      socket.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established'
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data.type);
        
        await handleWebSocketMessage(socket, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      handleClientDisconnect(socket);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      handleClientDisconnect(socket);
    };

    return response;
  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}

async function handleWebSocketMessage(socket: WebSocket, data: any) {
  const connection = { ws: socket };
  
  switch (data.type) {
    case 'device_register':
      await handleDeviceRegister(socket, data, connection);
      break;
      
    case 'device_status_update':
      await handleDeviceStatusUpdate(socket, data, connection);
      break;
      
    case 'device_heartbeat':
      await handleDeviceHeartbeat(socket, data, connection);
      break;
      
    case 'admin_subscribe':
      await handleAdminSubscribe(socket, data, connection);
      break;
      
    case 'admin_device_control':
      await handleAdminDeviceControl(socket, data);
      break;
      
    case 'admin_broadcast_message':
      await handleAdminBroadcastMessage(socket, data);
      break;
      
    default:
      console.log('Unknown message type:', data.type);
  }
}

async function handleDeviceRegister(socket: WebSocket, data: any, connection: any) {
  try {
    const { deviceId, masjidId, deviceInfo } = data;
    
    if (!deviceId || !masjidId || !deviceInfo) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Missing required fields: deviceId, masjidId, deviceInfo'
      }));
      return;
    }

    // Store connection info
    connection.deviceId = deviceId;
    connection.masjidId = masjidId;
    deviceConnections.set(deviceId, connection);

    // Send success response
    socket.send(JSON.stringify({
      type: 'device_registered',
      deviceId,
      masjidId,
      success: true
    }));

    // Notify admins of new device
    broadcastToAdmins({
      type: 'device_connected',
      deviceId,
      masjidId,
      deviceInfo
    });

  } catch (error) {
    console.error('Device registration error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Registration failed'
    }));
  }
}

async function handleDeviceStatusUpdate(socket: WebSocket, data: any, connection: any) {
  try {
    const { deviceId, status, lastSeen, networkStatus } = data;
    
    if (!deviceId || !status) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Missing required fields: deviceId, status'
      }));
      return;
    }

    // Send success response
    socket.send(JSON.stringify({
      type: 'status_updated',
      deviceId,
      status,
      success: true
    }));

    // Notify admins of status change
    broadcastToAdmins({
      type: 'device_status_changed',
      deviceId,
      status,
      lastSeen,
      networkStatus
    });

  } catch (error) {
    console.error('Status update error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Status update failed'
    }));
  }
}

async function handleDeviceHeartbeat(socket: WebSocket, data: any, connection: any) {
  try {
    const { deviceId } = data;
    
    if (!deviceId) {
      return;
    }

    // Send heartbeat response
    socket.send(JSON.stringify({
      type: 'heartbeat_response',
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Heartbeat error:', error);
  }
}

async function handleAdminSubscribe(socket: WebSocket, data: any, connection: any) {
  try {
    const { masjidId } = data;
    
    connection.isAdmin = true;
    connection.masjidId = masjidId;
    adminConnections.add(socket);

    socket.send(JSON.stringify({
      type: 'admin_subscribed',
      masjidId,
      devices: Array.from(deviceConnections.values()).filter(d => d.masjidId === masjidId)
    }));

  } catch (error) {
    console.error('Admin subscribe error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Subscription failed'
    }));
  }
}

async function handleAdminDeviceControl(socket: WebSocket, data: any) {
  try {
    const { deviceId, action, data: actionData } = data;
    
    if (!deviceId || !action) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Missing required fields: deviceId, action'
      }));
      return;
    }

    const deviceConnection = deviceConnections.get(deviceId);
    if (!deviceConnection) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Device not connected'
      }));
      return;
    }

    // Send control command to device
    deviceConnection.ws.send(JSON.stringify({
      type: 'admin_control',
      action,
      data: actionData
    }));

    // Send success response to admin
    socket.send(JSON.stringify({
      type: 'control_sent',
      deviceId,
      action,
      success: true
    }));

  } catch (error) {
    console.error('Device control error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Control command failed'
    }));
  }
}

async function handleAdminBroadcastMessage(socket: WebSocket, data: any) {
  try {
    const { masjidId, message, type } = data;
    
    if (!masjidId || !message) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Missing required fields: masjidId, message'
      }));
      return;
    }

    // Broadcast message to all devices in the masjid
    broadcastToMasjidDevices(masjidId, {
      type: 'broadcast_message',
      message,
      messageType: type || 'info'
    });

    // Send success response to admin
    socket.send(JSON.stringify({
      type: 'broadcast_sent',
      masjidId,
      success: true
    }));

  } catch (error) {
    console.error('Broadcast error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Broadcast failed'
    }));
  }
}

function handleClientDisconnect(socket: WebSocket) {
  // Remove from admin connections
  adminConnections.delete(socket);

  // Remove from device connections
  for (const [deviceId, connection] of deviceConnections.entries()) {
    if (connection.ws === socket) {
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
  adminConnections.forEach(adminWs => {
    if (adminWs.readyState === WebSocket.OPEN) {
      adminWs.send(JSON.stringify(message));
    }
  });
}

function broadcastToMasjidDevices(masjidId: string, message: any) {
  deviceConnections.forEach((connection, deviceId) => {
    if (connection.masjidId === masjidId && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  });
} 