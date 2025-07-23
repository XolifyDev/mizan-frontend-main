import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createWebSocketClient, getWebSocketClient, disconnectWebSocket, WebSocketCallbacks } from '@/lib/websocket/client';

interface UseWebSocketOptions extends WebSocketCallbacks {
  url?: string;
  autoConnect?: boolean;
  deviceId?: string;
  masjidId?: string;
  isAdmin?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  readyState: number | undefined;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL ? `${process.env.NEXT_PUBLIC_WS_URL}/ws` : 'ws://localhost:3000/ws',
    autoConnect = true,
    deviceId,
    masjidId,
    isAdmin = false,
    ...callbacks
  } = options;

  // Emergency disable flag - set to true to completely disable WebSocket
  const wsDisabled = false; // Set to true to disable WebSocket completely

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    readyState: undefined,
  });

  const wsClientRef = useRef<ReturnType<typeof createWebSocketClient> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Enhanced callbacks with state updates
  const enhancedCallbacks: WebSocketCallbacks = useMemo(() => ({
    onConnect: () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        readyState: wsClientRef.current?.getReadyState(),
      }));
      callbacksRef.current.onConnect?.();
    },
    onDisconnect: () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        readyState: wsClientRef.current?.getReadyState(),
      }));
      callbacksRef.current.onDisconnect?.();
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: error?.message || 'WebSocket error occurred',
        isConnecting: false,
      }));
      callbacksRef.current.onError?.(error);
    },
    ...callbacksRef.current,
  }), []); // Empty dependency array to prevent recreation

  // Initialize WebSocket client
  const initializeWebSocket = useCallback(() => {
    if (!wsClientRef.current) {
      wsClientRef.current = createWebSocketClient(url, enhancedCallbacks);
    }
    return wsClientRef.current;
  }, [url, enhancedCallbacks]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (wsDisabled) {
      console.log('WebSocket disabled - not attempting to connect');
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      const client = initializeWebSocket();
      await client.connect();
      
      // Auto-register device or subscribe as admin
      if (deviceId && masjidId && !isAdmin) {
        // Device registration will be handled by the device itself
        console.log('Device ready for registration');
      } else if (masjidId && isAdmin) {
        client.subscribeAsAdmin(masjidId);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false,
      }));
    }
  }, [initializeWebSocket, deviceId, masjidId, isAdmin, wsDisabled]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsClientRef.current?.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  // Send message
  const send = useCallback((message: any) => {
    if (wsClientRef.current?.isConnected()) {
      wsClientRef.current.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  // Device methods
  const registerDevice = useCallback((deviceInfo: any) => {
    if (deviceId && masjidId) {
      wsClientRef.current?.registerDevice(deviceId, masjidId, deviceInfo);
    }
  }, [deviceId, masjidId]);

  const updateDeviceStatus = useCallback((status: string, lastSeen?: string, networkStatus?: string) => {
    if (deviceId) {
      wsClientRef.current?.updateDeviceStatus(deviceId, status, lastSeen, networkStatus);
    }
  }, [deviceId]);

  const updateDeviceConfig = useCallback((config: any) => {
    if (deviceId) {
      wsClientRef.current?.updateDeviceConfig(deviceId, config);
    }
  }, [deviceId]);

  const sendHeartbeat = useCallback(() => {
    if (deviceId) {
      wsClientRef.current?.sendHeartbeat(deviceId);
    }
  }, [deviceId]);

  // Admin methods
  const controlDevice = useCallback((targetDeviceId: string, action: string, data?: any) => {
    wsClientRef.current?.controlDevice(targetDeviceId, action, data);
  }, []);

  const updateSlide = useCallback((slideId: string, action: string) => {
    if (masjidId) {
      wsClientRef.current?.updateSlide(masjidId, slideId, action);
    }
  }, [masjidId]);

  const updateContent = useCallback((content: any) => {
    if (masjidId) {
      wsClientRef.current?.updateContent(masjidId, content);
    }
  }, [masjidId]);

  const restartDevice = useCallback((targetDeviceId: string) => {
    wsClientRef.current?.restartDevice(targetDeviceId);
  }, []);

  const stopDevice = useCallback((targetDeviceId: string) => {
    wsClientRef.current?.stopDevice(targetDeviceId);
  }, []);

  const startDevice = useCallback((targetDeviceId: string) => {
    wsClientRef.current?.startDevice(targetDeviceId);
  }, []);

  const broadcastMessage = useCallback((message: string, type?: string) => {
    if (masjidId) {
      wsClientRef.current?.broadcastMessage(masjidId, message, type);
    }
  }, [masjidId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Remove connect and disconnect from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Connection methods
    connect,
    disconnect,
    send,
    
    // Device methods
    registerDevice,
    updateDeviceStatus,
    updateDeviceConfig,
    sendHeartbeat,
    
    // Admin methods
    controlDevice,
    updateSlide,
    updateContent,
    restartDevice,
    stopDevice,
    startDevice,
    broadcastMessage,
    
    // Client reference
    client: wsClientRef.current,
  };
}

// Specialized hooks for different use cases
export function useDeviceWebSocket(deviceId: string, masjidId: string, options: Omit<UseWebSocketOptions, 'deviceId' | 'masjidId' | 'isAdmin'> = {}) {
  return useWebSocket({
    ...options,
    deviceId,
    masjidId,
    isAdmin: false,
  });
}

export function useAdminWebSocket(masjidId: string, options: Omit<UseWebSocketOptions, 'masjidId' | 'isAdmin'> = {}) {
  return useWebSocket({
    ...options,
    masjidId,
    isAdmin: true,
  });
} 