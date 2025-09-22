import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Music,
  FileText,
  Trash2,
  Clock
} from 'lucide-react';
// import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const AnalysisProgressModal = ({ isOpen, onClose, video, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [status, setStatus] = useState('connecting'); // connecting, processing, completed, error
  const [socket, setSocket] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Progress steps for visual indication
  const steps = [
    { key: 'connecting', label: 'Menghubungkan...', icon: Loader2 },
    { key: 'downloading', label: 'Download Video', icon: Download },
    { key: 'extracting', label: 'Ekstraksi Audio', icon: Music },
    { key: 'transcribing', label: 'Konversi Speech-to-Text', icon: FileText },
    { key: 'saving', label: 'Menyimpan Hasil', icon: CheckCircle },
    { key: 'cleaning', label: 'Cleanup File', icon: Trash2 }
  ];

  useEffect(() => {
    console.log('🔄 AnalysisProgressModal useEffect triggered');
    console.log('📊 Modal state - isOpen:', isOpen, 'video:', video);
    
    if (isOpen && video) {
      console.log('✅ Initializing progress simulation...');
      setStartTime(Date.now());
      setStatus('processing');
      
      // Simulate progress for now
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('completed');
            toast.success('Analisis video berhasil!');
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, video]);

  const handleClose = () => {
    onClose();
  };

  const handleRetry = () => {
    setStatus('connecting');
    setProgress(0);
    setCurrentStep('');
    setErrorMessage('');
    setTranscript(null);
    setStartTime(Date.now());
    
    // Restart simulation
    setTimeout(() => {
      setStatus('processing');
    }, 1000);
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return '';
    
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `~${seconds} detik lagi`;
    
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} menit lagi`;
  };

  const getCurrentStepIcon = () => {
    if (status === 'completed') return CheckCircle;
    if (status === 'error') return XCircle;
    if (status === 'connecting') return Loader2;
    
    // Determine current step based on progress
    if (progress < 10) return Download;
    if (progress < 30) return Music;
    if (progress < 90) return FileText;
    if (progress < 95) return CheckCircle;
    return Trash2;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const CurrentIcon = getCurrentStepIcon();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl z-[9999]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrentIcon className={`h-5 w-5 ${status === 'processing' ? 'animate-spin' : ''} ${getStatusColor()}`} />
            {status === 'completed' ? 'Analisis Selesai' : 
             status === 'error' ? 'Analisis Gagal' : 
             'Menganalisis Video'}
          </DialogTitle>
          <DialogDescription>
            {status === 'completed' ? 'Transkrip video berhasil diekstrak dan siap digunakan.' :
             status === 'error' ? 'Terjadi kesalahan selama proses analisis video.' :
             'Mohon tunggu selama proses ekstraksi transkrip berlangsung...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <video
                    src={video?.secure_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {video?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Durasi: {video?.duration_sec ? `${Math.floor(video.duration_sec / 60)}:${String(video.duration_sec % 60).padStart(2, '0')}` : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className={getStatusColor()}>
                  {status === 'completed' ? '100%' : 
                   status === 'error' ? 'Gagal' : 
                   `${Math.round(progress)}%`}
                </span>
              </div>
              <Progress 
                value={status === 'completed' ? 100 : progress} 
                className="h-2"
              />
            </div>

            {/* Current Step */}
            <div className="text-center space-y-2">
              <div className={`text-sm font-medium ${getStatusColor()}`}>
                {status === 'completed' ? 'Analisis berhasil diselesaikan!' :
                 status === 'error' ? errorMessage :
                 currentStep || 'Memulai analisis...'}
              </div>
              
              {estimatedTimeRemaining && status === 'processing' && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(estimatedTimeRemaining)}
                </div>
              )}
            </div>

            {/* Steps Indicator */}
            {status === 'processing' && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                {steps.slice(1).map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = progress >= (index + 1) * 20;
                  const isCurrent = progress >= index * 20 && progress < (index + 1) * 20;
                  
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-1 p-2 rounded ${
                        isActive ? 'bg-green-100 text-green-700' :
                        isCurrent ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <StepIcon className={`h-3 w-3 ${isCurrent ? 'animate-spin' : ''}`} />
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error Details */}
            {status === 'error' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Detail Error</h4>
                      <p className="text-sm text-red-800">
                        {errorMessage || 'Terjadi kesalahan yang tidak diketahui'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Details */}
            {status === 'completed' && transcript && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">Transkrip Berhasil Dibuat</h4>
                      <p className="text-sm text-green-800 mb-2">
                        Jumlah kata: ~{transcript.split(' ').length} kata
                      </p>
                      <p className="text-xs text-green-700 bg-green-100 p-2 rounded max-h-20 overflow-y-auto">
                        {transcript.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          {status === 'error' && (
            <Button onClick={handleRetry} variant="outline">
              Coba Lagi
            </Button>
          )}
          <Button 
            onClick={handleClose}
            disabled={status === 'processing'}
            variant={status === 'completed' ? 'default' : 'outline'}
          >
            {status === 'processing' ? 'Proses Berjalan...' : 
             status === 'completed' ? 'Mulai Chat dengan AI' : 
             'Tutup'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisProgressModal;
