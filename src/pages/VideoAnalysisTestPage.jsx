import React from 'react';
import VideoAnalysisWorkflow from '@/components/VideoAnalysisWorkflow';

const VideoAnalysisTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Video Analysis Workflow Test
        </h1>
        <VideoAnalysisWorkflow />
      </div>
    </div>
  );
};

export default VideoAnalysisTestPage;
