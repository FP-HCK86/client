import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

const RealtimeProgressModal = ({ 
  isOpen, 
  onClose, 
  videoId, 
  title = "Processing Video",
  autoCloseOnComplete = false,
  onComplete = null 
}) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');
  const [status, setStatus] = useState('processing'); // processing, completed, error
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  
  const socketRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize socket connection and timer
  useEffect(() => {
    if (!isOpen || !videoId) return;

    // Reset state when modal opens
    setProgress(0);
    setMessage('Connecting to server...');
    setStatus('processing');
    setError(null);
    setTimeElapsed(0);
    setEstimatedTimeRemaining(null);
    startTimeRef.current = Date.now();

    // Setup timer for elapsed time
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeElapsed(elapsed);
        
        // Calculate estimated time remaining based on progress
        if (progress > 0 && progress < 100) {
          const estimatedTotal = (elapsed / progress) * 100;
          const remaining = Math.max(0, Math.floor(estimatedTotal - elapsed));
          setEstimatedTimeRemaining(remaining);
        }
      }
    }, 1000);

    // Initialize Socket.IO connection
    const serverUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected:', socketRef.current.id);
      setMessage('Connected to server...');
      
      // Join room for this specific video analysis
      socketRef.current.emit('join-room', `video-analysis-${videoId}`);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      if (status === 'processing') {
        setMessage('Connection lost. Retrying...');
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setMessage('Connection error. Please check your internet connection.');
    });

    // Listen for progress updates
    socketRef.current.on('video-analysis-progress', (data) => {
      console.log('📊 Progress update received:', data);
      
      if (data.videoId === videoId) {
        setProgress(data.progress || 0);
        setMessage(data.message || 'Processing...');
        setStatus(data.status || 'processing');
        
        if (data.status === 'completed' && data.progress === 100) {
          setStatus('completed');
          setMessage('Analysis completed successfully!');
          setEstimatedTimeRemaining(0);
          
          // Auto close after delay if enabled
          if (autoCloseOnComplete) {
            setTimeout(() => {
              onClose();
            }, 2000);
          }
          
          // Call completion callback
          if (onComplete) {
            onComplete(data);
          }
        } else if (data.status === 'error') {
          setStatus('error');
          setError(data.error || 'An error occurred during processing');
          setMessage('Processing failed');
        }
      }
    });

    socketRef.current.on('video-analysis-error', (data) => {
      console.error('❌ Analysis error received:', data);
      
      if (data.videoId === videoId) {
        setStatus('error');
        setError(data.error || 'An error occurred during processing');
        setMessage('Processing failed');
        setEstimatedTimeRemaining(null);
      }
    });

    socketRef.current.on('video-analysis-completed', (data) => {
      console.log('✅ Analysis completed:', data);
      
      if (data.videoId === videoId) {
        setProgress(100);
        setStatus('completed');
        setMessage('Analysis completed successfully!');
        setEstimatedTimeRemaining(0);
        
        // Auto close after delay if enabled
        if (autoCloseOnComplete) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
        
        // Call completion callback
        if (onComplete) {
          onComplete(data);
        }
      }
    });

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, videoId, autoCloseOnComplete, onComplete, progress, status]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress bar color based on status
  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={status === 'processing'}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6">
          <p className="text-center text-gray-600 font-medium">{message}</p>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-gray-500">Elapsed</p>
            <p className="font-semibold">{formatTime(timeElapsed)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-gray-500">Remaining</p>
            <p className="font-semibold">
              {estimatedTimeRemaining !== null ? formatTime(estimatedTimeRemaining) : '--'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {status === 'error' && (
            <button
              onClick={() => {
                // Retry functionality - restart the process
                setProgress(0);
                setMessage('Retrying...');
                setStatus('processing');
                setError(null);
                startTimeRef.current = Date.now();
                
                // Re-trigger the analysis (you might want to add retry API call here)
                if (socketRef.current) {
                  socketRef.current.emit('retry-analysis', { videoId });
                }
              }}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          )}
          
          <button
            onClick={onClose}
            disabled={status === 'processing' && !error}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'processing' && !error ? 'Processing...' : 'Close'}
          </button>
          
          {status === 'completed' && onComplete && (
            <button
              onClick={() => {
                onComplete({ videoId, status: 'completed', progress: 100 });
                onClose();
              }}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {/* Connection Status */}
        <div className="mt-4 text-xs text-center text-gray-500">
          {socketRef.current?.connected ? (
            <span className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connected to server</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Connecting to server...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeProgressModal;
