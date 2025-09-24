import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Video as VideoIcon,
  MessageCircle,
  Loader2,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const VideoAIChatInterface = ({ video, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && video) {
      initializeChat();
      checkTranscriptStatus();
    }
  }, [isOpen, video]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      role: "assistant",
      content: `Halo! Saya siap membantu Anda menganalisis video "${
        video.title
      }". ${
        video.transcript
          ? "Saya sudah memiliki akses ke transkrip video ini dan dapat memberikan insight mendalam tentang kontennya."
          : "Untuk analisis yang lebih mendalam, video ini perlu diekstrak transkripnya terlebih dahulu."
      }`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const checkTranscriptStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/videos/${video._id}/transcript`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTranscriptStatus(response.data);
    } catch (error) {
      console.error("Error checking transcript status:", error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Prepare messages for API
      const conversationMessages = messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        }));

      // Add current user message
      conversationMessages.push({
        role: "user",
        content: currentMessage,
      });

      // Prepare video context
      const videoContext = {
        ...video,
        transcript: transcriptStatus?.transcript || video.transcript,
        transcript_metadata:
          transcriptStatus?.metadata || video.transcript_metadata,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/chat-video-context`,
        {
          messages: conversationMessages,
          videoContext: videoContext,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Gagal mengirim pesan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTranscriptStatusIcon = () => {
    const status = transcriptStatus?.status || video?.transcript_status;

    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          label: "Transkrip Tersedia",
        };
      case "processing":
        return {
          icon: Loader2,
          color: "text-yellow-600",
          label: "Sedang Diproses",
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          label: "Analisis Gagal",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-600",
          label: "Belum Dianalisis",
        };
    }
  };

  const statusInfo = getTranscriptStatusIcon();
  const StatusIcon = statusInfo.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  Chat AI - Analisis Video
                </h2>
                <p className="text-sm text-blue-100 line-clamp-1">
                  {video.title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Video Info Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Video Preview */}
              <Card>
                <CardContent className="p-3">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <video
                      src={video.secure_url}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Clock className="h-3 w-3" />
                    {video.duration_sec
                      ? `${Math.floor(video.duration_sec / 60)}:${String(
                          video.duration_sec % 60
                        ).padStart(2, "0")}`
                      : "Unknown"}
                  </div>
                  {video.caption && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {video.caption}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Transcript Status */}
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className="text-sm font-medium">
                      {statusInfo.label}
                    </span>
                  </div>

                  {transcriptStatus?.transcript && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        Preview transkrip:
                      </div>
                      <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
                        {transcriptStatus.transcript.substring(0, 200)}...
                      </div>
                      {transcriptStatus.metadata && (
                        <div className="text-xs text-gray-500">
                          {transcriptStatus.metadata.word_count} kata •
                          Confidence:{" "}
                          {(
                            transcriptStatus.metadata.confidence_score * 100
                          ).toFixed(1)}
                          %
                        </div>
                      )}
                    </div>
                  )}

                  {!transcriptStatus?.transcript && !video.transcript && (
                    <div className="text-xs text-gray-600">
                      <p className="mb-2">
                        Untuk analisis mendalam, ekstrak transkrip video
                        terlebih dahulu.
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Chat terbatas pada metadata
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">
                      AI dapat membantu:
                    </span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Analisis konten video</li>
                    <li>• Saran perbaikan</li>
                    <li>• Ide konten serupa</li>
                    <li>• Optimisasi engagement</li>
                    {(transcriptStatus?.transcript || video.transcript) && (
                      <>
                        <li>• Analisis mendalam script</li>
                        <li>• Ekstrak key insights</li>
                        <li>• Repurposing content</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.isError
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 opacity-70`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">
                          AI sedang mengetik...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    transcriptStatus?.transcript || video.transcript
                      ? "Tanyakan tentang video ini..."
                      : "Tanyakan tentang metadata video ini..."
                  }
                  className="flex-1 resize-none border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  size="sm"
                  className="px-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!transcriptStatus?.transcript && !video.transcript && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  💡 Tip: Untuk chat yang lebih mendalam, ekstrak transkrip
                  video terlebih dahulu
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAIChatInterface;
