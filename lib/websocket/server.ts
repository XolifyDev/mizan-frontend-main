import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { prisma } from '@/lib/db';

interface WebSocketMessage {
  type: string;
  channel?: string;
  deviceId?: string;
  masjidId?: string;
  data?: any;
  status?: string;
  lastSeen?: string;
  networkStatus?: string;
  deviceInfo?: any;
  config?: any;
  slideId?: string;
  action?: string;
  content?: any;
}

interface DeviceConnection {
  ws: WebSocket;
  deviceId?: string;
  masjidId?: string;
  isAdmin?: boolean;
}

export function createWebSocketServer(server: Server) {
  // Create WebSocket server with proper upgrade handling
  const wss = new WebSocketServer({ 
    server,
    path: '/ws', // Only handle WebSocket connections on /ws path
    perMessageDeflate: false, // Disable compression for better performance
  });
  
  const deviceConnections = new Map<string, DeviceConnection>();
  const adminConnections = new Set<WebSocket>();
  
  // Rate limiting for connections
  const connectionAttempts = new Map<string, { count: number; lastAttempt: number }>();
  const maxConnectionAttempts = 10; // Max 10 attempts per minute
  const connectionWindow = 60000; // 1 minute window

  wss.on('connection', (ws, request) => {
    const clientIP = request.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Check rate limiting
    const attempts = connectionAttempts.get(clientIP);
    if (attempts) {
      if (now - attempts.lastAttempt < connectionWindow) {
        if (attempts.count >= maxConnectionAttempts) {
          console.log(`Rate limit exceeded for ${clientIP}, rejecting connection`);
          ws.close(1008, 'Rate limit exceeded');
          return;
        }
        attempts.count++;
      } else {
        // Reset counter if window has passed
        connectionAttempts.set(clientIP, { count: 1, lastAttempt: now });
      }
    } else {
      connectionAttempts.set(clientIP, { count: 1, lastAttempt: now });
    }
    
    console.log(`WebSocket client connected from: ${clientIP} (attempt ${connectionAttempts.get(clientIP)?.count})`);
    let connection: DeviceConnection = { ws };

    // Set up ping/pong for connection health
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message);
        console.log('WebSocket message received:', data.type);

        switch (data.type) {
          case 'device_register':
            await handleDeviceRegister(ws, data, connection);
            break;

          case 'device_status_update':
            await handleDeviceStatusUpdate(ws, data, connection);
            break;

          case 'device_config_update':
            await handleDeviceConfigUpdate(ws, data, connection);
            break;

          case 'device_heartbeat':
            await handleDeviceHeartbeat(ws, data, connection);
            break;

          case 'admin_subscribe':
            await handleAdminSubscribe(ws, data, connection);
            break;

          case 'admin_device_control':
            await handleAdminDeviceControl(ws, data);
            break;

          case 'admin_slide_update':
            await handleAdminSlideUpdate(ws, data);
            break;

          case 'admin_content_update':
            await handleAdminContentUpdate(ws, data);
            break;

          case 'admin_device_restart':
            await handleAdminDeviceRestart(ws, data);
            break;

          case 'admin_device_stop':
            await handleAdminDeviceStop(ws, data);
            break;

          case 'admin_device_start':
            await handleAdminDeviceStart(ws, data);
            break;

          case 'admin_broadcast_message':
            await handleAdminBroadcastMessage(ws, data);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', (code, reason) => {
      console.log('WebSocket client disconnected:', { code, reason: reason.toString(), remoteAddress: request.socket.remoteAddress });
      handleClientDisconnect(ws, connection);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      handleClientDisconnect(ws, connection);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established'
    }));
  });

  // Set up ping interval to detect stale connections
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log('Terminating stale WebSocket connection');
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Ping every 30 seconds

  // Clean up interval on server close
  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  // Device Registration
  async function handleDeviceRegister(ws: WebSocket, data: WebSocketMessage, connection: DeviceConnection) {
    try {
      const { deviceId, masjidId, deviceInfo } = data;
      
      if (!deviceId || !masjidId || !deviceInfo) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required fields: deviceId, masjidId, deviceInfo'
        }));
        return;
      }

      // Check if device exists
      const existingDevice = await prisma.tVDisplay.findUnique({
        where: { id: deviceId }
      });

      if (existingDevice) {
        // Update existing device
        await prisma.tVDisplay.update({
          where: { id: deviceId },
          data: {
            masjidId,
            name: deviceInfo.deviceName || existingDevice.name,
            platform: deviceInfo.platform,
            model: deviceInfo.model,
            osVersion: deviceInfo.osVersion,
            appVersion: deviceInfo.appVersion,
            buildNumber: deviceInfo.buildNumber,
            installationId: deviceInfo.installationId,
            status: "online",
            lastSeen: new Date(),
            networkStatus: "connected",
            updatedAt: new Date(),
          }
        });
      } else {
        // Create new device
        await prisma.tVDisplay.create({
          data: {
            id: deviceId,
            masjidId,
            name: deviceInfo.deviceName || `MizanTV Display ${deviceInfo.platform}`,
            platform: deviceInfo.platform,
            model: deviceInfo.model,
            osVersion: deviceInfo.osVersion,
            appVersion: deviceInfo.appVersion,
            buildNumber: deviceInfo.buildNumber,
            installationId: deviceInfo.installationId,
            status: "online",
            lastSeen: new Date(),
            networkStatus: "connected",
            registeredAt: new Date(),
            isActive: true,
            location: "Main Hall",
            config: {
              slideDuration: 10000,
              theme: "default",
              customSettings: {
                showClock: true,
                showWeather: false,
                autoRotate: true
              }
            }
          }
        });
      }

      // Store connection info
      connection.deviceId = deviceId;
      connection.masjidId = masjidId;
      deviceConnections.set(deviceId, connection);

      // Send success response
      ws.send(JSON.stringify({
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
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Registration failed'
      }));
    }
  }

  // Device Status Update
  async function handleDeviceStatusUpdate(ws: WebSocket, data: WebSocketMessage, connection: DeviceConnection) {
    try {
      const { deviceId, status, lastSeen, networkStatus } = data;
      
      if (!deviceId || !status) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required fields: deviceId, status'
        }));
        return;
      }

      // Update device status in database
      await prisma.tVDisplay.update({
        where: { id: deviceId },
        data: {
          status,
          lastSeen: lastSeen ? new Date(lastSeen) : new Date(),
          networkStatus: networkStatus || "connected",
          updatedAt: new Date(),
        }
      });

      // Send success response
      ws.send(JSON.stringify({
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
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Status update failed'
      }));
    }
  }

  // Device Config Update
  async function handleDeviceConfigUpdate(ws: WebSocket, data: WebSocketMessage, connection: DeviceConnection) {
    try {
      const { deviceId, config } = data;
      
      if (!deviceId || !config) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required fields: deviceId, config'
        }));
        return;
      }

      // Update device config
      await prisma.tVDisplay.update({
        where: { id: deviceId },
        data: {
          config,
          updatedAt: new Date(),
        }
      });

      // Send success response
      ws.send(JSON.stringify({
        type: 'config_updated',
        deviceId,
        success: true
      }));

      // Notify admins of config change
      broadcastToAdmins({
        type: 'device_config_changed',
        deviceId,
        config
      });

    } catch (error) {
      console.error('Config update error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Config update failed'
      }));
    }
  }

  // Device Heartbeat
  async function handleDeviceHeartbeat(ws: WebSocket, data: WebSocketMessage, connection: DeviceConnection) {
    try {
      const { deviceId } = data;
      
      if (!deviceId) {
        return;
      }

      // Update last seen
      await prisma.tVDisplay.update({
        where: { id: deviceId },
        data: {
          lastSeen: new Date(),
          status: "online"
        }
      });

      // Send heartbeat response
      ws.send(JSON.stringify({
        type: 'heartbeat_response',
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  }

  // Admin Subscribe
  async function handleAdminSubscribe(ws: WebSocket, data: WebSocketMessage, connection: DeviceConnection) {
    try {
      const { masjidId } = data;
      
      connection.isAdmin = true;
      connection.masjidId = masjidId;
      adminConnections.add(ws);

      // Send current device status for the masjid
      const devices = await prisma.tVDisplay.findMany({
        where: { masjidId },
        select: {
          id: true,
          name: true,
          status: true,
          lastSeen: true,
          platform: true,
          model: true,
          config: true
        }
      });

      ws.send(JSON.stringify({
        type: 'admin_subscribed',
        masjidId,
        devices
      }));

    } catch (error) {
      console.error('Admin subscribe error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Subscription failed'
      }));
    }
  }

  // Admin Device Control
  async function handleAdminDeviceControl(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { deviceId, action, data: actionData } = data;
      
      if (!deviceId || !action) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required fields: deviceId, action'
        }));
        return;
      }

      const deviceConnection = deviceConnections.get(deviceId);
      if (!deviceConnection) {
        ws.send(JSON.stringify({
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
      ws.send(JSON.stringify({
        type: 'control_sent',
        deviceId,
        action,
        success: true
      }));

    } catch (error) {
      console.error('Device control error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Control command failed'
      }));
    }
  }

  // Admin Slide Update
  async function handleAdminSlideUpdate(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { masjidId, slideId, action } = data;
      
      if (!masjidId || !slideId || !action) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required fields: masjidId, slideId, action'
        }));
        return;
      }

      // Broadcast slide update to all devices in the masjid
      broadcastToMasjidDevices(masjidId, {
        type: 'slide_update',
        slideId,
        action
      });

      // Send success response to admin
      ws.send(JSON.stringify({
        type: 'slide_update_sent',
        masjidId,
        slideId,
        action,
        success: true
      }));

    } catch (error) {
      console.error('Slide update error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Slide update failed'
      }));
    }
  }

  // Admin Content Update
  async function handleAdminContentUpdate(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { masjidId, content } = data;
      
      if (!masjidId || !content) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required fields: masjidId, content'
        }));
        return;
      }

      // Broadcast content update to all devices in the masjid
      broadcastToMasjidDevices(masjidId, {
        type: 'content_update',
        content
      });

      // Send success response to admin
      ws.send(JSON.stringify({
        type: 'content_update_sent',
        masjidId,
        success: true
      }));

    } catch (error) {
      console.error('Content update error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Content update failed'
      }));
    }
  }

  // Admin Device Restart
  async function handleAdminDeviceRestart(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { deviceId } = data;
      
      if (!deviceId) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required field: deviceId'
        }));
        return;
      }

      const deviceConnection = deviceConnections.get(deviceId);
      if (!deviceConnection) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Device not connected'
        }));
        return;
      }

      // Send restart command to device
      deviceConnection.ws.send(JSON.stringify({
        type: 'restart_device'
      }));

      // Send success response to admin
      ws.send(JSON.stringify({
        type: 'restart_sent',
        deviceId,
        success: true
      }));

    } catch (error) {
      console.error('Device restart error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Restart command failed'
      }));
    }
  }

  // Admin Device Stop
  async function handleAdminDeviceStop(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { deviceId } = data;
      
      if (!deviceId) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required field: deviceId'
        }));
        return;
      }

      const deviceConnection = deviceConnections.get(deviceId);
      if (!deviceConnection) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Device not connected'
        }));
        return;
      }

      // Send stop command to device
      deviceConnection.ws.send(JSON.stringify({
        type: 'stop_device'
      }));

      // Send success response to admin
      ws.send(JSON.stringify({
        type: 'stop_sent',
        deviceId,
        success: true
      }));

    } catch (error) {
      console.error('Device stop error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Stop command failed'
      }));
    }
  }

  // Admin Device Start
  async function handleAdminDeviceStart(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { deviceId } = data;
      
      if (!deviceId) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Missing required field: deviceId'
        }));
        return;
      }

      const deviceConnection = deviceConnections.get(deviceId);
      if (!deviceConnection) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Device not connected'
        }));
        return;
      }

      // Send start command to device
      deviceConnection.ws.send(JSON.stringify({
        type: 'start_device'
      }));

      // Send success response to admin
      ws.send(JSON.stringify({
        type: 'start_sent',
        deviceId,
        success: true
      }));

    } catch (error) {
      console.error('Device start error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Start command failed'
      }));
    }
  }

  // Admin Broadcast Message
  async function handleAdminBroadcastMessage(ws: WebSocket, data: WebSocketMessage) {
    try {
      const { masjidId, message, type } = data;
      
      if (!masjidId || !message) {
        ws.send(JSON.stringify({
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
      ws.send(JSON.stringify({
        type: 'broadcast_sent',
        masjidId,
        success: true
      }));

    } catch (error) {
      console.error('Broadcast error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Broadcast failed'
      }));
    }
  }

  // Client Disconnect Handler
  function handleClientDisconnect(ws: WebSocket, connection: DeviceConnection) {
    // Remove from admin connections
    adminConnections.delete(ws);

    // Remove from device connections and mark device as offline
    if (connection.deviceId) {
      deviceConnections.delete(connection.deviceId);
      
      // Mark device as offline in database
      prisma.tVDisplay.update({
        where: { id: connection.deviceId },
        data: {
          status: "offline",
          updatedAt: new Date()
        }
      }).catch(error => {
        console.error('Error marking device offline:', error);
      });

      // Notify admins of device disconnect
      broadcastToAdmins({
        type: 'device_disconnected',
        deviceId: connection.deviceId,
        masjidId: connection.masjidId
      });
    }
  }

  // Helper function to broadcast to all admin connections
  function broadcastToAdmins(message: any) {
    adminConnections.forEach(adminWs => {
      if (adminWs.readyState === WebSocket.OPEN) {
        adminWs.send(JSON.stringify(message));
      }
    });
  }

  // Helper function to broadcast to all devices in a masjid
  function broadcastToMasjidDevices(masjidId: string, message: any) {
    deviceConnections.forEach((connection, deviceId) => {
      if (connection.masjidId === masjidId && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    });
  }

  // Helper function to broadcast to all connected clients
  function broadcastUpdate(type: string, data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          ...data,
        }));
      }
    });
  }

  return wss;
}

// Export helper functions for external use
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