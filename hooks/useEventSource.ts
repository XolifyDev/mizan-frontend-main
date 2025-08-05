import { useEffect, useRef, useState, useCallback } from 'react';

interface EventSourceMessage {
  type: string;
  [key: string]: any;
}

interface UseEventSourceOptions {
  onMessage?: (message: EventSourceMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useEventSource(
  url: string, 
  params: Record<string, string> = {},
  options: UseEventSourceOptions = {}
) {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Build URL with parameters
      const urlWithParams = new URL(url, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        urlWithParams.searchParams.set(key, value);
      });

      const eventSource = new EventSource(urlWithParams.toString());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('EventSource connected');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const message: EventSourceMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse EventSource message:', error);
        }
      };

      eventSource.onerror = (event) => {
        console.error('EventSource error:', event);
        setError('EventSource connection error');
        setIsConnecting(false);
        setIsConnected(false);
        onError?.(event);

        // Attempt to reconnect if not manually closed
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

    } catch (error) {
      console.error('Failed to create EventSource connection:', error);
      setError('Failed to create EventSource connection');
      setIsConnecting(false);
    }
  }, []); // Remove dependencies to prevent infinite loops

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  }, []); // Remove dependencies to prevent infinite loops

  const sendMessage = useCallback(async (message: any) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      throw error;
    }
  }, []); // Remove dependencies to prevent infinite loops

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // Remove dependencies to prevent infinite loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    connect,
    disconnect
  };
} 