// src/pages/VideoLibraryPage.jsx
import React, { useState, useEffect } from "react";
import { Film, Clock, Trash2, Filter as FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import api from "../api/client";

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track which video is being deleted
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/videos");
        if (!mounted) return;
        setVideos(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!mounted) return;
        toast({
          title: "Error",
          description: e?.response?.data?.error || "Gagal memuat video.",
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

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";
  const fmtDuration = (s) => {
    if (!s && s !== 0) return "—";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Hapus video dengan konfirmasi yang proper
  async function handleDeleteVideo(id) {
    try {
      setDeleting(id);
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => (v._id || v.id) !== id));
      toast({
        title: "Video Berhasil Dihapus",
        description: "Video telah berhasil dihapus dari library",
        className: "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
      });
      
      // Give user time to see the success toast
      setTimeout(() => {
        setDeleting(null);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Gagal Menghapus Video",
        description: error?.response?.data?.error || "Gagal menghapus video",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      setDeleting(null); // Reset immediately on error
    }
  }

  const shown = videos; // semua hasil GET /videos

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Film className="h-6 w-6" /> Video Library
          </h1>
          <div className="text-sm text-slate-600">
            {loading ? (
              "Memuat…"
            ) : (
              <>
                Total: <span className="font-medium">{shown.length}</span> video
              </>
            )}
          </div>
        </div>

        {/* Filter Bar (visual saja) */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div>
                <label className="text-sm font-medium">Dari Tanggal</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Urutkan</label>
                <select className="mt-1 w-full rounded-xl border p-2 text-sm">
                  <option value="desc">Terbaru</option>
                  <option value="asc">Terlama</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="w-full" variant="secondary">
                  <FilterIcon className="mr-2 h-4 w-4" /> Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Video */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="text-sm text-slate-600">Memuat daftar video…</div>
          ) : shown.length === 0 ? (
            <div className="text-sm text-slate-600">Belum ada video.</div>
          ) : (
            shown.map((v) => {
              const id = v._id || v.id;
              const duration = v.duration_sec ?? v.durationSec;
              const createdAt = v.createdAt || v.created_at;
              const caption = v.caption || "";
              const hashtags = v.hashtags || "";
              const secureUrl = v.secure_url || v.url || "";

              return (
                <div
                  key={id}
                  className="group relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-black/5"
                >
                  <div className="relative aspect-[9/16] w-full">
                    {/* Jika ingin preview langsung video Cloudinary: */}
                    {secureUrl ? (
                      <video
                        src={secureUrl}
                        className="absolute inset-0 h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        <Film className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                      <Clock className="h-3.5 w-3.5" /> {fmtDuration(duration)}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold leading-5 line-clamp-2">
                            {v.title || "Tanpa judul"}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <Badge variant="secondary">
                              {fmtDate(createdAt)}
                            </Badge>
                          </div>
                          {caption && (
                            <p className="mt-2 text-xs text-slate-700 line-clamp-2">
                              {caption}
                            </p>
                          )}
                          {hashtags && (
                            <p className="mt-1 text-[11px] text-slate-500 truncate">
                              {hashtags}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          className="pointer-events-auto"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/videos/${id}`)
                          }
                        >
                          Buka Detail
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="pointer-events-auto"
                              size="sm"
                              variant="ghost"
                              disabled={deleting === id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> 
                              {deleting === id ? "Menghapus..." : "Hapus"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Video</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus video ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVideo(id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
