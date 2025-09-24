import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Clock, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeProgress } from '../hooks/useRealtimeProgress';

const SimpleProgressModal = ({ 
  isOpen, 
  onClose, 
  processId,
  processType = 'video-analysis',
  title = "Processing",
  autoCloseOnComplete = false,
  showTimeInfo = true,
  showConnectionStatus = true,
  onComplete,
  onError: onErrorProp
}) => {
  const isOpenRef = useRef(isOpen);
  
  // Update ref when isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const {
    progress,
    message,
    status,
    error,
    timeElapsed,
    isConnected,
    estimatedTimeRemaining,
    formatTime,
    retry,
    connect,
    disconnect,
    isProcessing,
    isCompleted,
    isError
  } = useRealtimeProgress(processId, processType, {
    autoConnect: false, // Don't auto-connect, we'll handle it manually
    onComplete: (data) => {
      console.log('📱 SimpleProgressModal - Process completed:', data);
      
      // Call parent onComplete callback if provided
      if (onComplete) {
        console.log('📱 Calling parent onComplete callback');
        onComplete(data);
      }
      
      if (autoCloseOnComplete && isOpenRef.current) {
        setTimeout(() => onClose(), 2000);
      }
    },
    onError: (errorMsg) => {
      console.error('📱 SimpleProgressModal - Process error:', errorMsg);
      
      // Call parent onError callback if provided
      if (onErrorProp) {
        onErrorProp(errorMsg);
      }
    }
  });

  // Manual connection control
  useEffect(() => {
    if (isOpen && processId) {
      console.log('📱 Modal opened, connecting to socket...');
      connect();
    }
    
    return () => {
      if (!isOpen) {
        console.log('📱 Modal cleanup, disconnecting from socket...');
        disconnect();
      }
    };
  }, [isOpen, processId]); // Remove connect, disconnect from deps

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
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
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
              className={`h-2.5 rounded-full transition-all duration-300 ease-out ${getProgressBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6">
          <p className="text-center text-gray-600 font-medium">{message}</p>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Time Information */}
        {showTimeInfo && (
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-gray-500 text-xs">Elapsed</p>
              <p className="font-semibold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-gray-500 text-xs">Remaining</p>
              <p className="font-semibold">
                {estimatedTimeRemaining !== null ? formatTime(estimatedTimeRemaining) : '--'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isError && (
            <button
              onClick={retry}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Retry
            </button>
          )}
          
          <button
            onClick={onClose}
            disabled={isProcessing && !error}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isCompleted 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing && !error ? 'Processing...' : isCompleted ? 'Done' : 'Close'}
          </button>
        </div>

        {/* Connection Status */}
        {showConnectionStatus && (
          <div className="mt-4 text-xs text-center">
            {isConnected ? (
              <span className="flex items-center justify-center space-x-1 text-green-600">
                <Wifi className="w-3 h-3" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-1 text-red-500">
                <WifiOff className="w-3 h-3" />
                <span>Connecting...</span>
              </span>
            )}
          </div>
        )}

        {/* Process Info (Debug) */}
        {import.meta.env.DEV && (
          <div className="mt-3 text-xs text-gray-400 text-center">
            {processType}-{processId} | Status: {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleProgressModal;
