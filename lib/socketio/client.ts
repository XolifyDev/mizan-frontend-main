import { io, Socket } from 'socket.io-client';

interface SocketMessage {
  type: string;
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
  message?: string;
  messageType?: string;
}

interface SocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onDeviceRegistered?: (data: any) => void;
  onStatusUpdated?: (data: any) => void;
  onConfigUpdated?: (data: any) => void;
  onHeartbeatResponse?: (data: any) => void;
  onAdminSubscribed?: (data: any) => void;
  onAdminControl?: (data: any) => void;
  onSlideUpdate?: (data: any) => void;
  onContentUpdate?: (data: any) => void;
  onRestartDevice?: () => void;
  onStopDevice?: () => void;
  onStartDevice?: () => void;
  onBroadcastMessage?: (data: any) => void;
  onDeviceConnected?: (data: any) => void;
  onDeviceDisconnected?: (data: any) => void;
  onDeviceStatusChanged?: (data: any) => void;
  onDeviceConfigChanged?: (data: any) => void;
  onDeviceContentChanged?: (data: any) => void;
}

class SocketIOClient {
  private socket: Socket | null = null;
  private url: string;
  private callbacks: SocketCallbacks;
  private isConnecting = false;
  private isDisconnecting = false;
  private connected = false;
  private messageQueue: SocketMessage[] = [];

  constructor(url: string, callbacks: SocketCallbacks = {}) {
    this.url = url;
    this.callbacks = callbacks;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.socket?.connected) {
        console.log('Socket.IO: Already connecting or connected, skipping');
        resolve();
        return;
      }

      console.log('Socket.IO: Attempting to connect to:', this.url);
      this.isConnecting = true;

