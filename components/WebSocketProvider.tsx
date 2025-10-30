"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useHttpConnection } from '@/hooks/useHttpConnection';
import { useSearchParams } from 'next/navigation';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: any) => Promise<void>;
  devices: any[];
  deviceStatus: Record<string, any>;
}

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
  
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<Record<string, any>>({});
  
  const masjidIdRef = useRef(masjidId);
  const isAdminRef = useRef(isAdmin);

  // Update refs when props change
  useEffect(() => {
    masjidIdRef.current = masjidId;
  }, [masjidId]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  const onMessage = useCallback((message: any) => {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'admin_subscribed':
        console.log('Admin subscribed, received devices:', message.devices);
        setDevices(message.devices || []);
        break;
        
      case 'device_connected':
        console.log('Device connected:', message);
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
        console.log('Device disconnected:', message);
        setDevices(prev => 
          prev.map(d => 
            d.id === message.deviceId 
              ? { ...d, status: 'offline' }
              : d
          )
        );
        break;
        
      case 'device_status_changed':
        console.log('Device status changed:', message);
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
        console.log('Device config changed:', message);
        setDevices(prev => 
          prev.map(d => 
            d.id === message.deviceId 
              ? { ...d, config: message.config }
              : d
          )
        );
        break;
        
      case 'device_content_changed':
        console.log('Device content changed:', message);
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
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const onError = useCallback((error: any) => {
    console.error('HTTP connection error:', error);
  }, []);

  const { isConnected, isConnecting, error, sendMessage } = useHttpConnection('/api/ws', {
    onMessage,
    onError,
    autoConnect: true,
    interval: 5000
  });

  // Send admin subscribe when connected
  useEffect(() => {
    if (isConnected && isAdminRef.current && masjidIdRef.current) {
      console.log('HTTP connection established, sending admin subscribe for masjid:', masjidIdRef.current);
      sendMessage({
        type: 'admin_subscribe',
        masjidId: masjidIdRef.current
      });
    }
  }, [isConnected]); // Remove sendMessage from dependencies to prevent infinite loop

  const contextValue: WebSocketContextType = {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    devices,
    deviceStatus
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}