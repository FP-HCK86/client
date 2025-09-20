import React, { useState } from "react";
import {
  UploadCloud,
  Film,
  Sparkles,
  Save,
  MessageSquare,
  Lightbulb,
  Video,
  Send,
} from "lucide-react";
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

const MAX_FILE_MB = 1024; // 1 GB

export default function CanvasPage() {
  const [canvasMode, setCanvasMode] = useState("create"); // 'create' or 'discuss'
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Halo! Sebelum kita mulai membuat konten, mari pilih persona creator Anda dulu. Apakah Anda ingin menggunakan persona yang sudah ada atau membuat persona baru?"
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showPersonaSelection, setShowPersonaSelection] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch personas on component mount
  React.useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch("http://localhost:3000/personas/?userId=507f1f77bcf86cd799439013", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.data.personas);
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error);
    }
  };

  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
    setShowPersonaSelection(false);
    setChatMessages([
      {
        role: "assistant",
        content: `Bagus! Anda memilih persona "${persona.name}" dengan niche ${persona.contentNiche}. Sekarang ceritakan ide konten video apa yang ingin Anda buat?`
      }
    ]);
  };

  const handleCreateNewPersona = () => {
    setChatMessages([
      {
        role: "assistant", 
        content: "Untuk membuat persona baru, silakan buka halaman Account Settings untuk setup persona creator Anda. Setelah itu kembali ke sini untuk membuat konten!"
      }
    ]);
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
    if (!currentMessage.trim() || isLoading || showPersonaSelection) return;

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
          userId: "507f1f77bcf86cd799439013", // Test user ID
          personaId: selectedPersona?._id
        })
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
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
          usePersona: selectedPersona ? true : false,
          userId: "507f1f77bcf86cd799439013", // Test user ID
          personaId: selectedPersona?._id
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
              <MessageSquare className="h-4 w-4" />
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
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" /> Chat dengan AI
                  </CardTitle>
                  <CardDescription>
                    Mulai percakapan untuk membuat konten video dari awal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                        {showPersonaSelection && (
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
                        placeholder={showPersonaSelection ? "Pilih persona terlebih dahulu..." : "Ketik pesan Anda..."}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading || showPersonaSelection}
                        className="flex-1 h-10 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                      />
                      <Button 
                        size="sm" 
                        className="h-10 w-10 p-0"
                        onClick={handleSendMessage}
                        disabled={isLoading || !currentMessage.trim() || showPersonaSelection}
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
                        <textarea
                          value={generatedContent?.script || ""}
                          placeholder="Script akan muncul di sini setelah chat dengan AI..."
                          className="min-h-[200px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          readOnly
                        />
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
                        variant="outline"
                        size="sm"
                        disabled={chatMessages.length <= 1 || isLoading}
                        onClick={() => {
                          const lastUserMessage = chatMessages.filter(m => m.role === 'user').pop();
                          if (lastUserMessage) {
                            generateFullContent(lastUserMessage.content);
                          }
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </Button>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setChatMessages([{
                            role: "assistant",
                            content: "Halo! Sebelum kita mulai membuat konten, mari pilih persona creator Anda dulu. Apakah Anda ingin menggunakan persona yang sudah ada atau membuat persona baru?"
                          }]);
                          setGeneratedContent(null);
                          setCurrentMessage("");
                          setSelectedPersona(null);
                          setShowPersonaSelection(true);
                        }}
                      >
                        Reset Chat
                      </Button>
                      <Button disabled={!generatedContent} size="sm">
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
              {/* Mode 2: Diskusi Konten yang Sudah Ada - Upload Video */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UploadCloud className="h-5 w-5" /> Upload Video
                  </CardTitle>
                  <CardDescription>
                    Upload video yang ingin didiskusikan dengan AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="group relative w-full rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-slate-300">
                      <input
                        id="file"
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="pointer-events-none">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200">
                          <Video className="h-7 w-7" />
                        </div>
                        <p className="mt-3 text-sm">
                          <span className="font-medium">Seret & lepas</span>{" "}
                          atau klik untuk{" "}
                          <span className="font-medium">pilih video</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Tipe: video/* · Maks {MAX_FILE_MB}MB
                        </p>
                      </div>
                    </div>

                    {/* Chat dengan AI tentang video */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Chat tentang Video</span>
                      </div>
                      <div className="h-[200px] rounded-xl border bg-slate-50/50 p-4 overflow-y-auto mb-3">
                        <div className="text-sm text-slate-600">
                          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                            <strong>AI:</strong> Upload video terlebih dahulu,
                            lalu saya akan memberikan saran perbaikan untuk
                            konten Anda.
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Tanyakan tentang video Anda..."
                          className="flex-1 h-10 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        />
                        <Button size="sm" className="h-10 w-10 p-0">
                          <MessageSquare className="h-4 w-4" />
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
                    <Tabs defaultValue="analysis" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="analysis">Analisis</TabsTrigger>
                        <TabsTrigger value="caption-fix">Caption</TabsTrigger>
                        <TabsTrigger value="tags-fix">Tags</TabsTrigger>
                        <TabsTrigger value="suggestions">
                          Saran Lain
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="analysis" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Analisis Video
                        </label>
                        <div className="min-h-[200px] w-full rounded-xl border p-3 bg-slate-50/50">
                          <p className="text-sm text-slate-500">
                            Analisis video akan muncul di sini setelah upload
                            dan proses AI...
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="caption-fix" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Saran Perbaikan Caption
                        </label>
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl border bg-white">
                            <span className="text-xs text-slate-500 block mb-1">
                              Caption Saat Ini:
                            </span>
                            <p className="text-sm">
                              Akan terdeteksi setelah upload video...
                            </p>
                          </div>
                          <div className="p-3 rounded-xl border bg-blue-50/50">
                            <span className="text-xs text-blue-600 block mb-1">
                              Saran AI:
                            </span>
                            <p className="text-sm">
                              Saran perbaikan caption akan muncul di sini...
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="tags-fix" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Saran Perbaikan Tags
                        </label>
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl border bg-white">
                            <span className="text-xs text-slate-500 block mb-2">
                              Tags Saat Ini:
                            </span>
                            <div className="text-sm text-slate-500">
                              Akan terdeteksi setelah upload video...
                            </div>
                          </div>
                          <div className="p-3 rounded-xl border bg-green-50/50">
                            <span className="text-xs text-green-600 block mb-2">
                              Tags yang Disarankan:
                            </span>
                            <div className="text-sm text-slate-500">
                              Saran tags akan muncul di sini...
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="suggestions" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Saran Perbaikan Lainnya
                        </label>
                        <div className="min-h-[200px] w-full rounded-xl border p-3 bg-slate-50/50">
                          <p className="text-sm text-slate-500">
                            Saran perbaikan lainnya akan muncul di sini setelah
                            AI menganalisis video...
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-600">
                      <span>Upload video untuk mendapatkan saran AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary">Analisis Ulang</Button>
                      <Button disabled>
                        <Save className="h-4 w-4 mr-2" />
                        Terapkan Saran
                      </Button>
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
    </div>
  );
}
