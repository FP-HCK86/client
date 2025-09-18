import React from "react";
import { Film, Clock, Copy, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Simplified static-only component. All logic, handlers and hooks removed.
export default function VideoDetailPage() {
  // Hardcoded static data (was previously dynamic)
  const video = {
    id: "v-001",
    title: "Tutorial Editing Cepat: Trim, Jump-cut, Musik",
    url: "",
    durationSec: 134,
    uploadedAt: "2025-09-11T12:00:00.000Z",
    sizeBytes: 88000000,
  };

  const insights = {
    transcriptSegments: [
      {
        start: 0,
        end: 12,
        text: "Halo semuanya! Di video ini kita akan bahas 3 trik editing cepat untuk Reels.",
      },
      {
        start: 12,
        end: 35,
        text: "Trik pertama adalah trimming bagian jeda agar ritme terasa cepat.",
      },
      {
        start: 35,
        end: 62,
        text: "Trik kedua: jump-cut untuk pindah antar kalimat tanpa jeda panjang.",
      },
    ],
    hooks: [
      { time: 0, label: "Stop scroll 5 detik!" },
      { time: 12, label: "Trim jeda = ritme naik" },
      { time: 35, label: "Jump-cut biar padat" },
    ],
    captions: [
      "3 trik editing cepat untuk Reels kamu 🚀",
      "Boost kontenmu: trim, cut, musik yang pas!",
    ],
    hashtags: ["#videoediting", "#contentcreator", "#reels"],
  };

  // Simple format helpers (pure functions, no side effects)
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const fmtDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };
  const fmtTime = (s) => fmtDuration(s);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {video.title}
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Diunggah {fmtDate(video.uploadedAt)} · Durasi {fmtDuration(video.durationSec)}
              </p>
            </div>
          </div>
          <div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Post
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom video */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="relative aspect-square max-w-sm mx-auto w-full bg-black/5">
              {/* static placeholder view (no video element) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 bg-black/80">
                <Film className="h-10 w-10" />
                <span className="text-sm text-white/80">(Preview video akan tampil di sini)</span>
                <Button size="sm" variant="secondary">Play</Button>
              </div>
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                <Clock className="h-3.5 w-3.5" /> 0:00 / {fmtDuration(video.durationSec)}
              </div>
            </div>
          </Card>

          {/* Kolom kanan: Insight ringkas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insight Ringkas</CardTitle>
              <CardDescription>Hook timeline, caption & hashtag siap pakai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hooks */}
              <div>
                <div className="mb-2 text-sm font-medium">Hook (timeline)</div>
                <div className="flex flex-col gap-2">
                  {insights.hooks.map((h, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2 text-left">
                      <span className="text-sm">{h.label}</span>
                      <Badge variant="secondary">{fmtTime(h.time)}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Captions */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Caption</span>
                  <Button size="sm" variant="ghost">
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {insights.captions.map((c, i) => (
                    <div key={i} className="rounded-xl border p-3 text-sm">{c}</div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Hashtag</span>
                  <Button size="sm" variant="ghost">
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.hashtags.map((h, i) => (
                    <Badge key={i} variant="outline">{h}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcript & Detail */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Detail & Transcript</CardTitle>
            <CardDescription>Klik baris transcript untuk seek ke waktu terkait.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="hooks">Hooks</TabsTrigger>
                <TabsTrigger value="about">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4">
                <div className="max-h-72 overflow-auto rounded-xl border">
                  {insights.transcriptSegments.map((seg, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2 text-sm border-b last:border-b-0">
                      <Badge variant="secondary">{fmtTime(seg.start)}</Badge>
                      <p className="leading-relaxed">{seg.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hooks" className="mt-4">
                <div className="flex flex-col gap-2">
                  {insights.hooks.map((h, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2 text-left">
                      <span className="text-sm">{h.label}</span>
                      <Badge variant="secondary">{fmtTime(h.time)}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border p-3 text-sm">
                    <div className="text-xs text-slate-500">Video ID</div>
                    <div className="font-medium">{video.id}</div>
                  </div>
                  <div className="rounded-xl border p-3 text-sm">
                    <div className="text-xs text-slate-500">Tanggal Upload</div>
                    <div className="font-medium">{fmtDate(video.uploadedAt)}</div>
                  </div>
                  <div className="rounded-xl border p-3 text-sm">
                    <div className="text-xs text-slate-500">Durasi</div>
                    <div className="font-medium">{fmtDuration(video.durationSec)}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
