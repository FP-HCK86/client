import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook untuk mengelola realtime progress tracking
 * @param {string} processId - ID unik untuk proses yang ditrack
 * @param {string} processType - Jenis proses (video-analysis, content-generation, etc)
 * @param {object} options - Konfigurasi tambahan
 */
export const useRealtimeProgress = (processId, processType = 'video-analysis', options = {}) => {
  const {
    serverUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000',
    autoConnect = true,
    onComplete = null,
    onError = null,
    onProgress = null
  } = options;

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');
  const [status, setStatus] = useState('idle'); // idle, connecting, processing, completed, error
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize connection
  const connect = useCallback(() => {
    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('🔌 Socket already connected, reusing connection');
      return;
    }

    // Clean up existing socket first
    if (socketRef.current) {
      console.log('🔌 Cleaning up existing socket');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log(`🔌 Connecting to ${serverUrl} for ${processType}-${processId}`);
    console.log(`🔍 Connection debug - ProcessID: ${processId}, ProcessType: ${processType}, IdField: ${getIdField(processType)}`);
    
    // Reset state
    setStatus('connecting');
    setProgress(0);
    setMessage('Connecting to server...');
    setError(null);
    setTimeElapsed(0);
    startTimeRef.current = Date.now();

    // Create socket connection
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      autoConnect: true
    });

    // Setup timer
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeElapsed(elapsed);
      }
    }, 1000);

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected:', socketRef.current.id);
      setIsConnected(true);
      setStatus('processing');
      setMessage('Connected to server...');
      
      // Join room for this specific process
      socketRef.current.emit('join-video-analysis', processId);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      if (status === 'processing') {
        setMessage('Connection lost. Retrying...');
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
      setMessage('Connection error. Please check your internet connection.');
    });

    // Listen for progress updates
    socketRef.current.on('transcript-progress', (data) => {
      console.log('📊 Progress update received:', data);
      console.log('🔍 Comparing IDs:', {
        received: data[getIdField(processType)],
        expected: processId,
        idField: getIdField(processType),
        match: data[getIdField(processType)] === processId
      });
      
      if (data[getIdField(processType)] === processId) {
        const newProgress = data.progress || 0;
        const newMessage = data.message || 'Processing...';
        const newStatus = data.status || 'processing';
        
        setProgress(newProgress);
        setMessage(newMessage);
        setStatus(newStatus);
        
        // Call progress callback
        if (onProgress) {
          onProgress({ progress: newProgress, message: newMessage, status: newStatus });
        }
        
        if (newStatus === 'completed' && newProgress === 100) {
          setStatus('completed');
          setMessage('Process completed successfully!');
          
          if (onComplete) {
            onComplete(data);
          }
        } else if (newStatus === 'error') {
          setStatus('error');
          const errorMessage = data.error || 'An error occurred during processing';
          setError(errorMessage);
          setMessage('Processing failed');
          
          if (onError) {
            onError(errorMessage);
          }
        }
      }
    });

    // Listen for error events
    socketRef.current.on(`${processType}-error`, (data) => {
      console.error('❌ Process error received:', data);
      
      if (data[getIdField(processType)] === processId) {
        const errorMessage = data.error || 'An error occurred during processing';
        setStatus('error');
        setError(errorMessage);
        setMessage('Processing failed');
        
        if (onError) {
          onError(errorMessage);
        }
      }
    });

    // Listen for completion events
    socketRef.current.on(`${processType}-completed`, (data) => {
      console.log('✅ Process completed:', data);
      
      if (data[getIdField(processType)] === processId) {
        setProgress(100);
        setStatus('completed');
        setMessage('Process completed successfully!');
        
        if (onComplete) {
          onComplete(data);
        }
      }
    });

  }, [serverUrl, processId, processType, onComplete, onError, onProgress]);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting socket...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setStatus('idle');
  }, []);

  // Retry function
  const retry = useCallback(() => {
    setProgress(0);
    setMessage('Retrying...');
    setStatus('processing');
    setError(null);
    startTimeRef.current = Date.now();
    
    // Re-emit retry event
    if (socketRef.current?.connected) {
      socketRef.current.emit(`retry-${processType}`, { [getIdField(processType)]: processId });
    } else {
      connect();
    }
  }, [connect, processId, processType]);

  // Auto connect effect
  useEffect(() => {
    if (autoConnect && processId) {
      console.log('🔌 useEffect: Auto-connecting...');
      connect();
    }

    return () => {
      console.log('🔌 useEffect cleanup: Disconnecting...');
      disconnect();
    };
  }, [autoConnect, processId]); // Removed connect, disconnect from deps

  // Helper function to get the correct ID field name
  const getIdField = (type) => {
    switch (type) {
      case 'video-analysis':
        return 'videoId';
      case 'content-generation':
        return 'contentId';
      default:
        return 'processId';
    }
  };

  return {
    // State
    progress,
    message,
    status,
    error,
    timeElapsed,
    isConnected,
    
    // Actions
    connect,
    disconnect,
    retry,
    
    // Computed values
    isProcessing: status === 'processing',
    isCompleted: status === 'completed',
    isError: status === 'error',
    isIdle: status === 'idle',
    
    // Time formatting helper
    formatTime: (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Estimated time remaining (simple calculation)
    estimatedTimeRemaining: progress > 0 && progress < 100 
      ? Math.max(0, Math.floor((timeElapsed / progress) * (100 - progress)))
      : null
  };
};

export default useRealtimeProgress;
