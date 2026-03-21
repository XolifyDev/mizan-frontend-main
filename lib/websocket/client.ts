interface WebSocketMessage {
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

interface WebSocketCallbacks {
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
  onError?: (data: any) => void;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isDisconnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private connected = false;
  private lastConnectionAttempt = 0;
  private connectionThrottle = 2000; // Minimum 2 seconds between connection attempts
  private connectionBlocked = false; // Emergency stop flag

  constructor(url: string, callbacks: WebSocketCallbacks = {}) {
    this.url = url;
    this.callbacks = callbacks;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Emergency stop - if connection is blocked, don't attempt to connect
      if (this.connectionBlocked) {
        console.log('WebSocket connection blocked - not attempting to connect');
        reject(new Error('WebSocket connection blocked'));
        return;
      }

      const now = Date.now();
      
      // Throttle connection attempts
      if (now - this.lastConnectionAttempt < this.connectionThrottle) {
        console.log('Connection attempt throttled, waiting...');
        setTimeout(() => this.connect().then(resolve).catch(reject), this.connectionThrottle);
        return;
      }
      
      if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.lastConnectionAttempt = now;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Process any queued messages
          while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
              this.ws?.send(JSON.stringify(message));
            }
          }
          
          this.callbacks.onConnect?.();
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', { code: event.code, reason: event.reason, wasClean: event.wasClean });
          this.isConnecting = false;
          this.connected = false;
          this.messageQueue = []; // Clear queued messages on disconnect
          this.callbacks.onDisconnect?.();
          
          // Only attempt reconnect if not blocked and it wasn't a clean close
          if (!this.connectionBlocked && !event.wasClean && event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.callbacks.onError?.(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'connected':
        console.log('WebSocket connection confirmed:', message.message);
        break;
      case 'device_registered':
        this.callbacks.onDeviceRegistered?.(message);
        break;
      case 'status_updated':
        this.callbacks.onStatusUpdated?.(message);
        break;
      case 'config_updated':
        this.callbacks.onConfigUpdated?.(message);
        break;
      case 'heartbeat_response':
        this.callbacks.onHeartbeatResponse?.(message);
        break;
      case 'admin_subscribed':
        this.callbacks.onAdminSubscribed?.(message);
        break;
      case 'admin_control':
        this.callbacks.onAdminControl?.(message);
        break;
      case 'slide_update':
        this.callbacks.onSlideUpdate?.(message);
        break;
      case 'content_update':
        this.callbacks.onContentUpdate?.(message);
        break;
      case 'restart_device':
        this.callbacks.onRestartDevice?.();
        break;
      case 'stop_device':
        this.callbacks.onStopDevice?.();
        break;
      case 'start_device':
        this.callbacks.onStartDevice?.();
        break;
      case 'broadcast_message':
        this.callbacks.onBroadcastMessage?.(message);
        break;
      case 'device_connected':
        this.callbacks.onDeviceConnected?.(message);
        break;
      case 'device_disconnected':
        this.callbacks.onDeviceDisconnected?.(message);
        break;
      case 'device_status_changed':
        this.callbacks.onDeviceStatusChanged?.(message);
        break;
      case 'device_config_changed':
        this.callbacks.onDeviceConfigChanged?.(message);
        break;
      case 'error':
        this.callbacks.onError?.(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, stopping reconnection attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.max(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.connectionThrottle);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      // Only attempt reconnect if we're not already connecting and not disconnected intentionally
      if (!this.isConnecting && !this.isDisconnecting) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  disconnect() {
    if (this.isDisconnecting || !this.ws) {
      return;
    }

    this.isDisconnecting = true;
    this.connected = false;
    this.messageQueue = []; // Clear queued messages
    
    try {
      // Check if the connection is still open before closing
      if (this.ws.readyState === WebSocket.OPEN) {
        // Use proper close code 1000 (Normal Closure)
        this.ws.close(1000, 'Client disconnecting');
      }
    } catch (error) {
      console.error('Error during WebSocket disconnect:', error);
    } finally {
      this.ws = null;
      this.isDisconnecting = false;
    }
  }

  send(message: WebSocketMessage) {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else if (this.isConnecting) {
      // Queue message if we're in the process of connecting
      this.messageQueue.push(message);
      console.log('Message queued, waiting for connection:', message.type);
    } else {
      console.warn('WebSocket is not connected, message not sent:', message.type);
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
      type: 'admin_device_restart',
      deviceId
    });
  }

  stopDevice(deviceId: string) {
    this.send({
      type: 'admin_device_stop',
      deviceId
    });
  }

  startDevice(deviceId: string) {
    this.send({
      type: 'admin_device_start',
      deviceId
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
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }

  pauseReconnection() {
    console.log('Pausing WebSocket reconnection attempts');
    this.reconnectAttempts = this.maxReconnectAttempts; // Force stop reconnection
  }

  resumeReconnection() {
    console.log('Resuming WebSocket reconnection attempts');
    this.reconnectAttempts = 0;
    if (!this.isConnected() && !this.isConnecting && !this.isDisconnecting) {
      this.connect().catch(error => {
        console.error('Resume connection failed:', error);
      });
    }
  }

  blockConnection() {
    console.log('BLOCKING WebSocket connection completely');
    this.connectionBlocked = true;
    this.disconnect();
  }

  unblockConnection() {
    console.log('Unblocking WebSocket connection');
    this.connectionBlocked = false;
  }
}

// Create a singleton instance for the app
let wsClient: WebSocketClient | null = null;

export function createWebSocketClient(url: string, callbacks: WebSocketCallbacks = {}): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(url, callbacks);
  }
  return wsClient;
}

export function getWebSocketClient(): WebSocketClient | null {
  return wsClient;
}

export function disconnectWebSocket() {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }
}

export function pauseWebSocketReconnection() {
  if (wsClient) {
    wsClient.pauseReconnection();
  }
}

export function resumeWebSocketReconnection() {
  if (wsClient) {
    wsClient.resumeReconnection();
  }
}

export function blockWebSocketConnection() {
  if (wsClient) {
    wsClient.blockConnection();
  }
}

export function unblockWebSocketConnection() {
  if (wsClient) {
    wsClient.unblockConnection();
  }
}

// Export the class for direct use
export { WebSocketClient };
export type { WebSocketMessage, WebSocketCallbacks }; 