      try {
        console.log('Socket.IO: Creating socket instance...');
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
          timeout: 30000, // Increase timeout to 30 seconds
          forceNew: true,
          reconnection: true, // Enable reconnection
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          autoConnect: false,
        });

        console.log('Socket.IO: Socket instance created, setting up event handlers...');
        console.log('Socket.IO: Configuration:', {
          url: this.url,
          transports: ['websocket', 'polling'],
          timeout: 30000,
          reconnection: true
        });

        this.socket.on('connect', () => {
          console.log('Socket.IO connected successfully');
          console.log('Socket.IO connection details:', {
            id: this.socket?.id,
            transport: this.socket?.io?.engine?.transport?.name,
            readyState: this.socket?.io?.readyState
          });
          this.isConnecting = false;
          this.connected = true;
          
          // Process any queued messages
          while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
              this.send(message);
            }
          }
          
          this.callbacks.onConnect?.();
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          console.log('Socket.IO disconnect details:', {
            reason,
            wasConnected: this.connected,
            readyState: this.socket?.io?.readyState
          });
          this.isConnecting = false;
          this.connected = false;
          this.messageQueue = [];
          this.callbacks.onDisconnect?.();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          console.error('Socket.IO connection error details:', {
            message: error.message,
            description: error.description,
            context: error.context,
            type: error.type,
            readyState: this.socket?.io?.readyState
          });
          this.isConnecting = false;
          this.callbacks.onError?.(error);
          reject(error);
        });

        // Add transport upgrade logging
        this.socket.io.on('upgrade', () => {
          console.log('Socket.IO transport upgraded to WebSocket');
        });

        this.socket.io.on('upgradeError', (error) => {
          console.error('Socket.IO upgrade error:', error);
        });

        console.log('Socket.IO: Event handlers set up, attempting to connect...');
        this.socket.connect();
        console.log('Socket.IO: Connect() called, waiting for connection...');

        // Handle incoming messages
        this.socket.on('connected', (data) => {
          console.log('Socket.IO connection confirmed:', data.message);
        });

        this.socket.on('device_registered', (data) => {
          this.callbacks.onDeviceRegistered?.(data);
        });

        this.socket.on('device_connected', (data) => {
          this.callbacks.onDeviceConnected?.(data);
        });

        this.socket.on('device_disconnected', (data) => {
          this.callbacks.onDeviceDisconnected?.(data);
        });

        this.socket.on('device_status_changed', (data) => {
          this.callbacks.onDeviceStatusChanged?.(data);
        });

        this.socket.on('device_content_changed', (data) => {
          this.callbacks.onDeviceContentChanged?.(data);
        });

        this.socket.on('admin_subscribed', (data) => {
          this.callbacks.onAdminSubscribed?.(data);
        });

        this.socket.on('heartbeat_response', (data) => {
          this.callbacks.onHeartbeatResponse?.(data);
        });

        this.socket.on('broadcast_message', (data) => {
          this.callbacks.onBroadcastMessage?.(data);
        });

        this.socket.on('restart_device', () => {
          this.callbacks.onRestartDevice?.();
        });

        this.socket.on('stop_device', () => {
          this.callbacks.onStopDevice?.();
        });

        this.socket.on('start_device', () => {
          this.callbacks.onStartDevice?.();
        });

        this.socket.on('error', (data) => {
          this.callbacks.onError?.(data);
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.isDisconnecting || !this.socket) {
      return;
    }

    this.isDisconnecting = true;
    this.connected = false;
    this.messageQueue = [];
    
    try {
      this.socket.disconnect();
    } catch (error) {
      console.error('Error during Socket.IO disconnect:', error);
    } finally {
      this.socket = null;
      this.isDisconnecting = false;
    }
  }

  send(message: SocketMessage) {
    if (this.connected && this.socket?.connected) {
      this.socket.emit(message.type, message);
    } else if (this.isConnecting) {
      // Queue message if we're in the process of connecting
      this.messageQueue.push(message);
      console.log('Message queued, waiting for connection:', message.type);
    } else {
      console.warn('Socket.IO is not connected, message not sent:', message.type);
    }
  }

  // Device methods
  registerDevice(deviceId: string, masjidId: string, deviceInfo: any) {
    this.send({
      type: 'device_register',
      deviceId,
      masjidId,
      deviceInfo
    });
  }

  updateDeviceStatus(deviceId: string, status: string, lastSeen?: string, networkStatus?: string) {
    this.send({
      type: 'device_status_update',
      deviceId,
      status,
      lastSeen,
      networkStatus
    });
  }

  updateDeviceConfig(deviceId: string, config: any) {
    this.send({
      type: 'device_config_update',
      deviceId,
      config
    });
  }

  sendHeartbeat(deviceId: string) {
    this.send({
      type: 'device_heartbeat',
      deviceId
    });
  }

  // Admin methods
  subscribeAsAdmin(masjidId: string) {
    this.send({
      type: 'admin_subscribe',
      masjidId
    });
  }

  controlDevice(deviceId: string, action: string, data?: any) {
    this.send({
      type: 'admin_device_control',
      deviceId,
      action,
      data
    });
  }

  updateSlide(masjidId: string, slideId: string, action: string) {
    this.send({
      type: 'admin_slide_update',
      masjidId,
      slideId,
      action
    });
  }

  updateContent(masjidId: string, content: any) {
    this.send({
      type: 'admin_content_update',
      masjidId,
      content
    });
  }

  restartDevice(deviceId: string) {
    this.send({
      type: 'admin_device_control',
      deviceId,
      action: 'restart_device'
    });
  }

  stopDevice(deviceId: string) {
    this.send({
      type: 'admin_device_control',
      deviceId,
      action: 'stop_device'
    });
  }

  startDevice(deviceId: string) {
    this.send({
      type: 'admin_device_control',
      deviceId,
      action: 'start_device'
    });
  }

  broadcastMessage(masjidId: string, message: string, type?: string) {
    this.send({
      type: 'admin_broadcast_message',
      masjidId,
      message,
      type
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  getReadyState(): number | undefined {
    return this.socket?.connected ? 1 : 3; // 1 = OPEN, 3 = CLOSED
  }

  pauseReconnection() {
    console.log('Pausing Socket.IO reconnection attempts');
    this.socket?.disconnect();
  }

  resumeReconnection() {
    console.log('Resuming Socket.IO reconnection attempts');
    if (!this.isConnected() && !this.isConnecting && !this.isDisconnecting) {
      this.connect().catch(error => {
        console.error('Resume connection failed:', error);
      });
    }
  }

  blockConnection() {
    console.log('BLOCKING Socket.IO connection completely');
    this.disconnect();
  }

  unblockConnection() {
    console.log('Unblocking Socket.IO connection');
    // Reconnection is handled automatically by Socket.IO
  }
}

// Create a singleton instance for the app
let socketClient: SocketIOClient | null = null;

export function createSocketIOClient(url: string, callbacks: SocketCallbacks = {}): SocketIOClient {
  if (!socketClient) {
    socketClient = new SocketIOClient(url, callbacks);
  }
  return socketClient;
}

export function getSocketIOClient(): SocketIOClient | null {
  return socketClient;
}

export function disconnectSocketIO() {
  if (socketClient) {
    socketClient.disconnect();
    socketClient = null;
  }
}

export function pauseSocketIOReconnection() {
  if (socketClient) {
    socketClient.pauseReconnection();
  }
}

export function resumeSocketIOReconnection() {
  if (socketClient) {
    socketClient.resumeReconnection();
  }
}

export function blockSocketIOConnection() {
  if (socketClient) {
    socketClient.blockConnection();
  }
}

export function unblockSocketIOConnection() {
  if (socketClient) {
    socketClient.unblockConnection();
  }
}

// Export the class for direct use
export { SocketIOClient };
export type { SocketMessage, SocketCallbacks }; 