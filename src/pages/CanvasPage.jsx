import React, { useState } from "react";
import {
  UploadCloud,
  Film,
  Sparkles,
  Save,
  MessageSquare,
  Lightbulb,
  Video,
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Lightbulb className="h-6 w-6" /> Canvas - AI Creative Workspace
            </h1>
            <p className="text-slate-600 mt-1">
              Ruang kerja kreatori video untuk berinteraksi dengan AI
            </p>
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
                      <div className="text-sm text-slate-600">
                        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                          <strong>AI:</strong> Halo! Saya siap membantu Anda
                          membuat konten video. Ceritakan ide konten apa yang
                          ingin Anda buat?
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Ketik pesan Anda..."
                        className="flex-1 h-10 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      />
                      <Button size="sm" className="h-10 w-10 p-0">
                        <MessageSquare className="h-4 w-4" />
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
                          placeholder="Script akan muncul di sini setelah chat dengan AI..."
                          className="min-h-[200px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        />
                      </TabsContent>
                      <TabsContent value="storyboard" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Storyboard
                        </label>
                        <textarea
                          placeholder="Deskripsi visual dan storyboard akan muncul di sini..."
                          className="min-h-[200px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        />
                      </TabsContent>
                      <TabsContent value="hooks" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Ide Hook Pembuka
                        </label>
                        <div className="space-y-3">
                          <input
                            placeholder="Hook 1 akan muncul di sini..."
                            className="w-full rounded-xl border p-3 text-sm"
                          />
                          <input
                            placeholder="Hook 2 akan muncul di sini..."
                            className="w-full rounded-xl border p-3 text-sm"
                          />
                          <input
                            placeholder="Hook 3 akan muncul di sini..."
                            className="w-full rounded-xl border p-3 text-sm"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="tags" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Tags yang Direkomendasikan
                        </label>
                        <div className="min-h-[100px] w-full rounded-xl border p-3 bg-slate-50/50">
                          <p className="text-sm text-slate-500">
                            Tags akan muncul di sini setelah chat dengan AI...
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="caption" className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                          Caption
                        </label>
                        <textarea
                          placeholder="Caption akan muncul di sini setelah chat dengan AI..."
                          className="min-h-[150px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-600">
                      <span>Hasil akan muncul setelah chat dengan AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary">Reset Chat</Button>
                      <Button disabled>
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
    </div>
  );
}
