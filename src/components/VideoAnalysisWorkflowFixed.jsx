import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PlayCircle,
  Sparkles,
  MessageCircle,
  Zap,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

import VideoAnalysisModal from "./VideoAnalysisModal";
import AnalysisConfirmationModal from "./AnalysisConfirmationModal";
import AnalysisProgressModal from "./AnalysisProgressModal";
import VideoAIChatInterface from "./VideoAIChatInterface";

const VideoAnalysisWorkflow = ({ onClose }) => {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState("selection"); // selection, confirmation, progress, chat, error
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

  const handleStartAnalysis = () => {
    if (!isAuthenticated) {
      toast.error("Please login to access video analysis features.");
      return;
    }
    setCurrentStep("selection");
    setShowSelectionModal(true);
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setCurrentStep("confirmation");
    setShowSelectionModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmAnalysis = async (video) => {
    setCurrentStep("progress");
    setIsProcessing(true);
    setShowConfirmationModal(false);
    setShowProgressModal(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/videos/${video._id}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Analysis started:", response.data);
    } catch (error) {
      console.error("Error starting analysis:", error);
      setIsProcessing(false);
      setShowProgressModal(false);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const errorMessage =
        error.response?.data?.error || "Failed to start video analysis";
      toast.error(errorMessage);
    }
  };

  const handleAnalysisComplete = (videoWithTranscript) => {
    setAnalyzedVideo(videoWithTranscript);
    setCurrentStep("chat");
    setIsProcessing(false);
    setShowProgressModal(false);
    setShowChatInterface(true);
  };

  const handleAnalysisError = (errorMessage) => {
    setError(errorMessage);
    setCurrentStep("error");
    setIsProcessing(false);
    setShowProgressModal(false);

    if (retryCount < 3) {
      toast.error(`${errorMessage} - Retry ${retryCount + 1}/3`);
    } else {
      toast.error(
        "Analysis failed after multiple attempts. Please try again later."
      );
    }
  };

  const handleChatClose = () => {
    setShowChatInterface(false);
    setCurrentStep("selection");
    setSelectedVideo(null);
    setAnalyzedVideo(null);
  };

  const resetWorkflow = () => {
    setCurrentStep("selection");
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
            Ekstrak transkrip video dan diskusikan konten dengan AI untuk
            mendapatkan insight mendalam
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="text-center space-y-4">
            {currentStep === "selection" && (
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Siap untuk Memulai Analisis
                </h3>
                <p className="text-gray-600 mb-4">
                  Pilih video dari library Anda untuk diekstrak transkripnya
                  menggunakan AI
                </p>
                <Button
                  onClick={handleStartAnalysis}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Pilih Video untuk Analisis
                </Button>
              </div>
            )}

            {currentStep === "confirmation" && selectedVideo && (
              <div>
                <h3 className="text-lg font-medium mb-2">Video Terpilih</h3>
                <p className="text-gray-600 mb-4">
                  <strong>{selectedVideo.title}</strong> - Menunggu konfirmasi
                  untuk memulai analisis
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Pilih Video Lain
                  </Button>
                  <Button
                    onClick={() => setShowConfirmationModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Lanjutkan Analisis
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "progress" && (
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Sedang Menganalisis Video
                </h3>
                <p className="text-gray-600 mb-4">
                  Proses ekstraksi transkrip sedang berlangsung. Mohon tunggu
                  sejenak...
                </p>
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              </div>
            )}

            {currentStep === "chat" && analyzedVideo && (
              <div>
                <h3 className="text-lg font-medium mb-2">Analisis Selesai!</h3>
                <p className="text-gray-600 mb-4">
                  Transkrip video berhasil diekstrak. Sekarang Anda dapat
                  berdiskusi dengan AI tentang konten video.
                </p>
                <Button
                  onClick={() => setShowChatInterface(true)}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Mulai Chat dengan AI
                </Button>
              </div>
            )}

            {currentStep === "error" && (
              <div>
                <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Mulai Ulang
                  </Button>
                  {retryCount < 3 && (
                    <Button
                      onClick={() => {
                        setRetryCount((prev) => prev + 1);
                        handleConfirmAnalysis(selectedVideo);
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Coba Lagi ({retryCount + 1}/3)
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
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
    </>
  );
};

export default VideoAnalysisWorkflow;
