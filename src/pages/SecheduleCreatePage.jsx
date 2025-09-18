import React from "react";
import { CalendarDays, Clock, Video, Hash, X, Search, Check } from "lucide-react";
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

// Presentational, hardcoded variant of the Schedule Create page.
export default function ScheduleCreatePage() {
  // Hardcoded data to replace previous dynamic logic.
  const initialSelected = {
    id: "v-002",
    title: "Belajar Lighting Dasar",
    createdAt: "2025-09-10T12:00:00.000Z",
    durationSec: 134,
    url: "",
  };

  const [selectedVideo, setSelectedVideo] = React.useState(initialSelected);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const videos = [
    initialSelected,
    {
      id: "v-003",
      title: "Hook Video: Bikin Nempel!",
      createdAt: "2025-09-07T12:00:00.000Z",
      durationSec: 59,
      url: "",
    },
    {
      id: "v-004",
      title: "Transisi Keren di Reels",
      createdAt: "2025-09-05T12:00:00.000Z",
      durationSec: 92,
      url: "",
    },
  ];

  const caption = "Boost kontenmu: trim, cut, musik yang pas!";
  const hashtags = "#videoediting #contentcreator #reels";
  const platform = "Instagram";
  const date = "2025-09-15";
  const time = "09:30";

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const fmtDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, "0");
    return `${m}:${sec}`;
  };

  // No-op handlers to keep markup stable but non-interactive.
  const noop = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
                Create Schedule
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Buat jadwal posting baru dari video Library.
              </p>
            </div>
          </div>
          <Button onClick={noop} disabled>
            Simpan
          </Button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom kiri: pilih video */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5" /> Pilih Video
              </CardTitle>
              <CardDescription>Ambil dari Video Library.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/5 ring-1 ring-slate-200">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Video className="h-8 w-8" />
                    <span className="text-xs">(Preview tidak tersedia)</span>
                  </div>
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                    <Clock className="h-3.5 w-3.5" /> {fmtDuration(selectedVideo.durationSec)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium leading-5">{selectedVideo.title}</div>
                  <div className="mt-1 text-xs text-slate-600">Diunggah {fmtDate(selectedVideo.createdAt)}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setPickerOpen(true)}>
                    Ganti Video
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kolom kanan: detail schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> Detail Jadwal
              </CardTitle>
              <CardDescription>Atur platform, caption/hashtag, tanggal & jam.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Platform */}
              <div>
                <div className="text-sm font-medium mb-2">Platform</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Instagram", active: platform === "Instagram" },
                    { name: "TikTok", active: platform === "TikTok" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={noop}
                      className={`rounded-full border px-3 py-1 text-sm ${p.active ? "bg-black text-white" : "hover:bg-slate-50"}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Video className="h-4 w-4" /> Caption
                  </label>
                  <Button size="sm" variant="ghost" onClick={noop}>
                    Gunakan AI Insight
                  </Button>
                </div>
                <textarea readOnly value={caption} placeholder="Tulis caption..." className="min-h-[100px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Hashtag
                </label>
                <input readOnly value={hashtags} placeholder="#tag1 #tag2 #tag3" className="mt-1 w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {hashtags.split(/\s+/).filter(Boolean).map((h, i) => (
                    <Badge key={i} variant="outline">{h.startsWith("#") ? h : `#${h}`}</Badge>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium">Tanggal</label>
                  <input readOnly type="date" value={date} className="mt-1 w-full rounded-xl border p-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Jam</label>
                  <input readOnly type="time" value={time} className="mt-1 w-full rounded-xl border p-3 text-sm" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={noop}>Batal</Button>
              <Button onClick={noop} disabled>Simpan</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Video Picker Modal (functional) */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPickerOpen(false)} />
          <div className="relative z-10 h-screen w-screen bg-white shadow-xl flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b p-4 bg-white">
              <div className="text-sm font-medium">Pilih Video</div>
              <button className="rounded-full p-1 hover:bg-slate-100" onClick={() => setPickerOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <input placeholder="Cari judul video..." readOnly className="w-full rounded-xl border p-2 pl-8 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {videos.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-2xl border">
                    <div className="relative w-full bg-black/5" style={{ aspectRatio: "9 / 16" }}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Video className="h-7 w-7" />
                        <span className="text-xs">(Preview)</span>
                      </div>
                      <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                        <Clock className="h-3.5 w-3.5" /> {fmtDuration(v.durationSec)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium leading-5 line-clamp-2">{v.title}</div>
                      <div className="mt-1 text-xs text-slate-600">{fmtDate(v.createdAt)}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <Button size="sm" onClick={() => { setSelectedVideo(v); setPickerOpen(false); }}>Pilih</Button>
                        {v.id === selectedVideo?.id && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Dipilih
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t p-4 text-right">
              <Button variant="secondary" onClick={() => setPickerOpen(false)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
