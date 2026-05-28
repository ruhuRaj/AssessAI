import { useCallback, useEffect, useRef } from 'react';

interface WebSocketMessage {
  type?: string;
  jobId?: string;
  state?: string;
  progress?: number;
  returnValue?: {
    paperId?: string;
    assignmentId?: string;
    success?: boolean;
    sections?: number;
  };
  paperId?: string;
  assignmentId?: string;
}

export const useWebSocket = (
  onMessage: (data: WebSocketMessage) => void,
  onError?: (error: Error) => void
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [onMessage, onError]);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        onMessageRef.current(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onerror = () => {
      onErrorRef.current?.(new Error('WebSocket error'));
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const subscribe = useCallback((jobId: string) => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            jobId,
          })
        );
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return { subscribe };
};
