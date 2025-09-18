import React from "react";
import { UploadCloud, Film, Sparkles, Save } from "lucide-react";
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
const MOCK_INSIGHTS = {
  transcript:
    "Halo semuanya! Di video ini kita membahas tips editing cepat untuk Reels: trimming, jump-cut, dan musik. Yuk mulai!",
  captions: [
    "3 trik editing cepat untuk Reels kamu 🚀",
    "Boost kontenmu: trim, cut, musik yang pas!",
    "Workflow editing 5 menit yang bikin nempel",
  ],
  hashtags: ["#videoediting", "#contentcreator", "#reels", "#tips", "#indonesia"],
  hooks: [
    "Stop scroll 5 detik: ini rahasia edit cepat!",
    "Kalau Reels-mu sepi, coba 3 trik ini.",
    "Tingkatkan retensi dengan satu langkah sederhana.",
  ],
};

export default function VideoUploadAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Film className="h-6 w-6" /> Video Upload & Insight AI
            </h1>
            <p className="text-slate-600 mt-1">Mode demo (tanpa backend)</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-3">
          {/* Kolom kiri: Upload */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UploadCloud className="h-5 w-5" /> Unggah Video
              </CardTitle>
              <CardDescription>
                Pilih file video atau seret & lepas ke area di bawah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="group relative w-full rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-slate-300"
              >
                <input
                  id="file"
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="pointer-events-none">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="font-medium">Seret & lepas</span> atau klik
                    untuk <span className="font-medium">pilih file</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tipe: video/* · Maks {MAX_FILE_MB}MB
                  </p>
                </div>
              </div>

              {/* Analisis AI dipindahkan ke dalam card ini */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Analisis AI</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  Klik tombol di bawah untuk memproses transkrip, caption,
                  hashtag, dan hook dari video Anda.
                </p>
                <div className="flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button className="w-full sm:w-auto">Analyze with AI</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kolom kanan (lebih lebar): Analisis & Hasil */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hasil Insight</CardTitle>
                <CardDescription>
                  Review hasil, edit bila perlu, lalu simpan (simulasi).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transcript" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="transcript">Transkrip</TabsTrigger>
                    <TabsTrigger value="captions">Caption</TabsTrigger>
                    <TabsTrigger value="hashtags">Hashtag</TabsTrigger>
                    <TabsTrigger value="hooks">Hook</TabsTrigger>
                  </TabsList>
                  <TabsContent value="transcript" className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Transkrip Otomatis
                    </label>
                    <textarea
                      defaultValue={MOCK_INSIGHTS.transcript}
                      className="min-h-[160px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                  </TabsContent>
                  <TabsContent value="captions" className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Pilihan Caption
                    </label>
                    <div className="flex flex-col gap-3">
                      {MOCK_INSIGHTS.captions.map((c, i) => (
                        <input
                          key={i}
                          defaultValue={c}
                          className="w-full rounded-xl border p-3 text-sm"
                        />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="hashtags" className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Hashtag yang Direkomendasikan
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_INSIGHTS.hashtags.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                        >
                          <span>#{h.replace(/^#/, "")}</span>
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Anda bisa mengedit daftar ini langsung di UI.
                    </p>
                  </TabsContent>
                  <TabsContent value="hooks" className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Ide Hook Pembuka
                    </label>
                    <div className="flex flex-col gap-3">
                      {MOCK_INSIGHTS.hooks.map((h, i) => (
                        <input
                          key={i}
                          defaultValue={h}
                          className="w-full rounded-xl border p-3 text-sm"
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-600">
                  <span>Periksa hasil sebelum menyimpan.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary">Mulai Baru</Button>
                  <Button>
                  Simpan
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
