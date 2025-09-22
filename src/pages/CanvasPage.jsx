import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  UploadCloud,
  Film,
  Sparkles,
  Save,
  Lightbulb,
  Video,
  Send,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import AnalysisProgressModal from "@/components/AnalysisProgressModalFixed";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api from "../api/client";

const MAX_FILE_MB = 1024; // 1 GB

export default function CanvasPage() {
  const navigate = useNavigate();
  const [canvasMode, setCanvasMode] = useState("create"); // 'create' or 'discuss'
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Halo! Sebelum kita mulai membuat konten, mari pilih persona creator Anda dulu. Apakah Anda ingin menggunakan persona yang sudah ada atau membuat persona baru?"
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [videoChatInput, setVideoChatInput] = useState("");
  const [videoChatMessages, setVideoChatMessages] = useState([]);
  const [isVideoChatLoading, setIsVideoChatLoading] = useState(false);
  const chatContainerRef = React.useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showPersonaSelection, setShowPersonaSelection] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCreatePersonaForm, setShowCreatePersonaForm] = useState(false);
  const [personaFormData, setPersonaFormData] = useState({
    name: '',
    contentNiche: '',
    platformPriority: '',
    contentStyle: '',
    brandVoice: '',
    targetAudience: {
      ageGroup: '',
      location: 'indonesia'
    },
    videoDurationPreference: '',
    contentGoals: [],
    description: '',
    keyTopics: [],
    isActive: false
  });

  // Chat History State (inside chat container)
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Video List State (for discuss mode)
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  // Progress modal states
  const [showAnalysisProgress, setShowAnalysisProgress] = useState(false);
  const [analysisVideo, setAnalysisVideo] = useState(null);

  // Handle authentication errors
  const handleAuthError = () => {
    localStorage.removeItem('authToken');
    toast.error('Your session has expired. Please login again.');
    navigate('/login');
  };

  // Start video analysis for selected video
  const startVideoAnalysis = async (video) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Please login to access video analysis features.');
        navigate('/login');
        return;
      }

      // Show loading toast
      toast.loading('Starting video analysis...', { id: 'video-analysis' });

      const response = await fetch(`http://localhost:3000/videos/${video._id}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Analysis response:', data);
        
        // Handle different analysis states
        if (data.status === 'processing' && data.message === 'Analysis already in progress') {
          toast.success('Analisis video sedang berjalan. Menampilkan progress...', { 
            id: 'video-analysis',
            duration: 3000
          });
          
          // Show progress modal for already running analysis
          setAnalysisVideo(video);
          setShowAnalysisProgress(true);
          
        } else if (data.status === 'processing' && data.message === 'Video analysis started') {
          toast.success('Video analysis started successfully!', { id: 'video-analysis' });
          
          // Show progress modal for newly started analysis
          setAnalysisVideo(video);
          setShowAnalysisProgress(true);
        }
        
      } else if (response.status === 401) {
        handleAuthError();
        return;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to start video analysis', { id: 'video-analysis' });
      }
    } catch (error) {
      console.error('Error starting video analysis:', error);
      toast.error('Network error occurred while starting analysis', { id: 'video-analysis' });
    }
  };

  // Send video chat message
  const sendVideoChatMessage = async () => {
    if (!videoChatInput.trim() || !selectedVideo || !selectedVideo.hasAIAnalysis) return;

    const userMessage = {
      id: Date.now(),
      text: videoChatInput,
      sender: 'user',
      timestamp: new Date()
    };

    setVideoChatMessages(prev => [...prev, userMessage]);
    setVideoChatInput('');
    setIsVideoChatLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/videos/${selectedVideo._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: videoChatInput,
          context: {
            transcript: selectedVideo.aiAnalysis?.transcript,
            analysis: selectedVideo.aiAnalysis?.analysis,
            suggestions: selectedVideo.aiAnalysis?.suggestions
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        setVideoChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
        sender: 'ai',
        timestamp: new Date()
      };
      setVideoChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsVideoChatLoading(false);
    }
  };

  const handleVideoChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendVideoChatMessage();
    }
  };

  // Delete video analysis
  const deleteVideoAnalysis = async (video) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Please login to access this feature.');
        navigate('/login');
        return;
      }

      // Show confirmation
      if (!window.confirm('Apakah Anda yakin ingin menghapus analisis AI untuk video ini?')) {
        return;
      }

      toast.loading('Menghapus analisis AI...', { id: 'delete-analysis' });

      const response = await fetch(`http://localhost:3000/videos/${video._id}/analysis`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Analisis AI berhasil dihapus!', { id: 'delete-analysis' });
        
        // Update video in state
        const updatedVideo = {
          ...video,
          hasAIAnalysis: false,
          transcript: null,
          transcript_status: null,
          aiAnalysis: null,
          aiSuggestions: null
        };

        // Update selected video
        setSelectedVideo(updatedVideo);

        // Update videos list
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v._id === video._id ? updatedVideo : v
          )
        );

        // Clear chat messages
        setVideoChatMessages([]);
        
      } else if (response.status === 401) {
        handleAuthError();
        return;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menghapus analisis AI', { id: 'delete-analysis' });
      }
    } catch (error) {
      console.error('Error deleting video analysis:', error);
      toast.error('Network error occurred while deleting analysis', { id: 'delete-analysis' });
    }
  };

  // Auto-scroll chat to bottom when new messages arrive
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [videoChatMessages, isVideoChatLoading]);

  // Fetch personas and load chat history on component mount
  React.useEffect(() => {
    // Clear existing state
    setPersonas([]);
    setSelectedPersona(null);
    setShowPersonaSelection(true);
    setChatMessages([]);
    setGeneratedContent(null);
    
    // Wait for auth token to be available
    const checkTokenAndFetch = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetchPersonas();
        loadChatHistory();
      } else {
        // Retry after short delay if token not yet available
        setTimeout(checkTokenAndFetch, 100);
      }
    };
    
    checkTokenAndFetch();

    // Cleanup function - deactivate all personas when component unmounts
    return () => {
      deactivateAllPersonas();
    };
  }, []);

  // Fetch videos when switching to discuss mode
  React.useEffect(() => {
    if (canvasMode === "discuss") {
      fetchVideos();
    }
  }, [canvasMode]);

  // Function to deactivate all personas
  const deactivateAllPersonas = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No authentication token found, skipping persona deactivation');
        return;
      }
      
      const response = await fetch('http://localhost:3000/personas/deactivate-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        console.log('Failed to deactivate personas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deactivating personas:', error);
    }
  };

  // Auto-deactivate inactive personas (run every 5 minutes)
  React.useEffect(() => {
    const autoDeactivateInterval = setInterval(async () => {
      if (selectedPersona) {
        try {
          // Check if persona is still active and update lastUsedAt
          const token = localStorage.getItem('authToken');
          await fetch(`http://localhost:3000/personas/${selectedPersona._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...selectedPersona,
              lastUsedAt: new Date()
            })
          });
        } catch (error) {
          console.error('Error updating persona activity:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoDeactivateInterval);
  }, [selectedPersona]);

  const fetchPersonas = async () => {
    try {
      console.log("Fetching personas from MongoDB...");
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No authentication token found, skipping persona fetch');
        setPersonas([]);
        return;
      }
      
      const response = await fetch("http://localhost:3000/personas/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Personas from MongoDB:", data.data.personas);
        setPersonas(data.data.personas);
      } else if (response.status === 401) {
        console.error("Authentication failed - redirecting to login");
        handleAuthError();
        return;
      } else {
        console.error("Failed to fetch personas:", response.status, response.statusText);
        setPersonas([]); // Clear personas if fetch fails
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error);
      setPersonas([]); // Clear personas on error
    }
  };

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      console.log("Fetching videos from MongoDB...");
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No authentication token found, skipping video fetch');
        setVideos([]);
        return;
      }
      
      const response = await api.get("/videos");
      if (response.data && response.data.items) {
        console.log("Videos from MongoDB:", response.data.items);
        setVideos(response.data.items);
      } else {
        console.error("Invalid video data structure");
        setVideos([]);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handlePersonaSelect = async (persona) => {
    try {
      // Activate persona using the dedicated activate endpoint
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/personas/${persona._id}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPersona = { ...persona, isActive: true };
        
        // Update personas list
        setPersonas(personas.map(p => 
          p._id === persona._id 
            ? updatedPersona 
            : { ...p, isActive: false } // Deactivate other personas
        ));
        
        setSelectedPersona(updatedPersona);
        setShowPersonaSelection(false);
        setChatMessages([
          {
            role: "assistant",
            content: `Bagus! Anda memilih persona "${persona.name}" dengan niche ${persona.contentNiche}. Sekarang ceritakan ide konten video apa yang ingin Anda buat?`
          }
        ]);
      } else {
        throw new Error("Failed to activate persona");
      }
    } catch (error) {
      console.error("Error activating persona:", error);
      // Still select the persona even if activation fails
      setSelectedPersona(persona);
      setShowPersonaSelection(false);
      setChatMessages([
        {
          role: "assistant",
          content: `Persona "${persona.name}" dipilih. Ada kendala teknis dalam aktivasi, tapi Anda tetap bisa melanjutkan. Ceritakan ide konten video apa yang ingin Anda buat?`
        }
      ]);
    }
  };

  const handleCreateNewPersona = () => {
    setShowCreatePersonaForm(true);
    setShowPersonaSelection(false);
    setChatMessages([
      {
        role: "assistant", 
        content: "Mari buat persona creator baru! Silakan isi form di bawah untuk membuat persona yang sesuai dengan gaya konten Anda."
      }
    ]);
  };

  const handlePersonaFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch("http://localhost:3000/personas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...personaFormData
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newPersona = { ...data.data.persona, isActive: true };
        
        // Deactivate other personas and add new one
        const updatedPersonas = personas.map(p => ({ ...p, isActive: false }));
        setPersonas([...updatedPersonas, newPersona]);
        
        // Activate the new persona
        try {
          const token = localStorage.getItem('authToken');
          await fetch(`http://localhost:3000/personas/${newPersona._id}/activate`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({})
          });
        } catch (activationError) {
          console.error("Error activating new persona:", activationError);
        }
        
        // Select the new persona
        setSelectedPersona(newPersona);
        setShowPersonaSelection(false);
        setShowCreatePersonaForm(false);
        
        // Reset form
        setPersonaFormData({
          name: '',
          contentNiche: '',
          platformPriority: '',
          contentStyle: '',
          brandVoice: '',
          targetAudience: { ageGroup: '', location: '' },
          videoDurationPreference: '',
          contentGoals: []
        });

        setChatMessages([
          {
            role: "assistant",
            content: `Persona "${newPersona.name}" berhasil dibuat! Sekarang ceritakan ide konten video apa yang ingin Anda buat dengan persona ini?`
          }
        ]);
      } else if (response.status === 401) {
        handleAuthError();
        return;
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Error creating persona:", errorData);
        throw new Error("Failed to create persona");
      }
    } catch (error) {
      console.error("Error creating persona:", error);
      setChatMessages([
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat membuat persona. Silakan coba lagi."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPersonaFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPersonaFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Format AI response for better readability
  const formatAiResponse = (text) => {
    if (!text) return text;
    
    // Clean up numbering patterns
    let formatted = text
      // Fix numbering format: "1. **Title**:" to "1. **Title**:"
      .replace(/(\d+)\.\s*\*\*(.*?)\*\*:/g, '$1. **$2**:')
      // Fix standalone bold text: ****text**** to **text**
      .replace(/\*{4}([^*]+)\*{4}/g, '**$1**')
      // Fix numbered lists with proper spacing
      .replace(/(\d+)\.\s+/g, '\n$1. ')
      // Add proper line breaks after colons in bold headings
      .replace(/(\*\*[^*]+\*\*:)\s*/g, '$1\n')
      // Clean up multiple line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Trim start
      .trim();
    
    return formatted;
  };

  // Handle chat message sending
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading || showPersonaSelection || showCreatePersonaForm) return;

    const userMessage = { role: "user", content: currentMessage };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch("http://localhost:3000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          usePersona: selectedPersona ? true : false,
          personaId: selectedPersona?._id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to get AI response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("AI Response received:", data);
      const formattedResponse = formatAiResponse(data.data.response);
      const aiMessage = { role: "assistant", content: formattedResponse };
      setChatMessages([...updatedMessages, aiMessage]);

      // If this looks like a content generation request, also generate full content
      if (currentMessage.toLowerCase().includes("buat") || 
          currentMessage.toLowerCase().includes("buatkan") ||
          currentMessage.toLowerCase().includes("ide") ||
          currentMessage.toLowerCase().includes("video") ||
          currentMessage.toLowerCase().includes("konten")) {
        await generateFullContent(currentMessage);
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba lagi." };
      setChatMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate full content (script, storyboard, etc.)
  const generateFullContent = async (prompt) => {
    try {
      const response = await fetch("http://localhost:3000/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          usePersona: false // Disable persona for now
        })
      });

      if (!response.ok) throw new Error("Failed to generate content");

      const data = await response.json();
      setGeneratedContent(data.data.content);

    } catch (error) {
      console.error("Content generation error:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle image click for modal
  const handleImageClick = (imageUrl, sceneIndex) => {
    setSelectedImage({
      url: imageUrl,
      sceneNumber: sceneIndex + 1,
      scene: generatedContent?.storyboard[sceneIndex]
    });
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Chat History Management Functions
  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setChatSessions([]);
        return;
      }

      const response = await fetch('http://localhost:3000/chat-sessions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.data.sessions || []);
      } else {
        console.error('Failed to load chat history:', response.status);
        setChatSessions([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatSessions([]);
    }
  };

  const saveChatSession = async (chatData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return null;
      }

      // Generate AI title for the chat
      const chatTitle = await generateChatTitle(chatData.messages);
      
      const sessionData = {
        title: chatTitle,
        messages: chatData.messages,
        persona: chatData.persona,
        generatedContent: chatData.generatedContent
      };

      const response = await fetch('http://localhost:3000/chat-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = data.data.session;
        
        // Update local state
        const updatedSessions = [newSession, ...chatSessions];
        setChatSessions(updatedSessions);
        
        return newSession;
      } else {
        console.error('Failed to save chat session:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error saving chat session:', error);
      return null;
    }
  };

  const generateChatTitle = async (messages) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return 'Chat Baru';

      const response = await fetch('http://localhost:3000/chat-sessions/generate-title', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.title || 'Chat Baru';
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
    
    // Fallback title
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    if (firstUserMessage.length > 0) {
      return firstUserMessage.substring(0, 30) + (firstUserMessage.length > 30 ? '...' : '');
    }
    return 'Chat Baru';
  };

  const handleSelectChat = (session) => {
    setCurrentChatId(session._id);
    setChatMessages(session.messages || []);
    setSelectedPersona(session.persona || null);
    setGeneratedContent(session.generatedContent || null);
    setShowPersonaSelection(false);
    setShowCreatePersonaForm(false);
  };

  const handleNewChat = async () => {
    // Deactivate all personas when starting new chat
    await deactivateAllPersonas();
    
    setCurrentChatId(null);
    setChatMessages([{
      role: "assistant",
      content: "Halo! Sebelum kita mulai membuat konten, mari pilih persona creator Anda dulu. Apakah Anda ingin menggunakan persona yang sudah ada atau membuat persona baru?"
    }]);
    setGeneratedContent(null);
    setCurrentMessage("");
    setSelectedPersona(null);
    setShowPersonaSelection(true);
    setShowCreatePersonaForm(false);
    setPersonaFormData({
      name: '',
      contentNiche: '',
      platformPriority: '',
      contentStyle: '',
      brandVoice: '',
      targetAudience: { ageGroup: '', location: 'indonesia' },
      videoDurationPreference: '',
      contentGoals: [],
      description: '',
      keyTopics: [],
      isActive: false
    });
    
    // Refresh personas to show updated active status
    fetchPersonas();
  };

  const handleDeleteChat = async (sessionId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`http://localhost:3000/chat-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        const updatedSessions = chatSessions.filter(session => session._id !== sessionId);
        setChatSessions(updatedSessions);
        
        // If we're deleting the current chat, start a new one
        if (currentChatId === sessionId) {
          handleNewChat();
        }
      } else {
        console.error('Failed to delete chat session:', response.status);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  const handleSaveCurrentChat = async () => {
    if (chatMessages.length <= 1) return; // Don't save empty chats
    
    const chatData = {
      messages: chatMessages,
      persona: selectedPersona,
      generatedContent: generatedContent
    };
    
    const savedSession = await saveChatSession(chatData);
    if (savedSession) {
      setCurrentChatId(savedSession.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Lightbulb className="h-6 w-6" /> Canvas - AI Creative Workspace
            </h1>
            <div className="mt-1">
              <p className="text-slate-600">
                Ruang kerja kreatori video untuk berinteraksi dengan AI
              </p>
              {selectedPersona && (
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Persona: {selectedPersona.name} ({selectedPersona.contentNiche})
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={canvasMode === "create" ? "default" : "outline"}
              onClick={() => setCanvasMode("create")}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Buat Konten dari Awal
            </Button>
            <Button
              variant={canvasMode === "discuss" ? "default" : "outline"}
              onClick={() => setCanvasMode("discuss")}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Diskusi Konten yang Ada
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-3">
          {canvasMode === "create" && (
            <>
              {/* Mode 1: Buat Konten dari Awal - Chat Interface */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" /> Chat dengan AI
                      </CardTitle>
                      <CardDescription>
                        Mulai percakapan untuk membuat konten video dari awal
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChatHistory(!showChatHistory)}
                      className="flex items-center gap-1"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {showChatHistory ? 'Sembunyikan' : 'History'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat History List */}
                    {showChatHistory && (
                      <div className="rounded-xl border bg-white p-3 max-h-[120px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs font-medium text-gray-600">Chat History</div>
                          <button
                            onClick={handleNewChat}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            New Chat
                          </button>
                        </div>
                        {chatSessions.length > 0 ? (
                          <div className="space-y-1">
                            {chatSessions.map((session) => (
                              <div key={session.id} className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSelectChat(session)}
                                  className={`flex-1 text-left p-2 rounded-lg text-xs border transition-colors ${
                                    currentChatId === session.id 
                                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                                      : 'hover:bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="font-medium truncate">{session.title}</div>
                                  <div className="text-gray-500 text-xs">
                                    {new Date(session.createdAt).toLocaleDateString('id-ID')} • 
                                    {session.persona && ` ${session.persona.name}`}
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChat(session.id);
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Hapus chat"
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs">Belum ada history chat</div>
                        )}
                      </div>
                    )}

                    <div className="h-[300px] rounded-xl border bg-slate-50/50 p-4 overflow-y-auto">
                      <div className="text-sm space-y-3">
                        {chatMessages.map((message, index) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded-lg shadow-sm ${
                              message.role === 'assistant' ? 'bg-white' : 'bg-blue-50 ml-8'
                            }`}
                          >
                            <strong>{message.role === 'assistant' ? 'AI:' : 'Anda:'}</strong> 
                            <div className="mt-1 whitespace-pre-line">
                              {message.content.split('\n').map((line, lineIndex) => {
                                // Handle bold text **text**
                                if (line.includes('**')) {
                                  const parts = line.split(/(\*\*.*?\*\*)/g);
                                  return (
                                    <div key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>
                                      {parts.map((part, partIndex) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                      })}
                                    </div>
                                  );
                                }
                                return <div key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>{line}</div>;
                              })}
                            </div>
                          </div>
                        ))}
                        
                        {/* Persona Selection UI */}
                        {showPersonaSelection && !showCreatePersonaForm && (
                          <div className="p-3 bg-white rounded-lg shadow-sm border-2 border-blue-200">
                            <div className="mb-3">
                              <strong>Pilih Persona Creator:</strong>
                            </div>
                            
                            {personas.length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {personas.map((persona) => (
                                  <button
                                    key={persona._id}
                                    onClick={() => handlePersonaSelect(persona)}
                                    className="w-full text-left p-2 rounded-lg border hover:bg-blue-50 transition-colors"
                                  >
                                    <div className="font-medium">{persona.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {persona.contentNiche} • {persona.platformPriority}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm mb-3">
                                Belum ada persona yang tersedia
                              </div>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCreateNewPersona}
                              className="w-full"
                            >
                              + Buat Persona Baru
                            </Button>
                          </div>
                        )}

                        {/* Create Persona Form */}
                        {showCreatePersonaForm && (
                          <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-green-200">
                            <div className="mb-3">
                              <strong>Buat Persona Creator Baru:</strong>
                            </div>
                            
                            <form onSubmit={handlePersonaFormSubmit} className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Nama Persona</label>
                                  <input
                                    type="text"
                                    value={personaFormData.name}
                                    onChange={(e) => handleFormInputChange('name', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    placeholder="e.g., Comedy Creator Budi"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Content Niche</label>
                                  <select
                                    value={personaFormData.contentNiche}
                                    onChange={(e) => handleFormInputChange('contentNiche', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Niche</option>
                                    <option value="food">Food</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="tech">Tech</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="comedy">Comedy</option>
                                    <option value="education">Education</option>
                                    <option value="dance">Dance</option>
                                    <option value="beauty">Beauty</option>
                                    <option value="fitness">Fitness</option>
                                    <option value="travel">Travel</option>
                                    <option value="music">Music</option>
                                    <option value="art">Art</option>
                                    <option value="business">Business</option>
                                    <option value="motivation">Motivation</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="diy">DIY</option>
                                    <option value="pets">Pets</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Platform Utama</label>
                                  <select
                                    value={personaFormData.platformPriority}
                                    onChange={(e) => handleFormInputChange('platformPriority', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Platform</option>
                                    <option value="instagram_reels">Instagram Reels</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="both_equally">Both Equally</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Gaya Konten</label>
                                  <select
                                    value={personaFormData.contentStyle}
                                    onChange={(e) => handleFormInputChange('contentStyle', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Gaya</option>
                                    <option value="trendy_viral">Trendy Viral</option>
                                    <option value="educational">Educational</option>
                                    <option value="behind_scenes">Behind Scenes</option>
                                    <option value="product_showcase">Product Showcase</option>
                                    <option value="storytelling">Storytelling</option>
                                    <option value="tutorial">Tutorial</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="inspirational">Inspirational</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Brand Voice</label>
                                  <select
                                    value={personaFormData.brandVoice}
                                    onChange={(e) => handleFormInputChange('brandVoice', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Voice</option>
                                    <option value="fun_energetic">Fun Energetic</option>
                                    <option value="professional">Professional</option>
                                    <option value="relatable">Relatable</option>
                                    <option value="inspirational">Inspirational</option>
                                    <option value="humorous">Humorous</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Durasi Video</label>
                                  <select
                                    value={personaFormData.videoDurationPreference}
                                    onChange={(e) => handleFormInputChange('videoDurationPreference', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Durasi</option>
                                    <option value="15s">15 detik</option>
                                    <option value="30s">30 detik</option>
                                    <option value="60s">60 detik</option>
                                    <option value="mixed">Mixed</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Target Age</label>
                                  <select
                                    value={personaFormData.targetAudience.ageGroup}
                                    onChange={(e) => handleFormInputChange('targetAudience.ageGroup', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Age Group</option>
                                    <option value="gen_z_16_24">Gen Z (16-24)</option>
                                    <option value="millennials_25_40">Millennials (25-40)</option>
                                    <option value="gen_x_41_56">Gen X (41-56)</option>
                                    <option value="all_ages">All Ages</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Target Location</label>
                                  <select
                                    value={personaFormData.targetAudience.location}
                                    onChange={(e) => handleFormInputChange('targetAudience.location', e.target.value)}
                                    className="w-full text-xs rounded border px-2 py-1"
                                    required
                                  >
                                    <option value="">Pilih Location</option>
                                    <option value="indonesia">Indonesia</option>
                                    <option value="southeast_asia">Southeast Asia</option>
                                    <option value="global">Global</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button 
                                  type="submit" 
                                  size="sm" 
                                  disabled={isLoading}
                                  className="flex-1"
                                >
                                  {isLoading ? "Membuat..." : "Buat Persona"}
                                </Button>
                                <Button 
                                  type="button"
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setShowCreatePersonaForm(false);
                                    setShowPersonaSelection(true);
                                  }}
                                  className="flex-1"
                                >
                                  Batal
                                </Button>
                              </div>
                            </form>
                          </div>
                        )}
                        
                        {isLoading && (
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <strong>AI:</strong> <span className="text-gray-500">Sedang mengetik...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={showPersonaSelection || showCreatePersonaForm ? "Pilih atau buat persona terlebih dahulu..." : "Ketik pesan Anda..."}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading || showPersonaSelection || showCreatePersonaForm}
                        className="flex-1 h-10 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                      />
                      {chatMessages.length > 1 && (
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="h-10 w-10 p-0"
                          onClick={handleSaveCurrentChat}
                          title="Save Chat"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="h-10 w-10 p-0"
                        onClick={handleSendMessage}
                        disabled={isLoading || !currentMessage.trim() || showPersonaSelection || showCreatePersonaForm}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mode 1: Hasil Output AI */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Hasil AI Generator
                    </CardTitle>
                    <CardDescription>
                      Output dari chat AI: Script, Storyboard, Hooks, Tags, dan
                      Caption
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="script" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="script">Script</TabsTrigger>
                        <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
                        <TabsTrigger value="hooks">Hooks</TabsTrigger>
                        <TabsTrigger value="tags">Tags</TabsTrigger>
                        <TabsTrigger value="caption">Caption</TabsTrigger>
                      </TabsList>
                      <TabsContent value="script" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Script Video
                        </label>
                        <div className="min-h-[200px] w-full rounded-xl border p-4 bg-white text-sm overflow-y-auto max-h-[400px]">
                          {generatedContent?.script ? (
                            <div className="script-content space-y-3">
                              {generatedContent.script.split('\n').map((line, index) => {
                                // Handle headers (##)
                                if (line.startsWith('## ')) {
                                  return (
                                    <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2 border-b pb-1">
                                      {line.replace('## ', '').replace(/[\*\#]/g, '')}
                                    </h3>
                                  );
                                }
                                // Handle subheaders (###)
                                if (line.startsWith('### ')) {
                                  return (
                                    <h4 key={index} className="text-base font-semibold text-gray-700 mt-3 mb-1">
                                      {line.replace('### ', '').replace(/[\*\#]/g, '')}
                                    </h4>
                                  );
                                }
                                // Handle bold text (**text**)
                                if (line.includes('**')) {
                                  const parts = line.split(/(\*\*.*?\*\*)/g);
                                  return (
                                    <div key={index} className="mb-1 leading-relaxed">
                                      {parts.map((part, partIndex) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          return <strong key={partIndex} className="text-gray-800">{part.slice(2, -2)}</strong>;
                                        }
                                        return <span key={partIndex}>{part}</span>;
                                      })}
                                    </div>
                                  );
                                }
                                // Handle bullet points (-)
                                if (line.trim().startsWith('- ')) {
                                  return (
                                    <div key={index} className="ml-4 mb-1 text-gray-700">
                                      <span className="mr-2">•</span>
                                      {line.replace('- ', '')}
                                    </div>
                                  );
                                }
                                // Handle empty lines
                                if (line.trim() === '') {
                                  return <div key={index} className="h-2"></div>;
                                }
                                // Regular text
                                return (
                                  <div key={index} className="mb-1 text-gray-700 leading-relaxed">
                                    {line}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">
                              Script akan muncul di sini setelah chat dengan AI...
                            </p>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="storyboard" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Storyboard - Ilustrasi Adegan
                        </label>
                        <div className="border rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ilustrasi Adegan
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Deskripsi
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {generatedContent?.storyboard && generatedContent.storyboard.length > 0 ? (
                                  generatedContent.storyboard.map((scene, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {scene.timestamp}
                                      </td>
                                      <td className="px-4 py-4 text-sm text-gray-900">
                                        <div className="flex items-start gap-3">
                                          {/* Visual Illustration */}
                                          <div className="flex-shrink-0">
                                            {scene.illustrationImage ? (
                                              <div 
                                                className="relative cursor-pointer group"
                                                onClick={() => handleImageClick(scene.illustrationImage, index)}
                                              >
                                                <img 
                                                  src={scene.illustrationImage} 
                                                  alt={`Scene ${index + 1} illustration`}
                                                  className="w-24 h-14 object-cover rounded-lg border shadow-sm group-hover:opacity-80 transition-opacity"
                                                  onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                  }}
                                                />
                                                <div className="w-24 h-14 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-500 hidden">
                                                  No Image
                                                </div>
                                                {scene.generationSuccess === false && (
                                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" title="Image generation failed, using placeholder"></div>
                                                )}
                                                {/* Click indicator - using pointer-events-none to not block clicks */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                                                  <div className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                                                    🔍 Click to enlarge
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="w-24 h-14 bg-gray-100 rounded-lg border flex items-center justify-center">
                                                <div className="text-xs text-gray-400 text-center">
                                                  <div>📷</div>
                                                  <div>Loading...</div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Scene Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium">Scene {index + 1}</div>
                                            <div className="text-gray-600 text-sm mt-1">
                                              {scene.illustration}
                                            </div>
                                            {generatedContent.hasVisualStoryboard && (
                                              <div className="mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                  ✨ AI Generated
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-sm text-gray-600">
                                        {scene.description}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                      00:00-00:05
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900">
                                      <div className="flex items-start gap-3">
                                        <div className="w-24 h-14 bg-gray-100 rounded-lg border flex items-center justify-center">
                                          <div className="text-xs text-gray-400 text-center">
                                            <div>🎬</div>
                                            <div>Scene</div>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">Opening shot</div>
                                          <div className="text-gray-500 text-xs mt-1">
                                            Storyboard akan muncul setelah chat dengan AI...
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                      Deskripsi aksi akan muncul di sini...
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {generatedContent?.hasVisualStoryboard ? (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                ✨ <strong>Visual Storyboard:</strong> Ilustrasi gambar telah dihasilkan dengan Seedreams AI
                              </span>
                            </div>
                          ) : generatedContent?.visualError ? (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <span className="flex items-center gap-1">
                                ⚠️ <strong>Fallback Mode:</strong> {generatedContent.visualError}
                              </span>
                            </div>
                          ) : (
                            <span>💡 Storyboard akan menampilkan ilustrasi visual per scene setelah AI memproses konten Anda</span>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="hooks" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Ide Hook Pembuka
                        </label>
                        <div className="space-y-3">
                          {generatedContent?.hooks && generatedContent.hooks.length > 0 ? (
                            generatedContent.hooks.map((hook, index) => (
                              <input
                                key={index}
                                value={hook}
                                placeholder={`Hook ${index + 1} akan muncul di sini...`}
                                className="w-full rounded-xl border p-3 text-sm"
                                readOnly
                              />
                            ))
                          ) : (
                            <>
                              <input
                                placeholder="Hook 1 akan muncul di sini..."
                                className="w-full rounded-xl border p-3 text-sm"
                                readOnly
                              />
                              <input
                                placeholder="Hook 2 akan muncul di sini..."
                                className="w-full rounded-xl border p-3 text-sm"
                                readOnly
                              />
                              <input
                                placeholder="Hook 3 akan muncul di sini..."
                                className="w-full rounded-xl border p-3 text-sm"
                                readOnly
                              />
                            </>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="tags" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Tags yang Direkomendasikan
                        </label>
                        <div className="min-h-[100px] w-full rounded-xl border p-3 bg-slate-50/50">
                          {generatedContent?.tags && generatedContent.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              Tags akan muncul di sini setelah chat dengan AI...
                            </p>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="caption" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Caption
                        </label>
                        <textarea
                          value={generatedContent?.caption || ""}
                          placeholder="Caption akan muncul di sini setelah chat dengan AI..."
                          className="min-h-[150px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          readOnly
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-600">
                      {generatedContent ? (
                        <span className="text-green-600">✅ Konten telah dihasilkan AI - {generatedContent.estimatedDuration || 'N/A'}</span>
                      ) : (
                        <span>Hasil akan muncul setelah chat dengan AI</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          // Deactivate all personas when resetting
                          await deactivateAllPersonas();
                          
                          setChatMessages([{
                            role: "assistant",
                            content: "Halo! Sebelum kita mulai membuat konten, mari pilih persona creator Anda dulu. Apakah Anda ingin menggunakan persona yang sudah ada atau membuat persona baru?"
                          }]);
                          setGeneratedContent(null);
                          setCurrentMessage("");
                          setSelectedPersona(null);
                          setShowPersonaSelection(true);
                          setShowCreatePersonaForm(false);
                          setPersonaFormData({
                            name: '',
                            contentNiche: '',
                            platformPriority: '',
                            contentStyle: '',
                            brandVoice: '',
                            targetAudience: { ageGroup: '', location: '' },
                            videoDurationPreference: '',
                            contentGoals: []
                          });
                          
                          // Refresh personas to show updated active status
                          fetchPersonas();
                        }}
                      >
                        Reset Chat
                      </Button>
                      <Button 
                        disabled={!generatedContent || chatMessages.length <= 1} 
                        size="sm"
                        onClick={handleSaveCurrentChat}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Hasil
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}

          {canvasMode === "discuss" && (
            <>
              {/* Mode 2: Diskusi Konten yang Sudah Ada - Video List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Film className="h-5 w-5" /> Pilih Video
                  </CardTitle>
                  <CardDescription>
                    Pilih video dari library untuk didiskusikan dengan AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Video Selection */}
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {loadingVideos ? (
                        <div className="text-center py-8">
                          <div className="text-sm text-slate-500">Memuat video...</div>
                        </div>
                      ) : videos.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-sm text-slate-500">Belum ada video tersedia</div>
                          <div className="text-xs text-slate-400 mt-1">Upload video terlebih dahulu</div>
                        </div>
                      ) : (
                        videos.map((video) => (
                          <div
                            key={video._id}
                            onClick={() => setSelectedVideo(video)}
                            className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:bg-slate-50 ${
                              selectedVideo?._id === video._id
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-12 bg-black/5 rounded-md overflow-hidden">
                                {video.secure_url ? (
                                  <video
                                    src={video.secure_url}
                                    className="w-full h-full object-cover"
                                    muted
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="h-4 w-4 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-900 truncate">
                                  {video.title || "Video tanpa judul"}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {video.caption || "Tidak ada caption"}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-slate-400">
                                    {video.duration_sec ? `${Math.floor(video.duration_sec / 60)}:${(video.duration_sec % 60).toString().padStart(2, '0')}` : ""}
                                  </span>
                                  {video.hashtags && (
                                    <span className="text-xs text-blue-600">
                                      {video.hashtags.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Selected Video Preview */}
                    {selectedVideo && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                          <Video className="h-4 w-4" />
                          Video Terpilih
                        </div>
                        <div className="text-sm text-blue-700">
                          <div className="font-medium">{selectedVideo.title || "Video tanpa judul"}</div>
                          <div className="text-xs text-blue-600 mt-1">
                            {selectedVideo.caption && selectedVideo.caption.substring(0, 100)}
                            {selectedVideo.caption && selectedVideo.caption.length > 100 && "..."}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Analysis Section */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Video className="h-4 w-4" />
                          <span className="font-medium">Analisis Video dengan AI</span>
                        </div>
                        <Button 
                          onClick={() => {
                            if (selectedVideo) {
                              // Langsung mulai analisis video yang sudah dipilih
                              startVideoAnalysis(selectedVideo);
                            }
                            // Jika belum ada video dipilih, tombol tidak melakukan apa-apa (disabled)
                          }}
                          disabled={!selectedVideo}
                          className={selectedVideo 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                          }
                          size="sm"
                        >
                          <Sparkles className={`mr-1 h-3 w-3 ${selectedVideo ? 'text-white' : 'text-gray-400'}`} />
                          Start Analysis
                        </Button>
                        
                        {/* Tombol Hapus Analisis AI */}
                        {selectedVideo && selectedVideo.hasAIAnalysis && (
                          <Button
                            onClick={() => deleteVideoAnalysis(selectedVideo)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Hapus Analisis
                          </Button>
                        )}
                      </div>
                      <div ref={chatContainerRef} className="h-[200px] rounded-xl border bg-slate-50/50 p-4 overflow-y-auto mb-3">
                        <div className="text-sm text-slate-600">
                          {/* Initial AI Message */}
                          {videoChatMessages.length === 0 && (
                            <>
                              <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                                <strong>AI:</strong> {selectedVideo 
                                  ? selectedVideo.hasAIAnalysis 
                                    ? `Video "${selectedVideo.title || 'tanpa judul'}" sudah dianalisis! Saya menemukan ${selectedVideo.aiSuggestions?.improvements?.length || 0} saran perbaikan. Tanya saya tentang konten video, transkrip, atau saran perbaikan yang spesifik.`
                                    : selectedVideo.transcript_status === 'completed'
                                    ? `Video "${selectedVideo.title || 'tanpa judul'}" sudah memiliki transkrip. Klik "Start Analysis" untuk mendapatkan analisis AI dan saran perbaikan.`
                                    : `Video "${selectedVideo.title || 'tanpa judul'}" sudah dipilih. Klik tombol "Start Analysis" untuk memulai ekstraksi transkrip video menggunakan AI. Setelah selesai, Anda bisa chat dengan saya tentang konten video tersebut.`
                                  : "Pilih video terlebih dahulu dari daftar di atas. Tombol 'Start Analysis' sudah tersedia di atas, tapi akan aktif setelah Anda memilih video."
                                }
                              </div>
                              
                              {/* Show AI Analysis Summary in Chat */}
                              {selectedVideo && selectedVideo.hasAIAnalysis && selectedVideo.aiAnalysis && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                  <strong className="text-blue-800">Ringkasan Analisis:</strong>
                                  <p className="text-blue-700 text-xs mt-1">{selectedVideo.aiAnalysis}</p>
                                </div>
                              )}
                              
                              {/* Show Transcript Preview in Chat */}
                              {selectedVideo && selectedVideo.transcript && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                  <strong className="text-green-800">Transkrip:</strong>
                                  <p className="text-green-700 text-xs mt-1">
                                    {selectedVideo.transcript.length > 150 
                                      ? selectedVideo.transcript.substring(0, 150) + '...' 
                                      : selectedVideo.transcript}
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Chat Messages */}
                          {videoChatMessages.map((message) => (
                            <div key={message.id} className={`mb-3 p-3 rounded-lg ${
                              message.sender === 'user' 
                                ? 'bg-blue-100 border-l-4 border-blue-400 ml-8' 
                                : 'bg-white shadow-sm mr-8'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <strong className={message.sender === 'user' ? 'text-blue-800' : 'text-slate-800'}>
                                  {message.sender === 'user' ? 'Anda' : 'AI'}:
                                </strong>
                                <span className="text-xs text-slate-500">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <div className={`text-sm ${
                                message.sender === 'user' ? 'text-blue-700' : 'text-slate-700'
                              }`}>
                                {message.sender === 'user' ? (
                                  <p>{message.text}</p>
                                ) : (
                                  <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown 
                                      components={{
                                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-slate-800 mb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-slate-800 mb-2" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-800 mb-1" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold text-slate-800" {...props} />,
                                        em: ({node, ...props}) => <em className="italic text-slate-700" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2 text-slate-700 leading-relaxed" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                                        li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-3 italic text-slate-600" {...props} />,
                                        code: ({node, inline, ...props}) => 
                                          inline 
                                            ? <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                                            : <code className="block bg-slate-100 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                                      }}
                                    >
                                      {message.text}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Loading indicator */}
                          {isVideoChatLoading && (
                            <div className="mb-3 p-3 bg-white rounded-lg shadow-sm mr-8">
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-800">AI:</strong>
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={videoChatInput}
                          onChange={(e) => setVideoChatInput(e.target.value)}
                          onKeyPress={handleVideoChatKeyPress}
                          placeholder={
                            selectedVideo && selectedVideo.hasAIAnalysis 
                              ? "Tanya saya tentang video, transkrip, atau saran perbaikan..." 
                              : selectedVideo 
                                ? "Klik 'Start Analysis' untuk memulai analisis video terlebih dahulu..." 
                                : "Pilih video terlebih dahulu..."
                          }
                          disabled={!selectedVideo || !selectedVideo.hasAIAnalysis || isVideoChatLoading}
                          className={`flex-1 h-10 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                            selectedVideo && selectedVideo.hasAIAnalysis 
                              ? 'bg-white text-slate-900' 
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        />
                        <Button 
                          size="sm" 
                          className="h-10 w-10 p-0" 
                          disabled={!selectedVideo || !selectedVideo.hasAIAnalysis || isVideoChatLoading}
                          onClick={sendVideoChatMessage}
                        >
                          {isVideoChatLoading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mode 2: Saran Perbaikan AI */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Saran Perbaikan AI
                    </CardTitle>
                    <CardDescription>
                      Analisis dan saran perbaikan untuk video yang di-upload
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[300px] w-full rounded-xl border p-6 bg-slate-50/50">
                      {selectedVideo && selectedVideo.hasAIAnalysis && selectedVideo.aiSuggestions ? (
                        // Display AI Analysis Results
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h3 className="font-medium text-slate-700">Analisis Konten Video</h3>
                          </div>
                          
                          {/* AI Analysis */}
                          {selectedVideo.aiAnalysis && (
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-medium text-slate-700 mb-2">Analisis Konten:</h4>
                              <p className="text-sm text-slate-600">{selectedVideo.aiAnalysis}</p>
                            </div>
                          )}
                          
                          {/* Improvement Suggestions */}
                          {selectedVideo.aiSuggestions?.improvements && (
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-medium text-slate-700 mb-2">Saran Perbaikan:</h4>
                              <ul className="text-sm text-slate-600 space-y-1">
                                {selectedVideo.aiSuggestions.improvements.map((suggestion, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Caption Fix */}
                          {selectedVideo.aiSuggestions?.captionFix && (
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-medium text-slate-700 mb-2">Saran Caption:</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-red-600 font-medium">Caption Saat ini:</span>
                                  <p className="text-slate-600 italic">"{selectedVideo.caption || 'Tidak ada caption'}"</p>
                                </div>
                                <div>
                                  <span className="text-green-600 font-medium">Caption Disarankan:</span>
                                  <p className="text-slate-600">"{selectedVideo.aiSuggestions.captionFix.suggested}"</p>
                                </div>
                                {selectedVideo.transcript && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                    <span className="text-blue-600 font-medium text-xs">Transkrip Video:</span>
                                    <p className="text-blue-700 text-xs mt-1 max-h-20 overflow-y-auto leading-relaxed">
                                      "{selectedVideo.transcript}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Hashtag Suggestions */}
                          {selectedVideo.aiSuggestions?.tagsFix?.suggested && (
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-medium text-slate-700 mb-2">Saran Hashtag:</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedVideo.aiSuggestions.tagsFix.suggested.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : selectedVideo && selectedVideo.transcript_status === 'completed' ? (
                        // Video has transcript but no AI analysis yet
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-600 mb-2">Transkrip Tersedia</h3>
                            <p className="text-sm text-slate-500 max-w-md">
                              Video sudah memiliki transkrip, tapi belum dianalisis oleh AI. 
                              Klik "Start Analysis" untuk mendapatkan saran perbaikan.
                            </p>
                          </div>
                        </div>
                      ) : selectedVideo ? (
                        // Video selected but no analysis
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-600 mb-2">Siap untuk Analisis</h3>
                            <p className="text-sm text-slate-500 max-w-md">
                              Klik "Start Analysis" untuk menganalisis video "{selectedVideo.title || 'Tanpa judul'}" 
                              dan mendapatkan saran perbaikan dari AI.
                            </p>
                          </div>
                        </div>
                      ) : (
                        // No video selected
                        <div className="text-center space-y-3 flex items-center justify-center h-full">
                          <div>
                            <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                              <Sparkles className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="mt-4">
                              <h3 className="font-medium text-slate-600 mb-2">Analisis Video dengan AI</h3>
                              <p className="text-sm text-slate-500 max-w-md">
                                Pilih video dari daftar di sebelah kiri untuk melihat analisis dan saran perbaikan dari AI.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-600">
                      {selectedVideo && selectedVideo.hasAIAnalysis ? (
                        <span>Analisis selesai • {selectedVideo.aiSuggestions?.improvements?.length || 0} saran tersedia</span>
                      ) : selectedVideo ? (
                        <span>Pilih video dan klik "Start Analysis" untuk mendapatkan saran AI</span>
                      ) : (
                        <span>Pilih video untuk melihat analisis dan saran perbaikan</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedVideo && selectedVideo.hasAIAnalysis && (
                        <Button size="sm" variant="outline">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analisis Selesai
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closeImageModal}
        >
          <div 
            className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold">Scene {selectedImage.sceneNumber}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedImage.scene?.timestamp}
                </p>
              </div>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={selectedImage.url} 
                    alt={`Scene ${selectedImage.sceneNumber} illustration`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
                  />
                </div>

                {/* Scene Details */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Scene Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedImage.scene?.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Visual Direction</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedImage.scene?.illustration}
                    </p>
                  </div>

                  {selectedImage.scene?.seedreamsPrompt && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI Prompt Used</h4>
                      <p className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg leading-relaxed">
                        {selectedImage.scene.seedreamsPrompt}
                      </p>
                    </div>
                  )}

                  {selectedImage.scene?.imageMetadata && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Generation Info</h4>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Model: {selectedImage.scene.imageMetadata.model}</div>
                        <div>Size: {selectedImage.scene.imageSize}</div>
                        <div>Generated: {new Date(selectedImage.scene.imageMetadata.generatedAt).toLocaleString()}</div>
                        {selectedImage.scene.imageMetadata.usage && (
                          <div>Tokens: {selectedImage.scene.imageMetadata.usage.total_tokens || selectedImage.scene.imageMetadata.usage.generated_images} generated</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✨ AI Generated by Seedreams
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.url;
                    link.download = `scene-${selectedImage.sceneNumber}-illustration.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download Image
                </Button>
                <Button variant="secondary" size="sm" onClick={closeImageModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Analysis is now integrated directly in the discuss mode */}

      {/* Analysis Progress Modal */}
      <AnalysisProgressModal
        isOpen={showAnalysisProgress}
        onClose={() => {
          setShowAnalysisProgress(false);
          setAnalysisVideo(null);
        }}
        video={analysisVideo}
        onComplete={(updatedVideo) => {
          console.log('Analysis completed:', updatedVideo);
          setShowAnalysisProgress(false);
          setAnalysisVideo(null);
          toast.success('Analisis video selesai! Sekarang Anda bisa chat dengan AI tentang video ini.');
          
          // Update selectedVideo dengan data terbaru
          setSelectedVideo(updatedVideo);
          
          // Update videos list dengan data terbaru
          setVideos(prevVideos => 
            prevVideos.map(video => 
              video._id === updatedVideo._id ? updatedVideo : video
            )
          );
          
          // Refresh video list untuk memastikan data sinkron dengan database
          setTimeout(() => {
            fetchVideos();
          }, 500);
        }}
        onError={(error) => {
          console.error('Analysis error:', error);
          setShowAnalysisProgress(false);
          setAnalysisVideo(null);
          toast.error('Analisis video gagal: ' + error);
        }}
      />
    </div>
  );
}
