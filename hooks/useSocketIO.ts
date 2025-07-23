import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createSocketIOClient, getSocketIOClient, disconnectSocketIO, SocketCallbacks } from '@/lib/socketio/client';

interface UseSocketIOOptions extends SocketCallbacks {
  url?: string;
  autoConnect?: boolean;
  deviceId?: string;
  masjidId?: string;
  isAdmin?: boolean;
}

interface SocketIOState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  readyState: number | undefined;
}

export function useSocketIO(options: UseSocketIOOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_SOCKET_URL ? `${process.env.NEXT_PUBLIC_SOCKET_URL}` : 'http://localhost:3000',
    autoConnect = true,
    deviceId,
    masjidId,
    isAdmin = false,
    ...callbacks
  } = options;

  // Check if Socket.IO is disabled
  const wsDisabled = typeof window !== 'undefined' && localStorage.getItem('ws_disabled') === 'true';

  const [state, setState] = useState<SocketIOState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    readyState: undefined,
  });

  const socketClientRef = useRef<ReturnType<typeof createSocketIOClient> | null>(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Enhanced callbacks with state updates
  const enhancedCallbacks: SocketCallbacks = useMemo(() => ({
    onConnect: () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        readyState: socketClientRef.current?.getReadyState(),
      }));
      callbacksRef.current.onConnect?.();
    },
    onDisconnect: () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        readyState: socketClientRef.current?.getReadyState(),
      }));
      callbacksRef.current.onDisconnect?.();
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: error?.message || 'Socket.IO error occurred',
        isConnecting: false,
      }));
      callbacksRef.current.onError?.(error);
    },
    ...callbacksRef.current,
  }), []); // Empty dependency array to prevent recreation

  // Initialize Socket.IO client
  const initializeSocketIO = useCallback(() => {
    if (!socketClientRef.current) {
      socketClientRef.current = createSocketIOClient(url, enhancedCallbacks);
    }
    return socketClientRef.current;
  }, [url, enhancedCallbacks]);

  // Connect to Socket.IO
  const connect = useCallback(async () => {
    if (wsDisabled) {
      console.log('Socket.IO disabled - not attempting to connect');
      return;
    }

    console.log('Socket.IO: Attempting to connect...');
    console.log('Socket.IO: URL:', url);
    console.log('Socket.IO: Device ID:', deviceId);
    console.log('Socket.IO: Masjid ID:', masjidId);
    console.log('Socket.IO: Is Admin:', isAdmin);

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      const client = initializeSocketIO();
      console.log('Socket.IO: Client initialized, attempting connection...');
      
      // Add a timeout to the connection attempt
      const connectionPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timeout after 35 seconds'));
        }, 35000); // 35 second timeout (5 seconds more than Socket.IO timeout)
      });
      
      await Promise.race([connectionPromise, timeoutPromise]);
      console.log('Socket.IO: Connection successful');
      
      // Auto-register device or subscribe as admin
      if (deviceId && masjidId && !isAdmin) {
        // Device registration will be handled by the device itself
        console.log('Device ready for registration');
      } else if (masjidId && isAdmin) {
        console.log('Subscribing as admin to masjid:', masjidId);
        client.subscribeAsAdmin(masjidId);
      }
    } catch (error) {
      console.error('Socket.IO: Connection failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false,
      }));
    }
  }, [initializeSocketIO, deviceId, masjidId, isAdmin, wsDisabled]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    socketClientRef.current?.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  // Send message
  const send = useCallback((message: any) => {
    if (socketClientRef.current?.isConnected()) {
      socketClientRef.current.send(message);
    } else {
      console.error('Socket.IO is not connected');
    }
  }, []);

  // Device methods
  const registerDevice = useCallback((deviceInfo: any) => {
    if (deviceId && masjidId) {
      socketClientRef.current?.registerDevice(deviceId, masjidId, deviceInfo);
    }
  }, [deviceId, masjidId]);

  const updateDeviceStatus = useCallback((status: string, lastSeen?: string, networkStatus?: string) => {
    if (deviceId) {
      socketClientRef.current?.updateDeviceStatus(deviceId, status, lastSeen, networkStatus);
    }
  }, [deviceId]);

  const updateDeviceConfig = useCallback((config: any) => {
    if (deviceId) {
      socketClientRef.current?.updateDeviceConfig(deviceId, config);
    }
  }, [deviceId]);

  const sendHeartbeat = useCallback(() => {
    if (deviceId) {
      socketClientRef.current?.sendHeartbeat(deviceId);
    }
  }, [deviceId]);

  // Admin methods
  const controlDevice = useCallback((targetDeviceId: string, action: string, data?: any) => {
    socketClientRef.current?.controlDevice(targetDeviceId, action, data);
  }, []);

  const updateSlide = useCallback((slideId: string, action: string) => {
    if (masjidId) {
      socketClientRef.current?.updateSlide(masjidId, slideId, action);
    }
  }, [masjidId]);

  const updateContent = useCallback((content: any) => {
    if (masjidId) {
      socketClientRef.current?.updateContent(masjidId, content);
    }
  }, [masjidId]);

  const restartDevice = useCallback((targetDeviceId: string) => {
    socketClientRef.current?.restartDevice(targetDeviceId);
  }, []);

  const stopDevice = useCallback((targetDeviceId: string) => {
    socketClientRef.current?.stopDevice(targetDeviceId);
  }, []);

  const startDevice = useCallback((targetDeviceId: string) => {
    socketClientRef.current?.startDevice(targetDeviceId);
  }, []);

  const broadcastMessage = useCallback((message: string, type?: string) => {
    if (masjidId) {
      socketClientRef.current?.broadcastMessage(masjidId, message, type);
    }
  }, [masjidId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !wsDisabled) {
      // Add a small delay to prevent connection interruptions during page load
      const timer = setTimeout(() => {
        console.log('Socket.IO: Auto-connecting after delay...');
        connect();
      }, 1000); // 1 second delay

      return () => {
        clearTimeout(timer);
        disconnect();
      };
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, wsDisabled]); // Remove connect and disconnect from dependencies

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
    client: socketClientRef.current,
  };
}

// Specialized hooks for different use cases
export function useDeviceSocketIO(deviceId: string, masjidId: string, options: Omit<UseSocketIOOptions, 'deviceId' | 'masjidId' | 'isAdmin'> = {}) {
  return useSocketIO({
    ...options,
    deviceId,
    masjidId,
    isAdmin: false,
  });
}

export function useAdminSocketIO(masjidId: string, options: Omit<UseSocketIOOptions, 'masjidId' | 'isAdmin'> = {}) {
  return useSocketIO({
    ...options,
    masjidId,
    isAdmin: true,
  });
} 