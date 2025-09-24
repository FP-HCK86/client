// src/pages/VideoLibraryPage.jsx
import React, { useState, useEffect } from "react";
import { Film, Clock } from "lucide-react";
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
import api from '@/api/client';
import FullPageLoader from '@/components/FullPageLoader';

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
            description: e?.response?.data?.error || "Failed to load videos.",
            variant: "warning",
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
        title: "Video Deleted",
        description: "Video has been removed from the library.",
        variant: "success",
      });
      
      // Give user time to see the success toast
      setTimeout(() => {
        setDeleting(null);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Failed to Delete Video",
        description: error?.response?.data?.error || "Failed to delete video.",
        variant: "warning",
      });
      setDeleting(null); // Reset immediately on error
    }
  }

  // Use videos state directly

  if (loading) return <FullPageLoader text="Loading video list..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Film className="h-6 w-6" /> Video Library
          </h1>
          <div className="text-sm text-slate-600">
            Total: <span className="font-medium">{videos.length}</span> videos
          </div>
        </div>

        {/* Filter Bar (visual saja) */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
                <div>
                  <label className="text-sm font-medium">From Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">To Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sort</label>
                  <select className="mt-1 w-full rounded-xl border p-2 text-sm">
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
                  </select>
                </div>
              <div className="flex gap-2">
                <Button className="w-full" variant="secondary">
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

  {/* Grid Video */}
  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {videos.length === 0 ? (
            <div className="text-sm text-slate-600">No videos yet.</div>
          ) : (
            videos.map((v) => {
              const id = v._id || v.id;
              const duration = v.duration_sec ?? v.durationSec;
              const createdAt = v.createdAt || v.created_at;
              const caption = v.caption || "";
              const hashtags = v.hashtags || "";
              const secureUrl = v.secure_url || v.url || "";

              return (
                <div key={id} className="group relative">
                  <div className="relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-xl bg-white cursor-pointer">
                    {/* Jika ingin preview langsung video Cloudinary: */}
                    {secureUrl ? (
                      <video
                        src={secureUrl}
                        className="absolute inset-0 h-full w-full object-cover cursor-pointer"
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
                    {/* Hover Overlay - moved inside the preview wrapper so it matches size */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                      <div className="relative z-10 w-full h-full rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold leading-5 line-clamp-2 text-white">
                            {v.title || "Untitled"}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/90">
                            <Badge variant="secondary">
                              {fmtDate(createdAt)}
                            </Badge>
                          </div>
                          {caption && (
                            <p className="mt-2 text-xs text-white/90 line-clamp-2">
                              {caption}
                            </p>
                          )}
                          {hashtags && (
                            <p className="mt-1 text-[11px] text-white/80 truncate">
                              {hashtags}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            className="btn-default pointer-events-auto text-white cursor-pointer border border-black"
                            size="sm"
                            onClick={() => (window.location.href = `/videos/${id}`)}
                          >
                            Open Details
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="pointer-events-auto border border-black bg-white text-black cursor-pointer px-3 py-1 text-sm h-8 hover:bg-white hover:text-black hover:border-black hover:opacity-100 hover:shadow-none transition-none"
                                size="sm"
                                disabled={deleting === id}
                              >
                                {deleting === id ? "Deleting..." : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this video? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border border-black">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVideo(id)}
                                  className="btn-default border border-black"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
