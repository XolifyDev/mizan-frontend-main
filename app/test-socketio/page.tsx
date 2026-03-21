"use client";

import { useState, useEffect } from 'react';
import { useAdminSocketIO } from '@/hooks/useSocketIO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { io } from 'socket.io-client';

export default function TestSocketIOPage() {
  const [testMasjidId] = useState('m_79a35c57-048d-4def-9221-4838da8786bc');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    client
  } = useAdminSocketIO(testMasjidId, {
    onConnect: () => {
      addLog('✅ Socket.IO connected successfully');
    },
    onDisconnect: () => {
      addLog('❌ Socket.IO disconnected');
    },
    onError: (error) => {
      addLog(`❌ Socket.IO error: ${error?.message || 'Unknown error'}`);
    },
    onAdminSubscribed: (data) => {
      addLog(`📡 Admin subscribed, received ${data.devices?.length || 0} devices`);
    }
  });

  useEffect(() => {
    addLog(`🔧 Socket.IO state: connected=${isConnected}, connecting=${isConnecting}, error=${error}`);
  }, [isConnected, isConnecting, error]);

  const handleManualConnect = () => {
    addLog('🔌 Attempting manual connection...');
    addLog(`🔌 URL: ${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'}`);
    connect();
  };

  const handleTestDirectConnection = () => {
    addLog('🧪 Testing direct Socket.IO connection...');
    
    // Test direct Socket.IO connection with improved configuration
    const testSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      timeout: 30000, // Increase timeout to 30 seconds
      forceNew: true,
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
    });

    testSocket.on('connect', () => {
      addLog('✅ Direct connection successful!');
      addLog(`✅ Socket ID: ${testSocket.id}`);
      addLog(`✅ Transport: ${testSocket.io.engine.transport.name}`);
      testSocket.disconnect();
    });

    testSocket.on('connect_error', (error) => {
      addLog(`❌ Direct connection failed: ${error.message}`);
      addLog(`❌ Error details: ${JSON.stringify(error)}`);
    });

    testSocket.on('disconnect', () => {
      addLog('🔌 Direct connection disconnected');
    });

    testSocket.connect();
  };

  const handleManualDisconnect = () => {
    addLog('🔌 Attempting manual disconnection...');
    disconnect();
  };

  const handleTestMessage = () => {
    if (client?.isConnected()) {
      addLog('📤 Sending test message...');
      client.send({ type: 'test_message', data: 'Hello from test page!' });
    } else {
      addLog('❌ Cannot send message - not connected');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Socket.IO Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={isConnected ? "default" : isConnecting ? "secondary" : "destructive"}>
                {isConnected ? "Connected" : isConnecting ? "Connecting" : "Disconnected"}
              </Badge>
            </div>
            {error && (
              <div className="flex items-center gap-2">
                <span>Error:</span>
                <Badge variant="destructive">{error}</Badge>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleManualConnect} disabled={isConnecting || isConnected}>
              Connect
            </Button>
            <Button onClick={handleManualDisconnect} disabled={!isConnected} variant="outline">
              Disconnect
            </Button>
            <Button onClick={handleTestMessage} disabled={!isConnected}>
              Send Test Message
            </Button>
            <Button onClick={handleTestDirectConnection} variant="secondary">
              Test Direct Connection
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Connection Details:</h3>
            <div className="text-sm space-y-1">
              <div>Masjid ID: {testMasjidId}</div>
              <div>URL: {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'}</div>
              <div>Client Ready State: {client?.getReadyState()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div>
              <strong>Environment Variables:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1">
                NEXT_PUBLIC_SOCKET_URL: {process.env.NEXT_PUBLIC_SOCKET_URL || 'undefined'}
              </pre>
            </div>
            <div>
              <strong>Browser Console Commands:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 space-y-1">
                <div>• window.pauseSocketIO() - Pause reconnection</div>
                <div>• window.resumeSocketIO() - Resume reconnection</div>
                <div>• window.blockSocketIO() - Block connections</div>
                <div>• window.unblockSocketIO() - Unblock connections</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 