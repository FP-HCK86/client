## 🚀 Realtime Progress Modal Documentation

### 📋 Overview

Komponen baru ini menyediakan **realtime progress tracking** yang benar-benar terhubung dengan server menggunakan WebSocket/Socket.IO untuk mendapatkan update progress secara real-time.

### 🎯 Key Features

- ✅ **Real-time WebSocket Connection** - Terhubung langsung dengan server via Socket.IO
- ✅ **Auto-reconnection** - Otomatis reconnect jika koneksi terputus
- ✅ **Time Tracking** - Menampilkan elapsed time dan estimated remaining time
- ✅ **Error Handling** - Proper error handling dengan retry functionality
- ✅ **Connection Status** - Visual indicator untuk status koneksi
- ✅ **Flexible Configuration** - Mudah dikustomisasi untuk berbagai jenis proses
- ✅ **Custom Hook** - Reusable logic dengan `useRealtimeProgress`

### 🔧 Components

#### 1. `SimpleProgressModal`
Modal sederhana untuk menampilkan progress dengan UI yang bersih.

#### 2. `RealtimeProgressModal`  
Modal lengkap dengan fitur advanced seperti time estimation dan connection status.

#### 3. `useRealtimeProgress` Hook
Custom hook untuk mengelola realtime progress logic.

#### 4. `VideoAnalysisWorkflow`
Workflow component khusus untuk video analysis dengan integrasi penuh.

### 📖 Usage Examples

#### Basic Usage:
```jsx
import SimpleProgressModal from './components/SimpleProgressModal';

function MyComponent() {
  const [showProgress, setShowProgress] = useState(false);
  const [videoId, setVideoId] = useState('68d35b59ca9bde9db28ab100');

  return (
    <>
      <button onClick={() => setShowProgress(true)}>
        Start Analysis
      </button>
      
      <SimpleProgressModal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        processId={videoId}
        processType="video-analysis"
        title="AI Video Analysis"
        autoCloseOnComplete={false}
        showTimeInfo={true}
        showConnectionStatus={true}
      />
    </>
  );
}
```

#### Using Custom Hook:
```jsx
import { useRealtimeProgress } from './hooks/useRealtimeProgress';

function MyProgressComponent({ videoId }) {
  const {
    progress,
    message,
    status,
    isConnected,
    timeElapsed,
    estimatedTimeRemaining,
    formatTime,
    retry
  } = useRealtimeProgress(videoId, 'video-analysis');

  return (
    <div>
      <div>Progress: {progress}%</div>
      <div>Status: {message}</div>
      <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
      <div>Time: {formatTime(timeElapsed)}</div>
      {status === 'error' && (
        <button onClick={retry}>Retry</button>
      )}
    </div>
  );
}
```

#### Video Analysis Workflow:
```jsx
import VideoAnalysisWorkflow from './components/VideoAnalysisWorkflow';

function VideoPage({ videoId, videoTitle }) {
  return (
    <VideoAnalysisWorkflow
      videoId={videoId}
      videoTitle={videoTitle}
      onAnalysisComplete={(results) => {
        console.log('Analysis done:', results);
      }}
    />
  );
}
```

### 🔗 WebSocket Events

#### Client-side events that component listens to:
- `video-analysis-progress` - Progress updates
- `video-analysis-error` - Error notifications  
- `video-analysis-completed` - Completion notifications
- `connect` / `disconnect` - Connection status

#### Client-side events that component emits:
- `join-room` - Join specific room for process tracking
- `retry-video-analysis` - Retry failed analysis

### ⚙️ Configuration

#### Environment Variables:
```env
VITE_SERVER_BASE_URL=http://localhost:3000
```

#### Process Types:
- `video-analysis` - For video analysis tracking
- `content-generation` - For AI content generation
- `custom` - For any other process type

### 🎨 Customization

#### Props for SimpleProgressModal:
```jsx
<SimpleProgressModal
  isOpen={boolean}              // Show/hide modal
  onClose={function}           // Close handler
  processId={string}           // Unique process identifier
  processType={string}         // Type of process to track
  title={string}               // Modal title
  autoCloseOnComplete={boolean} // Auto close when done
  showTimeInfo={boolean}       // Show time information
  showConnectionStatus={boolean} // Show connection indicator
/>
```

#### Options for useRealtimeProgress:
```jsx
const options = {
  serverUrl: 'http://localhost:3000',
  autoConnect: true,
  onComplete: (data) => console.log('Done!', data),
  onError: (error) => console.error('Error:', error),
  onProgress: (data) => console.log('Progress:', data)
};
```

### 🐛 Troubleshooting

#### Common Issues:

1. **Connection Failed**: Check if server is running and VITE_SERVER_BASE_URL is correct
2. **No Progress Updates**: Ensure server emits events with correct naming convention
3. **Multiple Connections**: Make sure to properly cleanup connections in useEffect

#### Debug Mode:
Component shows debug info in development mode at bottom of modal.

### 📝 Notes

- Component automatically handles connection retries
- Progress is calculated and estimated based on elapsed time
- All time values are formatted as MM:SS
- Error states provide retry functionality
- Connection status is visually indicated

### 🔄 Migration from Old Modal

Replace old modal with new one:

```jsx
// OLD
<AnalysisProgressModalFixed ... />

// NEW  
<SimpleProgressModal 
  processId={videoId}
  processType="video-analysis"
  ... 
/>
```

This new implementation provides true real-time progress tracking with robust error handling and a clean, modern interface! 🚀
