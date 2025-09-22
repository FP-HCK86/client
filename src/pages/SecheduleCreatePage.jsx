// src/pages/ScheduleCreatePage.jsx
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Video,
  Hash,
  X,
  Search,
  Check,
  Info,
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
import { useToast } from "@/hooks/use-toast";
import api from "../api/client";

export default function ScheduleCreatePage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [platform, setPlatform] = useState("instagram"); // default
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm
  const [cover_time, setCover_time] = useState(0); // in seconds

  const [submitting, setSubmitting] = useState(false);
  const [lateInfo, setLateInfo] = useState(null); // store late post/job id
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch video user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/videos"); // { items: [...] }
        if (!mounted) return;
        setVideos(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!mounted) return;
        toast({
          title: "Error",
          description: e?.response?.data?.error || "Gagal memuat Video Library.",
          variant: "destructive",
          className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Saat pilih video → isi caption/hashtags dari DB
  const onPickVideo = (v) => {
    setSelectedVideo(v);
    setPickerOpen(false);
    setCaption(v?.caption || "");
    setHashtags(v?.hashtags || "");
  };

  // Helpers
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";
  const fmtDuration = (s) => {
    if (s === undefined || s === null) return "—";
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, "0");
    return `${m}:${sec}`;
  };
  const toUtcIsoFromLocalWIB = (d, t) =>
    new Date(`${d}T${t || "00:00"}:00+07:00`).toISOString();

  async function onSubmit() {
    try {
      setSubmitting(true);
      const video_id = selectedVideo?._id || selectedVideo?.id;
      const scheduled_at = toUtcIsoFromLocalWIB(date, time);

      const body = {
        video_id,
        platform, // "instagram" | "tiktok"
        caption,
        hashtags,
        cover_time,
        scheduled_at,
      };

      const { data } = await api.post("/schedules", body);
      toast({
        title: "Success!",
        description: `✔ ${data?.message || "Schedule created"}`,
        variant: "default",
        className: "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
      });
      if (data?.late?.postId) {
        setLateInfo({ postId: data.late.postId, mode: data.late.mode });
      } else if (data?.schedule?.vendor_job_id) {
        setLateInfo({ postId: data.schedule.vendor_job_id, mode: 'scheduled' });
      } else {
        setLateInfo(null);
      }
      // window.location.href = `/schedule/${data?.schedule?._id}`;
    } catch (e) {
      toast({
        title: "Error",
        description: e?.response?.data?.error || "Gagal membuat schedule",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const vDur = selectedVideo?.duration_sec ?? selectedVideo?.durationSec;
  const vUrl = selectedVideo?.secure_url || selectedVideo?.url || "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Create Schedule
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Buat jadwal posting baru dari Video Library.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom kiri: pilih + preview video */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5" /> Pilih & Preview Video
              </CardTitle>
              <CardDescription>Ambil dari Video Library kamu.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-slate-600">Memuat video…</div>
              ) : !selectedVideo ? (
                <Button onClick={() => setPickerOpen(true)}>Pilih Video</Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/5 ring-1 ring-slate-200">
                    {vUrl ? (
                      <video
                        src={vUrl}
                        controls
                        className="absolute inset-0 h-full w-full object-contain bg-black"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Video className="h-8 w-8" />
                        <span className="text-xs">
                          (Preview tidak tersedia)
                        </span>
                      </div>
                    )}
                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                      <Clock className="h-3.5 w-3.5" /> {fmtDuration(vDur)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium leading-5">
                      {selectedVideo.title || "Tanpa judul"}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Diunggah {fmtDate(selectedVideo.createdAt)} • Durasi{" "}
                      {fmtDuration(vDur)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setPickerOpen(true)}
                    >
                      Ganti Video
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVideo(null);
                        setCaption("");
                        setHashtags("");
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kolom kanan: detail schedule (+ info video terpilih) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> Detail Jadwal
              </CardTitle>
              <CardDescription>
                Atur platform, caption/hashtag, tanggal & jam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Info video terpilih (read-only) */}
              {selectedVideo && (
                <div className="rounded-xl border p-3 text-sm flex flex-wrap gap-3 items-center">
                  <span className="inline-flex items-center gap-2 text-slate-700">
                    <Info className="h-4 w-4" /> Video:{" "}
                    <b>{selectedVideo.title || "Tanpa judul"}</b>
                  </span>
                  <Badge variant="secondary">
                    Uploaded {fmtDate(selectedVideo.createdAt)}
                  </Badge>
                  <Badge variant="outline">Duration {fmtDuration(vDur)}</Badge>
                </div>
              )}

              {/* Platform */}
              <div>
                <div className="text-sm font-medium mb-2">Platform</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Instagram", value: "instagram" },
                    { label: "TikTok", value: "tiktok" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        platform === p.value
                          ? "bg-black text-white"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption (prefill dari video, jika ada) */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Video className="h-4 w-4" /> Caption
                  </label>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulis caption..."
                  className="min-h-[100px] w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>

              {/* Hashtags (prefill dari video, jika ada) */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Hashtag
                </label>
                <input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#tag1 #tag2 #tag3"
                  className="mt-1 w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {hashtags
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((h, i) => (
                      <Badge key={i} variant="outline">
                        {h.startsWith("#") ? h : `#${h}`}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Cover Time */}
              <div>
                <label className="text-sm font-medium">
                  Cover Time (seconds)
                </label>
                <input
                  type="number"
                  value={cover_time}
                  onChange={(e) => setCover_time(Number(e.target.value))}
                  min="0"
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Jam</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border p-3 text-sm"
                  />
                </div>
              </div>
            </CardContent>

            {/* Tombol Simpan: hanya di bawah */}
            <CardFooter className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => window.history.back()}>
                Batal
              </Button>
              <Button
                onClick={onSubmit}
                disabled={
                  submitting ||
                  loading ||
                  !selectedVideo ||
                  !caption ||
                  !date ||
                  !time ||
                  (date && time && new Date(`${date}T${time}:00`).getTime() < Date.now())
                }
              >
                {submitting ? "Menyimpan…" : "Simpan"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        {lateInfo && (
          <div className="mt-6 text-xs text-slate-600">
            Late job/post id: <span className="font-mono">{lateInfo.postId}</span> ({lateInfo.mode})
          </div>
        )}
      </div>

      {/* Video Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPickerOpen(false)}
          />
          <div className="relative z-10 h-screen w-screen bg-white shadow-xl flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b p-4 bg-white">
              <div className="text-sm font-medium">Pilih Video</div>
              <button
                className="rounded-full p-1 hover:bg-slate-100"
                onClick={() => setPickerOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Cari judul video..."
                    readOnly
                    className="w-full rounded-xl border p-2 pl-8 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {videos.map((v) => (
                  <div
                    key={v._id}
                    className="overflow-hidden rounded-2xl border"
                  >
                    <div
                      className="relative w-full bg-black/5"
                      style={{ aspectRatio: "9 / 16" }}
                    >
                      {v.secure_url ? (
                        <video
                          src={v.secure_url}
                          className="absolute inset-0 h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                          <Video className="h-7 w-7" />
                          <span className="text-xs">(Preview)</span>
                        </div>
                      )}
                      <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                        <Clock className="h-3.5 w-3.5" />{" "}
                        {fmtDuration(v.duration_sec)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium leading-5 line-clamp-2">
                        {v.title || "Tanpa judul"}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {fmtDate(v.createdAt)}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Button size="sm" onClick={() => onPickVideo(v)}>
                          Pilih
                        </Button>
                        {v._id === selectedVideo?._id && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Dipilih
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!videos.length && (
                  <div className="text-sm text-slate-600">Tidak ada video.</div>
                )}
              </div>
            </div>
            <div className="border-t p-4 text-right">
              <Button variant="secondary" onClick={() => setPickerOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
