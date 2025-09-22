import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle, Sparkles, MessageCircle, Zap, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// import VideoAnalysisModal from './VideoAnalysisModal';
// import AnalysisConfirmationModal from './AnalysisConfirmationModal';
// import AnalysisProgressModal from './AnalysisProgressModal';
// import VideoAIChatInterface from './VideoAIChatInterface';

const VideoAnalysisWorkflow = ({ onClose }) => {
  // Check auth status - simplified without external hook for now
  const isAuthenticated = localStorage.getItem('authToken') ? true : false;
  const [currentStep, setCurrentStep] = useState('selection'); // selection, confirmation, progress, chat, error
  
  console.log('VideoAnalysisWorkflow rendered, isAuthenticated:', isAuthenticated, 'currentStep:', currentStep);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analyzedVideo, setAnalyzedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Modal states
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);

  const handleStartAnalysis = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to access video analysis features.');
      return;
    }
    
    // For now, let's fetch videos and show a simple selection
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const videos = response.data.items || [];
      if (videos.length === 0) {
        toast.error('No videos found. Please upload a video first.');
        return;
      }
      
      // Simple selection - for now just take the first video
      // In a full implementation, this would show a modal with video list
      const firstVideo = videos[0];
      setSelectedVideo(firstVideo);
      setCurrentStep('confirmation');
      toast.success(`Selected video: ${firstVideo.title || firstVideo.filename || 'Untitled'}`);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos. Please try again.');
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setCurrentStep('confirmation');
    setShowSelectionModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmAnalysis = async (video) => {
    if (!video) {
      toast.error('No video selected');
      return;
    }

    setCurrentStep('progress');
    setIsProcessing(true);
    toast.info('Starting video analysis...');

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await axios.post(
        `${apiUrl}/videos/${video._id}/analyze`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Analysis started:', response.data);
      
      // Simulate analysis progress - in real app this would be handled by WebSocket
      setTimeout(() => {
        handleAnalysisComplete({
          ...video,
          hasTranscript: true,
          transcript: 'Analysis completed successfully'
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error starting analysis:', error);
      setIsProcessing(false);
      setCurrentStep('error');
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        return;
      }
      
      const errorMessage = error.response?.data?.error || 'Failed to start video analysis';
      toast.error(errorMessage);
      setError({
        message: errorMessage,
        type: 'analysis',
        video: video,
        timestamp: new Date()
      });
    }
  };

  const handleAnalysisComplete = (videoWithTranscript) => {
    setAnalyzedVideo(videoWithTranscript);
    setIsProcessing(false);
    setCurrentStep('chat');
    setShowProgressModal(false);
    setShowChatInterface(true);
    
    toast.success('Analisis selesai! Siap untuk chat dengan AI');
  };

  const handleAnalysisError = (errorMessage) => {
    setIsProcessing(false);
    setShowProgressModal(false);
    setCurrentStep('error');
    setError({
      message: errorMessage,
      type: 'analysis',
      video: selectedVideo,
      timestamp: new Date()
    });
    
    toast.error(`Analisis gagal: ${errorMessage}`);
  };

  const handleRetryAnalysis = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setCurrentStep('confirmation');
      setShowConfirmationModal(true);
      toast.info(`Mencoba ulang (${retryCount + 1}/3)...`);
    } else {
      toast.error('Maksimal percobaan tercapai. Silakan coba lagi nanti.');
    }
  };

  const handleChatClose = () => {
    setShowChatInterface(false);
    setCurrentStep('selection');
    setSelectedVideo(null);
    setAnalyzedVideo(null);
  };

  const resetWorkflow = () => {
    setCurrentStep('selection');
    setSelectedVideo(null);
    setAnalyzedVideo(null);
    setIsProcessing(false);
    setError(null);
    setRetryCount(0);
    setShowSelectionModal(false);
    setShowConfirmationModal(false);
    setShowProgressModal(false);
    setShowChatInterface(false);
  };

  const handleClose = () => {
    resetWorkflow();
    if (onClose) onClose();
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center relative">
          {onClose && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Analisis Video dengan AI
          </CardTitle>
          <CardDescription className="text-lg">
            Ekstrak transkrip video dan diskusikan konten dengan AI untuk mendapatkan insight mendalam
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg border-2 ${
              currentStep === 'selection' ? 'border-blue-500 bg-blue-50' : 
              ['confirmation', 'progress', 'chat'].includes(currentStep) ? 'border-green-200 bg-green-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <PlayCircle className={`h-8 w-8 mx-auto mb-2 ${
                currentStep === 'selection' ? 'text-blue-600' : 
                ['confirmation', 'progress', 'chat'].includes(currentStep) ? 'text-green-600' : 
                'text-gray-400'
              }`} />
              <h3 className="font-medium text-sm">1. Pilih Video</h3>
              <p className="text-xs text-gray-600 mt-1">Pilih video untuk dianalisis</p>
            </div>

            <div className={`text-center p-4 rounded-lg border-2 ${
              currentStep === 'confirmation' ? 'border-blue-500 bg-blue-50' : 
              ['progress', 'chat'].includes(currentStep) ? 'border-green-200 bg-green-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <Zap className={`h-8 w-8 mx-auto mb-2 ${
                currentStep === 'confirmation' ? 'text-blue-600' : 
                ['progress', 'chat'].includes(currentStep) ? 'text-green-600' : 
                'text-gray-400'
              }`} />
              <h3 className="font-medium text-sm">2. Konfirmasi</h3>
              <p className="text-xs text-gray-600 mt-1">Review detail analisis</p>
            </div>

            <div className={`text-center p-4 rounded-lg border-2 ${
              currentStep === 'progress' ? 'border-blue-500 bg-blue-50' : 
              currentStep === 'chat' ? 'border-green-200 bg-green-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <div className={`h-8 w-8 mx-auto mb-2 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'progress' ? 'border-blue-600 bg-blue-600' : 
                currentStep === 'chat' ? 'border-green-600 bg-green-600' : 
                'border-gray-400 bg-gray-400'
              }`}>
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
              <h3 className="font-medium text-sm">3. Ekstraksi</h3>
              <p className="text-xs text-gray-600 mt-1">Proses transkrip otomatis</p>
            </div>

            <div className={`text-center p-4 rounded-lg border-2 ${
              currentStep === 'chat' ? 'border-blue-500 bg-blue-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <MessageCircle className={`h-8 w-8 mx-auto mb-2 ${
                currentStep === 'chat' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <h3 className="font-medium text-sm">4. Chat AI</h3>
              <p className="text-xs text-gray-600 mt-1">Diskusi dengan AI</p>
            </div>
          </div>

          {/* Current Status */}
          <div className="text-center space-y-4">
            {currentStep === 'selection' && (
              <div>
                <h3 className="text-lg font-medium mb-2">Siap untuk Memulai Analisis</h3>
                <p className="text-gray-600 mb-4">
                  Pilih video dari library Anda untuk diekstrak transkripnya menggunakan AI
                </p>
                <Button onClick={handleStartAnalysis} size="lg" className="btn-default">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Pilih Video untuk Analisis
                </Button>
              </div>
            )}

            {currentStep === 'confirmation' && selectedVideo && (
              <div>
                <h3 className="text-lg font-medium mb-2">Video Terpilih</h3>
                <p className="text-gray-600 mb-4">
                  <strong>{selectedVideo.title}</strong> - Menunggu konfirmasi untuk memulai analisis
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Pilih Video Lain
                  </Button>
                  <Button onClick={() => handleConfirmAnalysis(selectedVideo)} className="btn-default">
                    <Zap className="h-4 w-4 mr-2" />
                    Mulai Analisis
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'progress' && (
              <div>
                <h3 className="text-lg font-medium mb-2">Sedang Menganalisis Video</h3>
                <p className="text-gray-600 mb-4">
                  Proses ekstraksi transkrip sedang berlangsung. Mohon tunggu sejenak...
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600">Memproses video...</span>
                </div>
              </div>
            )}

            {currentStep === 'chat' && analyzedVideo && (
              <div>
                <h3 className="text-lg font-medium mb-2">Analisis Selesai!</h3>
                <p className="text-gray-600 mb-4">
                  Transkrip <strong>{analyzedVideo.title}</strong> berhasil diekstrak. Mulai chat dengan AI untuk mendapatkan insight.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Analisis Video Lain
                  </Button>
                  <Button onClick={() => setShowChatInterface(true)} className="btn-default">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat dengan AI
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'error' && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-900 mb-2">Analisis Gagal</h3>
                  <p className="text-red-700 mb-4">
                    {error.message || 'Terjadi kesalahan saat menganalisis video'}
                  </p>
                  
                  {error.video && (
                    <div className="text-sm text-red-600 mb-4">
                      Video: <strong>{error.video.title}</strong>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={resetWorkflow}>
                      Pilih Video Lain
                    </Button>
                    {retryCount < 3 && (
                      <Button onClick={handleRetryAnalysis} className="bg-red-600 hover:bg-red-700">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Coba Lagi ({retryCount + 1}/3)
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-red-600">
                    <p>Tips troubleshooting:</p>
                    <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-1">
                      <li>Pastikan koneksi internet stabil</li>
                      <li>Coba video dengan durasi lebih pendek</li>
                      <li>Periksa format video yang didukung</li>
                      <li>Tunggu beberapa menit sebelum mencoba lagi</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features Overview */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-center mb-4">Fitur Analisis Video</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h5 className="font-medium">Ekstraksi Transkrip</h5>
                <p className="text-sm text-gray-600">Konversi audio video menjadi teks menggunakan OpenAI Whisper</p>
              </div>
              <div>
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <h5 className="font-medium">Analisis AI</h5>
                <p className="text-sm text-gray-600">Dapatkan insight mendalam tentang konten dan pesan video</p>
              </div>
              <div>
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h5 className="font-medium">Chat Interaktif</h5>
                <p className="text-sm text-gray-600">Diskusi dengan AI tentang konten video secara real-time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals - temporarily commented out until components are ready */}
      {/*
      <VideoAnalysisModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onVideoSelect={handleVideoSelect}
      />

      <AnalysisConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        video={selectedVideo}
        onConfirm={handleConfirmAnalysis}
        isProcessing={isProcessing}
      />

      <AnalysisProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        video={selectedVideo}
        onComplete={handleAnalysisComplete}
        onError={handleAnalysisError}
      />

      <VideoAIChatInterface
        isOpen={showChatInterface}
        onClose={handleChatClose}
        video={analyzedVideo}
      />
      */}
    </>
  );
};

export default VideoAnalysisWorkflow;
