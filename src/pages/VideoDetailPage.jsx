// src/pages/VideoDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Film, Clock, Copy, Calendar, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import HoverButton from "@/components/ui/HoverButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/client";
import FullPageLoader from "@/components/ui/FullPageLoader";

export default function VideoDetailPage() {
  const { id } = useParams(); // route: /videos/:id
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    caption: "",
    hashtags: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/videos/${id}`);
        if (!mounted) return;
        // ekspektasi backend: { video: {...} }
        if (!data?.video) {
          // jika tidak ada video, beri tahu dan hentikan lebih awal
          toast({
            title: "Video not found",
            description: "The requested video could not be found.",
            variant: "destructive",
          });
          setVideo(null);
          setLoading(false);
          return;
        }

        // data video ada — set state sekaligus
        setVideo(data.video);
        setEditForm({
          title: data.video.title || "",
          caption: data.video.caption || "",
          hashtags: data.video.hashtags || "",
        });
      } catch (e) {
        if (!mounted) return;
        toast({
          title: "Failed to load video",
          description: e?.response?.data?.error || "Failed to load video details",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, toast]);

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
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Edit functions
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (video) {
      setEditForm({
        title: video.title || "",
        caption: video.caption || "",
        hashtags: video.hashtags || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { data } = await api.patch(`/videos/${id}`, editForm);
      setVideo(data.video);
      setIsEditing(false);
      toast({
        title: "Video updated",
        description: "The video has been updated successfully.",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Failed to update video",
        description: e?.response?.data?.error || "Failed to update video",
        variant: "destructive",
      });
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // fallback data opsional bila backend belum sediakan insight
  const captions = video?.ai_captions || []; // misal backend isi di field ini
  const hashtagsArr = Array.isArray(video?.ai_hashtags)
    ? video.ai_hashtags
    : video?.hashtags
    ? String(video.hashtags).split(/\s+/).filter(Boolean)
    : [];

  const title = video?.title || "Untitled";
  const uploadedAt = video?.createdAt || video?.uploadedAt;
  const durationSec = video?.duration_sec ?? video?.durationSec;
  const secureUrl = video?.secure_url || video?.url || "";

  if (loading) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="text-2xl md:text-3xl font-semibold tracking-tight h-auto py-1 border-none shadow-none px-0 focus-visible:ring-0"
                    placeholder="Enter video title..."
                  />
                </div>
              ) : (
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
              )}
              <p className="text-slate-600 text-sm mt-1">Uploaded {fmtDate(uploadedAt)} · Duration {fmtDuration(durationSec)}</p>
            </div>
          </div>
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveEdit}
                  variant="default"
                  className="btn-default inline-flex items-center gap-2 px-3 py-1 h-8"
                >
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button onClick={handleCancelEdit} variant="outline">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleEditClick}
                  variant="outline"
                  className="inline-flex items-center gap-2 px-3 py-1 h-12 border border-black"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <HoverButton
                  onClick={() => navigate("/schedule/create")}
                  className="inline-flex items-center gap-2 px-3 py-1 h-8"
                >
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Post
                </HoverButton>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom video */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="relative w-full max-w-[360px] mx-auto aspect-[9/16] rounded-xl overflow-hidden border bg-white">
              {secureUrl ? (
                <video
                  src={secureUrl}
                  controls
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 bg-black/5">
                  <Film className="h-10 w-10" />
                  <span className="text-sm text-slate-600">(Video preview will appear here)</span>
                </div>
              )}
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                <Clock className="h-3.5 w-3.5" /> 0:00 /{" "}
                {fmtDuration(durationSec)}
              </div>
            </div>
          </Card>

          {/* Kolom kanan: Insight ringkas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Insights</CardTitle>
              <CardDescription>Ready-to-use caption & hashtags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Captions */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Caption</span>
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const text = captions?.[0] || video?.caption || "";
                        if (text) navigator.clipboard.writeText(text);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Textarea
                      id="caption"
                      value={editForm.caption}
                      onChange={(e) =>
                        handleFormChange("caption", e.target.value)
                      }
                      placeholder="Enter video caption..."
                      rows={3}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(captions.length
                      ? captions
                      : video?.caption
                      ? [video.caption]
                      : []
                    ).map((c, i) => (
                      <div key={i} className="rounded-xl border p-3 text-sm">
                        {c}
                      </div>
                    ))}
                    {(!captions || captions.length === 0) &&
                      !video?.caption && (
                        <div className="text-xs text-slate-500">No captions yet.</div>
                      )}
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Hashtag</span>
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const t = hashtagsArr.join(" ");
                        if (t) navigator.clipboard.writeText(t);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="hashtags">Hashtags</Label>
                    <Input
                      id="hashtags"
                      value={editForm.hashtags}
                      onChange={(e) =>
                        handleFormChange("hashtags", e.target.value)
                      }
                      placeholder="Enter hashtags (separate with spaces)..."
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hashtagsArr.length > 0 ? (
                      hashtagsArr.map((h, i) => (
                        <Badge key={i} variant="outline">
                          {h.startsWith("#") ? h : `#${h}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No hashtags yet.</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
