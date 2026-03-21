"use client";

import React, { useEffect, useState } from 'react';
import { useAdminWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Monitor, 
  Smartphone,
  Tablet,
  Globe
} from 'lucide-react';

interface TVDisplay {
  id: string;
  name: string;
  status: string;
  lastSeen: string | null;
  platform?: string;
  model?: string;
  config?: any;
  networkStatus?: string;
}

interface WebSocketTVDisplaysProps {
  masjidId: string;
}

export default function WebSocketTVDisplays({ masjidId }: WebSocketTVDisplaysProps) {
  const [displays, setDisplays] = useState<TVDisplay[]>([]);
  const [activeDisplays, setActiveDisplays] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection for admin
  const {
    isConnected,
    isConnecting,
    error: wsError,
    onDeviceConnected,
    onDeviceDisconnected,
    onDeviceStatusChanged,
    onDeviceConfigChanged,
    restartDevice,
    stopDevice,
    startDevice,
    controlDevice,
    broadcastMessage,
  } = useAdminWebSocket(masjidId, {
    onConnect: () => {
      console.log('Admin WebSocket connected');
      setError(null);
    },
    onDisconnect: () => {
      console.log('Admin WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection failed');
    },
    onAdminSubscribed: (data) => {
      console.log('Admin subscribed, received devices:', data.devices);
      setDisplays(data.devices || []);
      setActiveDisplays((data.devices || []).filter((d: TVDisplay) => d.status === "online").length);
    },
    onDeviceConnected: (data) => {
      console.log('Device connected:', data);
      setDisplays(prev => {
        const existing = prev.find(d => d.id === data.deviceId);
        if (existing) {
          return prev.map(d => 
            d.id === data.deviceId 
              ? { ...d, status: 'online', lastSeen: new Date().toISOString() }
              : d
          );
        } else {
          return [...prev, {
            id: data.deviceId,
            name: data.deviceInfo?.deviceName || `New Device`,
            status: 'online',
            lastSeen: new Date().toISOString(),
            platform: data.deviceInfo?.platform,
            model: data.deviceInfo?.model,
            networkStatus: 'connected'
          }];
        }
      });
      setActiveDisplays(prev => prev + 1);
    },
    onDeviceDisconnected: (data) => {
      console.log('Device disconnected:', data);
      setDisplays(prev => 
        prev.map(d => 
          d.id === data.deviceId 
            ? { ...d, status: 'offline' }
            : d
        )
      );
      setActiveDisplays(prev => Math.max(0, prev - 1));
    },
    onDeviceStatusChanged: (data) => {
      console.log('Device status changed:', data);
      setDisplays(prev => 
        prev.map(d => 
          d.id === data.deviceId 
            ? { 
                ...d, 
                status: data.status, 
                lastSeen: data.lastSeen,
                networkStatus: data.networkStatus 
              }
            : d
        )
      );
      
      // Update active count
      setDisplays(prev => {
        const newDisplays = prev.map(d => 
          d.id === data.deviceId 
            ? { ...d, status: data.status }
            : d
        );
        setActiveDisplays(newDisplays.filter(d => d.status === "online").length);
        return newDisplays;
      });
    },
    onDeviceConfigChanged: (data) => {
      console.log('Device config changed:', data);
      setDisplays(prev => 
        prev.map(d => 
          d.id === data.deviceId 
            ? { ...d, config: data.config }
            : d
        )
      );
    },
  });

  // Handle device control actions
  const handleRestartDevice = async (deviceId: string) => {
    try {
      restartDevice(deviceId);
      // Show success feedback
      console.log(`Restart command sent to device ${deviceId}`);
    } catch (error) {
      console.error('Failed to restart device:', error);
      setError('Failed to restart device');
    }
  };

  const handleStopDevice = async (deviceId: string) => {
    try {
      stopDevice(deviceId);
      console.log(`Stop command sent to device ${deviceId}`);
    } catch (error) {
      console.error('Failed to stop device:', error);
      setError('Failed to stop device');
    }
  };

  const handleStartDevice = async (deviceId: string) => {
    try {
      startDevice(deviceId);
      console.log(`Start command sent to device ${deviceId}`);
    } catch (error) {
      console.error('Failed to start device:', error);
      setError('Failed to start device');
    }
  };

  const handleBroadcastMessage = async () => {
    try {
      broadcastMessage('Test broadcast message from admin dashboard', 'info');
      console.log('Broadcast message sent');
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      setError('Failed to broadcast message');
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'ios':
        return <Smartphone className="h-4 w-4" />;
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      case 'web':
        return <Globe className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, networkStatus?: string) => {
    const isOnline = status === 'online';
    const isConnected = networkStatus === 'connected';
    
    return (
      <div className="flex items-center gap-1">
        <Badge variant={isOnline ? "default" : "secondary"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
        {isOnline && (
          <div className="flex items-center">
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Format last seen
  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>WebSocket Connection Status</span>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
              </Badge>
              {isConnected && (
                <Badge variant="outline">
                  {activeDisplays} Active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wsError && (
            <Alert className="mb-4">
              <AlertDescription>
                WebSocket Error: {wsError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleBroadcastMessage}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Send Test Broadcast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displays.map((display) => (
          <Card key={display.id} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(display.platform)}
                  <span className="truncate">{display.name}</span>
                </div>
                {getStatusBadge(display.status, display.networkStatus)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Device Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Model: {display.model || 'Unknown'}</div>
                <div>Platform: {display.platform || 'Unknown'}</div>
                <div>Last Seen: {formatLastSeen(display.lastSeen)}</div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                {display.status === 'online' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStopDevice(display.id)}
                      className="flex-1"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestartDevice(display.id)}
                      className="flex-1"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restart
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartDevice(display.id)}
                    className="flex-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {displays.length === 0 && !isConnecting && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices found</h3>
              <p className="text-muted-foreground">
                {isConnected 
                  ? "No devices are currently registered for this masjid."
                  : "Connect to WebSocket to see devices."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isConnecting && displays.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Connecting to WebSocket...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 