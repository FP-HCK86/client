import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlayCircle,
  Clock,
  DollarSign,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

const AnalysisConfirmationModal = ({
  isOpen,
  onClose,
  video,
  onConfirm,
  isProcessing,
}) => {
  if (!video) return null;

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Estimate processing time based on video duration
  const estimateProcessingTime = (durationSec) => {
    if (!durationSec) return "1-2 menit";

    // Rough estimate: 1 minute of video = 30-60 seconds processing time
    const minutes = Math.ceil(durationSec / 60);
    const processingMinutes = Math.max(1, Math.ceil(minutes * 0.5));

    if (processingMinutes === 1) return "1-2 menit";
    if (processingMinutes < 5)
      return `${processingMinutes}-${processingMinutes + 1} menit`;
    return `${processingMinutes}-${Math.ceil(processingMinutes * 1.2)} menit`;
  };

  // Estimate cost (simplified calculation)
  const estimateCost = (durationSec) => {
    if (!durationSec) return "Gratis";

    // Whisper API pricing is around $0.006 per minute
    const minutes = Math.ceil(durationSec / 60);
    const costUSD = minutes * 0.006;

    if (costUSD < 0.01) return "Gratis";
    return `~$${costUSD.toFixed(3)}`;
  };

  const processingTime = estimateProcessingTime(video.duration_sec);
  const estimatedCost = estimateCost(video.duration_sec);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Konfirmasi Analisis Video
          </DialogTitle>
          <DialogDescription>
            Pastikan detail analisis berikut sudah sesuai sebelum memulai proses
            ekstraksi transkrip.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={video.secure_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration_sec)}
                    </div>
                    <div>
                      Dibuat:{" "}
                      {new Date(video.createdAt).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                  {video.caption && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {video.caption}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">
                  Estimasi Waktu
                </h4>
                <p className="text-sm text-gray-600">{processingTime}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">
                  Estimasi Biaya
                </h4>
                <p className="text-sm text-gray-600">{estimatedCost}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Output</h4>
                <p className="text-sm text-gray-600">Transkrip Lengkap</p>
              </CardContent>
            </Card>
          </div>

          {/* Process Information */}
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    Proses yang Akan Dilakukan:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Download video dari Cloudinary</li>
                    <li>Ekstraksi audio dari video</li>
                    <li>Konversi speech-to-text menggunakan OpenAI Whisper</li>
                    <li>Menyimpan transkrip ke database</li>
                    <li>Cleanup file temporary</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning for already processed videos */}
          {video.transcript_status === "completed" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">
                      Video Sudah Dianalisis
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Video ini sudah memiliki transkrip. Analisis ulang akan
                      mengganti transkrip yang ada.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing warning */}
          {video.transcript_status === "processing" && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-1">
                      Analisis Sedang Berjalan
                    </h4>
                    <p className="text-sm text-orange-800">
                      Video ini sedang dalam proses analisis. Memulai analisis
                      baru akan membatalkan proses yang sedang berjalan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button
            onClick={() => onConfirm(video)}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memulai Analisis...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Mulai Analisis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisConfirmationModal;
