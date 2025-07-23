import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '@/lib/db';

interface SocketMessage {
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
  socket: any;
  deviceId?: string;
  masjidId?: string;
  isAdmin?: boolean;
}

export function createSocketIOServer(server: HTTPServer) {
  console.log('Creating Socket.IO server...');
  
  // Create Socket.IO server with CORS configuration
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Configure this properly for production
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['polling', 'websocket'], // Start with polling, upgrade to WebSocket
    pingTimeout: 120000, // Increase ping timeout
    pingInterval: 25000,
    upgradeTimeout: 30000, // Increase upgrade timeout
    allowUpgrades: true,
    maxHttpBufferSize: 1e6, // 1MB
    allowEIO3: true, // Allow Engine.IO v3 clients
  });
  
  console.log('Socket.IO server created successfully');
  
  const deviceConnections = new Map<string, DeviceConnection>();
  const adminConnections = new Set<any>();

  io.on('connection', (socket) => {
    console.log('Socket.IO client connected:', socket.id);
    let connection: DeviceConnection = { socket };

    // Handle device registration
    socket.on('device_register', async (data: SocketMessage) => {
      try {
        const { deviceId, masjidId, deviceInfo } = data;
        
        if (!deviceId || !masjidId || !deviceInfo) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required fields: deviceId, masjidId, deviceInfo'
          });
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
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
        }

        // Store connection info
        connection.deviceId = deviceId;
        connection.masjidId = masjidId;
        deviceConnections.set(deviceId, connection);

        // Join device room
        socket.join(`device:${deviceId}`);
        socket.join(`masjid:${masjidId}`);

        // Send confirmation
        socket.emit('device_registered', {
          type: 'device_registered',
          deviceId,
          masjidId,
          success: true
        });

        // Notify admins
        io.to(`admin:${masjidId}`).emit('device_connected', {
          type: 'device_connected',
          deviceId,
          masjidId,
          deviceInfo
        });

        console.log(`Device registered: ${deviceId} for masjid: ${masjidId}`);
      } catch (error) {
        console.error('Device registration error:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Device registration failed'
        });
      }
    });

    // Handle device status updates
    socket.on('device_status_update', async (data: SocketMessage) => {
      try {
        const { deviceId, status, lastSeen, networkStatus } = data;
        
        if (!deviceId || !status) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required fields: deviceId, status'
          });
          return;
        }

        // Update device status in database
        await prisma.tVDisplay.update({
          where: { id: deviceId },
          data: {
            status,
            lastSeen: lastSeen ? new Date(lastSeen) : new Date(),
            networkStatus,
            updatedAt: new Date(),
          }
        });

        // Notify admins
        const connection = deviceConnections.get(deviceId);
        if (connection?.masjidId) {
          io.to(`admin:${connection.masjidId}`).emit('device_status_changed', {
            type: 'device_status_changed',
            deviceId,
            status,
            lastSeen,
            networkStatus
          });
        }

        console.log(`Device status updated: ${deviceId} -> ${status}`);
      } catch (error) {
        console.error('Device status update error:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Status update failed'
        });
      }
    });

    // Handle device content updates
    socket.on('device_content_update', async (data: SocketMessage) => {
      try {
        const { deviceId, content, contentType, lastContentUpdate } = data;
        
        if (!deviceId) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required field: deviceId'
          });
          return;
        }

        // Get current device config
        const currentDevice = await prisma.tVDisplay.findUnique({
          where: { id: deviceId },
          select: { config: true }
        });

        // Update device content in config field
        const updatedConfig = {
          ...(currentDevice?.config as any || {}),
          currentContent: {
            type: contentType || 'prayer',
            content: content,
            lastUpdate: lastContentUpdate || new Date().toISOString()
          }
        };

        await prisma.tVDisplay.update({
          where: { id: deviceId },
          data: {
            config: updatedConfig,
            lastSeen: new Date(),
            updatedAt: new Date(),
          }
        });

        // Notify admins of content update
        const connection = deviceConnections.get(deviceId);
        if (connection?.masjidId) {
          io.to(`admin:${connection.masjidId}`).emit('device_content_changed', {
            type: 'device_content_changed',
            deviceId,
            content,
            contentType: contentType || 'prayer',
            lastContentUpdate: lastContentUpdate || new Date().toISOString()
          });
        }

        console.log(`Device content updated: ${deviceId} -> ${contentType}`);
      } catch (error) {
        console.error('Device content update error:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Content update failed'
        });
      }
    });

    // Handle admin subscription
    socket.on('admin_subscribe', async (data: SocketMessage) => {
      try {
        const { masjidId } = data;
        
        if (!masjidId) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required field: masjidId'
          });
          return;
        }

        // Store admin connection
        connection.isAdmin = true;
        connection.masjidId = masjidId;
        adminConnections.add(socket);

        // Join admin room
        socket.join(`admin:${masjidId}`);

        // Get all devices for this masjid
        const devices = await prisma.tVDisplay.findMany({
          where: { masjidId }
        });

        // Send current devices to admin
        socket.emit('admin_subscribed', {
          type: 'admin_subscribed',
          masjidId,
          devices: devices.map(device => {
            const config = device.config as any || {};
            const currentContent = config.currentContent || {};
            
            return {
              id: device.id,
              name: device.name,
              status: device.status,
              lastSeen: device.lastSeen,
              platform: device.platform,
              model: device.model,
              networkStatus: device.networkStatus,
              content: currentContent.type || 'prayer',
              lastContentUpdate: currentContent.lastUpdate ? new Date(currentContent.lastUpdate) : device.lastSeen
            };
          })
        });

        console.log(`Admin subscribed to masjid: ${masjidId}`);
      } catch (error) {
        console.error('Admin subscription error:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Admin subscription failed'
        });
      }
    });

    // Handle admin device control
    socket.on('admin_device_control', async (data: SocketMessage) => {
      try {
        const { deviceId, action, data: controlData } = data;
        
        if (!deviceId || !action) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required fields: deviceId, action'
          });
          return;
        }

        const deviceConnection = deviceConnections.get(deviceId);
        if (!deviceConnection) {
          socket.emit('error', {
            type: 'error',
            message: 'Device not connected'
          });
          return;
        }

        // Send control command to device
        deviceConnection.socket.emit(action, controlData);

        // Send success response to admin
        socket.emit(`${action}_sent`, {
          deviceId,
          success: true
        });

        console.log(`Admin control sent: ${action} to device ${deviceId}`);
      } catch (error) {
        console.error('Admin control error:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Control command failed'
        });
      }
    });

    // Handle device heartbeat
    socket.on('device_heartbeat', async (data: SocketMessage) => {
      try {
        const { deviceId } = data;
        
        if (!deviceId) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required field: deviceId'
          });
          return;
        }

        // Update last seen
        await prisma.tVDisplay.update({
          where: { id: deviceId },
          data: {
            lastSeen: new Date(),
            updatedAt: new Date(),
          }
        });

        // Send heartbeat response
        socket.emit('heartbeat_response', {
          type: 'heartbeat_response',
          deviceId,
          timestamp: new Date().toISOString()
        });

        console.log(`Device heartbeat: ${deviceId}`);
      } catch (error) {
        console.error('Device heartbeat error:', error);
      }
    });

    // Handle broadcast messages
    socket.on('admin_broadcast_message', async (data: SocketMessage) => {
      try {
        const { masjidId, message, type } = data;
        
        if (!masjidId || !message) {
          socket.emit('error', {
            type: 'error',
            message: 'Missing required fields: masjidId, message'
          });
          return;
        }

        // Broadcast message to all devices in the masjid
        io.to(`masjid:${masjidId}`).emit('broadcast_message', {
          type: 'broadcast_message',
          message,
          messageType: type || 'info'
        });

        // Send success response to admin
        socket.emit('broadcast_sent', {
          masjidId,
          success: true
        });

        console.log(`Broadcast sent to masjid: ${masjidId}`);
      } catch (error) {
        console.error('Broadcast error:', error);
        socket.emit('error', {
          type: 'error',
          message: 'Broadcast failed'
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Socket.IO client disconnected:', socket.id);
      handleClientDisconnect(socket, connection);
    });

    // Send welcome message
    socket.emit('connected', {
      type: 'connected',
      message: 'Socket.IO connection established',
      socketId: socket.id
    });
  });

  // Client disconnect handler
  function handleClientDisconnect(socket: any, connection: DeviceConnection) {
    // Remove from admin connections
    adminConnections.delete(socket);

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
      if (connection.masjidId) {
        io.to(`admin:${connection.masjidId}`).emit('device_disconnected', {
          type: 'device_disconnected',
          deviceId: connection.deviceId,
          masjidId: connection.masjidId
        });
      }
    }
  }

  return io;
}

// Export helper functions for external use
export function broadcastToMasjid(io: SocketIOServer, masjidId: string, event: string, data: any) {
  io.to(`masjid:${masjidId}`).emit(event, data);
}

export function broadcastToAdmins(io: SocketIOServer, masjidId: string, event: string, data: any) {
  io.to(`admin:${masjidId}`).emit(event, data);
} 