'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useEventSource } from '@/hooks/useEventSource';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: any) => void;
  devices: any[];
  deviceStatus: Record<string, any>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ 
  children, 
  masjidId,
  isAdmin = false 
}: { 
  children: React.ReactNode;
  masjidId?: string;
  isAdmin?: boolean;
}) {
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<Record<string, any>>({});
  
  const masjidIdRef = useRef(masjidId);
  const isAdminRef = useRef(isAdmin);
  
  // Update refs when props change
  useEffect(() => {
    masjidIdRef.current = masjidId;
    isAdminRef.current = isAdmin;
  }, [masjidId, isAdmin]);

  const { isConnected, isConnecting, error, sendMessage } = useEventSource('/api/events', {
    masjidId: masjidIdRef.current || '',
    isAdmin: isAdminRef.current ? 'true' : 'false'
  }, {
    onMessage: useCallback((message: any) => {
      console.log('EventSource message received:', message);
      
      switch (message.type) {
        case 'device_connected':
          setDevices(prev => [...prev, message.deviceInfo]);
          break;
          
        case 'device_disconnected':
          setDevices(prev => prev.filter(d => d.id !== message.deviceId));
          break;
          
        case 'device_status_changed':
          setDeviceStatus(prev => ({
            ...prev,
            [message.deviceId]: {
              status: message.status,
              lastSeen: message.lastSeen,
              networkStatus: message.networkStatus
            }
          }));
          break;
          
        case 'admin_subscribed':
          setDevices(message.devices || []);
          break;
      }
    }, []),
    onOpen: useCallback(() => {
      console.log('EventSource connected');
      // Subscribe as admin if needed
      if (isAdminRef.current && masjidIdRef.current) {
        sendMessage({
          type: 'admin_subscribe',
          masjidId: masjidIdRef.current
        });
      }
    }, [])
  });

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      isConnecting,
      error,
      sendMessage,
      devices,
      deviceStatus
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
} 