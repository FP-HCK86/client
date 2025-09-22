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
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AnalysisProgressModal = ({ isOpen, onClose, video, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [status, setStatus] = useState('processing'); // processing, completed, error
  
  useEffect(() => {
    if (isOpen && video) {
      console.log('Starting analysis simulation for:', video.title);
      setStatus('processing');
      setProgress(0);
      
      // Simulate analysis progress
      const steps = [
        { progress: 20, message: 'Memproses video...' },
        { progress: 40, message: 'Mengekstrak audio...' },
        { progress: 60, message: 'Mengkonversi speech ke text...' },
        { progress: 80, message: 'Menganalisis konten...' },
        { progress: 100, message: 'Selesai!' }
      ];
      
      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          const step = steps[stepIndex];
          setProgress(step.progress);
          setCurrentStep(step.message);
          
          if (step.progress === 100) {
            setStatus('completed');
            toast.success('Analisis berhasil!');
            
            // Simulate completed video with transcript
            const analyzedVideo = {
              ...video,
              transcript: 'Ini adalah contoh transcript hasil analisis video. Dalam implementasi sebenarnya, ini akan berisi hasil speech-to-text dari video.',
              transcript_status: 'completed',
              aiAnalysis: {
                summary: 'Video berisi presentasi tentang topik tertentu.',
                keyPoints: ['Point 1', 'Point 2', 'Point 3'],
                suggestions: ['Saran 1', 'Saran 2']
              }
            };
            
            if (onComplete) {
              onComplete(analyzedVideo);
            }
            
            clearInterval(interval);
          }
          stepIndex++;
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, video, onComplete]);

  const handleClose = () => {
    onClose();
  };

  const handleRetry = () => {
    setStatus('processing');
    setProgress(0);
    setCurrentStep('Memulai ulang...');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'error': return XCircle;
      default: return Loader2;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg z-[9999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${status === 'processing' ? 'animate-spin' : ''} ${getStatusColor()}`} />
            {status === 'completed' ? 'Analisis Selesai' : 
             status === 'error' ? 'Analisis Gagal' : 
             'Menganalisis Video'}
          </DialogTitle>
          <DialogDescription>
            {status === 'completed' ? 'Video berhasil dianalisis dan siap untuk diskusi.' :
             status === 'error' ? 'Terjadi kesalahan selama proses analisis.' :
             'Mohon tunggu selama proses analisis berlangsung...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Info */}
          {video && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {video.secure_url && (
                      <video
                        src={video.secure_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {video.title || 'Video tanpa judul'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {video.duration_sec ? `${Math.floor(video.duration_sec / 60)}:${String(video.duration_sec % 60).padStart(2, '0')}` : 'Durasi tidak diketahui'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className={getStatusColor()}>
                {status === 'completed' ? '100%' : 
                 status === 'error' ? 'Gagal' : 
                 `${Math.round(progress)}%`}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className={`text-center text-sm ${getStatusColor()}`}>
              {currentStep || 'Memulai analisis...'}
            </div>
          </div>

          {/* Error Details */}
          {status === 'error' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Analisis Gagal</h4>
                    <p className="text-sm text-red-800">
                      Terjadi kesalahan saat menganalisis video. Silakan coba lagi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Details */}
          {status === 'completed' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Analisis Berhasil</h4>
                    <p className="text-sm text-green-800">
                      Video telah dianalisis dan siap untuk diskusi dengan AI.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
            {status === 'processing' ? 'Sedang Proses...' : 
             status === 'completed' ? 'Mulai Chat' : 
             'Tutup'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisProgressModal;
