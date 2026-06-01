"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useHttpConnection } from '@/hooks/useHttpConnection';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: Record<string, unknown>) => Promise<void>;
  devices: WebSocketDevice[];
  deviceStatus: Record<string, string>;
}

type WebSocketDevice = {
  id: string;
  name: string;
  status: string;
  lastSeen: Date | null;
  platform?: string | null;
  model?: string | null;
  masjidId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  config?: Record<string, unknown>;
  assignedContentId?: string | null;
  ipAddress?: string | null;
  content?: string;
  lastContentUpdate?: Date;
};

type WebSocketMessage = {
  type: string;
  devices?: WebSocketDevice[];
  deviceId?: string;
  deviceInfo?: {
    deviceName?: string;
    platform?: string;
    model?: string;
  };
  masjidId?: string;
  status?: string;
  lastSeen?: string;
  config?: Record<string, unknown>;
  contentType?: string;
  lastContentUpdate?: string;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  masjidId?: string;
  isAdmin?: boolean;
}

export function WebSocketProvider({ children, masjidId: propMasjidId, isAdmin: propIsAdmin }: WebSocketProviderProps) {
  const searchParams = useSearchParams();
  const masjidId = propMasjidId || searchParams.get('masjidId') || '';
  const isAdmin = propIsAdmin || false;
  
  const [devices, setDevices] = useState<WebSocketDevice[]>([]);
  const [deviceStatus] = useState<Record<string, string>>({});
  const [socketState, setSocketState] = useState({
    isConnected: false,
    isConnecting: false,
    error: null as string | null,
  });
  const socketRef = useRef<Socket | null>(null);

  const masjidIdRef = useRef(masjidId);
  const isAdminRef = useRef(isAdmin);

  // Update refs when props change
  useEffect(() => {
    masjidIdRef.current = masjidId;
  }, [masjidId]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  const onMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'presence_snapshot':
      case 'admin_subscribed':
        setDevices(message.devices || []);
        break;
        
      case 'device_connected':
        setDevices(prev => {
          const existing = prev.find(d => d.id === message.deviceId);
          if (existing) {
            return prev.map(d => 
              d.id === message.deviceId 
                ? { ...d, status: 'online', lastSeen: new Date() }
                : d
            );
          } else {
            return [...prev, {
              id: message.deviceId,
              name: message.deviceInfo?.deviceName || `Device ${message.deviceId}`,
              status: 'online',
              lastSeen: new Date(),
              platform: message.deviceInfo?.platform,
              model: message.deviceInfo?.model,
              masjidId: message.masjidId,
              createdAt: new Date(),
              updatedAt: new Date(),
              config: {},
              assignedContentId: null,
              ipAddress: null,
            }];
          }
        });
        break;
        
      case 'device_disconnected':
        setDevices(prev => 
          prev.map(d => 
            d.id === message.deviceId 
              ? { ...d, status: 'offline' }
              : d
          )
        );
        break;
        
      case 'device_status_changed':
        setDevices(prev => 
          prev.map(d => 
            d.id === message.deviceId 
              ? { 
                  ...d, 
                  status: message.status, 
                  lastSeen: message.lastSeen ? new Date(message.lastSeen) : d.lastSeen
                }
              : d
          )
        );
        break;
        
      case 'device_config_changed':
        setDevices(prev => 
          prev.map(d => 
            d.id === message.deviceId 
              ? { ...d, config: message.config }
              : d
          )
        );
        break;
        
      case 'device_content_changed':
        setDevices(prev => 
          prev.map(d => 
            d.id === message.deviceId 
              ? { 
                  ...d, 
                  content: message.contentType || 'prayer',
                  lastContentUpdate: message.lastContentUpdate ? new Date(message.lastContentUpdate) : new Date(),
                  lastSeen: new Date()
                }
              : d
          )
        );
        break;
        
      default:
        break;
    }
  }, []);

  const onError = useCallback((error: unknown) => {
    console.error('HTTP connection error:', error);
  }, []);

  const { isConnected, isConnecting, error, sendMessage } = useHttpConnection('/api/ws', {
    onMessage,
    onError,
    autoConnect: true,
    interval: 5000
  });

  const handleRealtimeMessage = useCallback((message: WebSocketMessage) => {
    onMessage(message);
  }, [onMessage]);

  useEffect(() => {
    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
    if (!realtimeUrl || !isAdmin || !masjidId) return;

    let mounted = true;

    const connectRealtime = async () => {
      setSocketState({
        isConnected: false,
        isConnecting: true,
        error: null,
      });

      try {
        const response = await fetch(`/api/realtime/admin-token?masjidId=${encodeURIComponent(masjidId)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch realtime token');
        }

        const data = await response.json();
        if (!mounted) return;

        const socket = io(data.realtimeUrl || realtimeUrl, {
          transports: ['websocket', 'polling'],
          auth: {
            token: data.token,
          },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (!mounted) return;
          setSocketState({
            isConnected: true,
            isConnecting: false,
            error: null,
          });
          socket.emit('admin_subscribe', { masjidId });
        });

        socket.on('connect_error', (socketError) => {
          if (!mounted) return;
          setSocketState({
            isConnected: false,
            isConnecting: false,
            error: socketError.message || 'Realtime connection error',
          });
        });

        socket.on('disconnect', () => {
          if (!mounted) return;
          setSocketState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
          }));
        });

        [
          'presence_snapshot',
          'device_connected',
          'device_disconnected',
          'device_status_changed',
          'device_config_changed',
          'device_content_changed',
        ].forEach((eventName) => {
          socket.on(eventName, handleRealtimeMessage);
        });
      } catch (realtimeError) {
        console.error('Realtime connection failed, falling back to HTTP polling:', realtimeError);
        if (!mounted) return;
        setSocketState({
          isConnected: false,
          isConnecting: false,
          error: realtimeError instanceof Error ? realtimeError.message : 'Realtime connection failed',
        });
      }
    };

    connectRealtime();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [handleRealtimeMessage, isAdmin, masjidId]);

  const sendRealtimeMessage = useCallback(async (message: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      await sendMessage(message);
      return;
    }

    switch (message.type) {
      case 'admin_device_control':
        socket.emit('admin_device_control', message);
        break;
      case 'admin_broadcast':
      case 'admin_broadcast_message':
        socket.emit('admin_broadcast_message', message);
        break;
      case 'admin_subscribe':
        socket.emit('admin_subscribe', message);
        break;
      default:
        await sendMessage(message);
        break;
    }
  }, [sendMessage]);

  // Send admin subscribe when connected
  useEffect(() => {
    const activeRealtime = process.env.NEXT_PUBLIC_REALTIME_URL && socketRef.current?.connected;
    if ((activeRealtime || isConnected) && isAdminRef.current && masjidIdRef.current) {
      sendRealtimeMessage({
        type: 'admin_subscribe',
        masjidId: masjidIdRef.current
      });
    }
  }, [isConnected, sendRealtimeMessage, socketState.isConnected]);

  const contextValue: WebSocketContextType = {
    isConnected: socketRef.current ? socketState.isConnected : isConnected,
    isConnecting: socketRef.current ? socketState.isConnecting : isConnecting,
    error: socketRef.current ? socketState.error : error,
    sendMessage: sendRealtimeMessage,
    devices,
    deviceStatus
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}
