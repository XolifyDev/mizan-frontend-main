import { useEffect, useRef, useState, useCallback } from 'react';

export interface HttpMessage {
  type: string;
  deviceId?: string;
  masjidId?: string;
  data?: any;
  [key: string]: any;
}

export interface UseHttpConnectionOptions {
  onMessage?: (message: HttpMessage) => void;
  onError?: (error: any) => void;
  interval?: number;
  autoConnect?: boolean;
}

export function useHttpConnection(url: string, options: UseHttpConnectionOptions = {}) {
  const {
    onMessage,
    onError,
    interval = 5000,
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<HttpMessage[]>([]);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const sendMessage = useCallback(async (message: HttpMessage) => {
    try {
      const response = await fetch('/api/ws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        const data = await response.json();
        onMessageRef.current?.(data);
      } else {
        console.error('HTTP request failed:', response.statusText);
        setError('HTTP request failed');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      onErrorRef.current?.(err);
    }
  }, []); // No dependencies to prevent re-creation

  const connect = useCallback(() => {
    setIsConnecting(prev => {
      if (prev) return prev; // Already connecting
      return true;
    });
    
    setIsConnected(prev => {
      if (prev) return prev; // Already connected
      return false;
    });
    
    setError(null);

    // Simulate connection establishment
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      console.log('HTTP connection established');
    }, 100);
  }, []); // No dependencies to prevent re-creation

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Remove connect and disconnect from dependencies

  return {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    connect,
    disconnect
  };
}
