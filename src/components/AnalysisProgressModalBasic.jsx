import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AnalysisProgressModalBasic = ({ isOpen, onClose, video, progress = 0, currentStep = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          
          <h2 className="text-xl font-semibold">Menganalisis Video</h2>
          
          {video && (
            <div className="text-sm text-gray-600">
              <strong>{video.title || 'Video'}</strong>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {progress}% - {currentStep || 'Memproses...'}
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={onClose}
              variant="outline"
              disabled={progress > 0 && progress < 100}
            >
              {progress >= 100 ? 'Selesai' : 'Batal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgressModalBasic;
