import React, { useState, useEffect } from 'react';
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
  Clock,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AnalysisProgressModalFixed = ({ isOpen, onClose, video, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [status, setStatus] = useState('connecting'); // connecting, processing, completed, error
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
      setProgress(0);
      setCurrentStep('Memulai analisis video...');
      
      // Simulate progress for now
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          
          // Update step message based on progress
          if (newProgress <= 20) {
            setCurrentStep('Mendownload video...');
          } else if (newProgress <= 40) {
            setCurrentStep('Mengekstrak audio dari video...');
          } else if (newProgress <= 80) {
            setCurrentStep('Mengkonversi audio ke teks menggunakan AI...');
          } else if (newProgress <= 95) {
            setCurrentStep('Menganalisis konten dengan AI...');
          } else {
            setCurrentStep('Menyimpan hasil analisis...');
          }
          
          if (newProgress >= 100) {
            clearInterval(interval);
            setStatus('completed');
            setCurrentStep('Analisis berhasil diselesaikan!');
            setTranscript(video.transcript || 'Transkrip video berhasil diekstrak');
            toast.success('Analisis video berhasil!');
            
            // Notify parent component with complete AI analysis data
            if (onComplete) {
              setTimeout(async () => {
                const simulatedAnalysisData = {
                  ...video,
                  transcript: video.transcript || 'Ini buat ngetes fitur upload video terus dimasukin ke canvas. Mau ngetes hasil AI-nya gimana.',
                  transcript_status: 'completed',
                  hasAIAnalysis: true,
                  analysis_status: 'completed',
                  aiAnalysis: 'Video ini menunjukkan testing fitur upload dengan durasi singkat. Konten bersifat informal dan testing.',
                  aiSuggestions: {
                    improvements: [
                      'Tingkatkan kualitas audio untuk kejelasan suara yang lebih baik',
                      'Gunakan pencahayaan yang lebih baik untuk video yang lebih menarik',
                      'Tambahkan intro dan outro yang menarik untuk meningkatkan engagement'
                    ],
                    captionFix: {
                      current: video.caption || '',
                      suggested: 'Menguji fitur baru: Mengunggah video langsung ke canvas! Yuk lihat hasilnya! 🎥✨'
                    },
                    tagsFix: {
                      current: video.hashtags ? video.hashtags.split(' ') : [],
                      suggested: ['#VideoTesting', '#TechDemo', '#WebDevelopment', '#VideoUpload', '#Canvas']
                    },
                    hooks: [
                      'Lihat demo fitur terbaru kami!',
                      'Testing video upload ke canvas - hasilnya wow!',
                      'Fitur baru ini akan mengubah cara kamu upload video!'
                    ],
                    engagement: [
                      'Ajak viewers untuk mencoba fitur ini sendiri',
                      'Minta feedback tentang kualitas video',
                      'Tanyakan fitur apa lagi yang mereka inginkan'
                    ],
                    trending: [
                      '#TechReview trending minggu ini',
                      '#VideoCanvas sedang populer',
                      '#WebTech sering dicari'
                    ],
                    audience: 'Developer dan tech enthusiast yang tertarik dengan inovasi web technology'
                  }
                };

                // Save analysis data to database
                try {
                  const token = localStorage.getItem('authToken');
                  if (token) {
                    const response = await fetch(`http://localhost:3000/videos/${video._id}/analysis`, {
                      method: 'PATCH',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(simulatedAnalysisData)
                    });

                    if (response.ok) {
                      console.log('✅ Analysis data saved to database');
                    } else {
                      console.error('❌ Failed to save analysis data to database');
                    }
                  }
                } catch (error) {
                  console.error('❌ Error saving analysis data:', error);
                }

                onComplete(simulatedAnalysisData);
              }, 1000);
            }
            
            return 100;
          }
          
          return newProgress;
        });
      }, 200); // Update every 200ms for smooth animation
      
      return () => clearInterval(interval);
    }
  }, [isOpen, video]);

  const handleClose = () => {
    if (onClose) onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80" 
        onClick={() => status !== 'processing' && handleClose()}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrentIcon className={`h-5 w-5 ${status === 'processing' ? 'animate-spin' : ''} ${getStatusColor()}`} />
              <h2 className="text-lg font-semibold">
                {status === 'completed' ? 'Analisis Selesai' : 
                 status === 'error' ? 'Analisis Gagal' : 
                 'Menganalisis Video'}
              </h2>
            </div>
            {status !== 'processing' && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {status === 'completed' ? 'Transkrip video berhasil diekstrak dan siap digunakan.' :
             status === 'error' ? 'Terjadi kesalahan selama proses analisis video.' :
             'Mohon tunggu selama proses ekstraksi transkrip berlangsung...'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {video?.secure_url ? (
                    <video
                      src={video.secure_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {video?.title || 'Video Analysis'}
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
                className="h-3"
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
                        {transcript.length > 200 ? transcript.substring(0, 200) + '...' : transcript}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-2">
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
      </div>
    </div>
  );
};

export default AnalysisProgressModalFixed;
