import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Clock, Video, Hash, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import HoverButton from "@/components/ui/HoverButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editPlatform, setEditPlatform] = useState("instagram");
  const [editCaption, setEditCaption] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCoverTime, setEditCoverTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data } = await api.get(`/schedules/${id}`);
        setSchedule(data.schedule);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch schedule");
        toast({
          title: "Gagal Memuat Schedule",
          description: err.response?.data?.error || "Failed to fetch schedule",
          className:
            "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSchedule();
  }, [id, toast]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!schedule)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Schedule not found
      </div>
    );

  const fmtDateTime = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const toUtcIsoFromLocalWIB = (d, t) =>
    new Date(`${d}T${t || "00:00"}:00+07:00`).toISOString();

  const enterEditMode = () => {
    if (!schedule) return;
    setEditPlatform(schedule.platform || "instagram");
    setEditCaption(schedule.caption || "");
    setEditHashtags(schedule.hashtags || "");
    setEditCoverTime(Number(schedule.cover_time ?? 0));
    try {
      const dt = new Date(schedule.scheduled_at);
      // Local date/time fields for inputs
      const localIso = new Date(
        dt.getTime() - dt.getTimezoneOffset() * 60000
      ).toISOString();
      setEditDate(localIso.slice(0, 10));
      setEditTime(localIso.slice(11, 16));
    } catch {
      setEditDate("");
      setEditTime("");
    }
    setEditing(true);
  };

  const saveEdits = async () => {
    setSubmitting(true);
    try {
      const scheduled_at = toUtcIsoFromLocalWIB(editDate, editTime);
      const body = {
        platform: editPlatform,
        caption: editCaption,
        hashtags: editHashtags,
        cover_time: Number(editCoverTime || 0),
        scheduled_at,
      };
      const { data } = await api.patch(`/schedules/${id}`, body);
      setSchedule(data.schedule);
      setEditing(false);
      toast({
        title: "Schedule Berhasil Diperbarui",
        description: data?.message || "Schedule berhasil diperbarui",
        className:
          "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
      });
    } catch (e) {
      toast({
        title: "Gagal Memperbarui Schedule",
        description: e?.response?.data?.error || "Gagal memperbarui schedule",
        className:
          "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      setDeleting(true);
      await api.delete(`/schedules/${id}`);
      toast({
        title: "Schedule Berhasil Dihapus",
        description: "Schedule telah berhasil dihapus",
        className:
          "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
      });

      // Give user time to see the success toast before redirecting
      setTimeout(() => {
        window.location.href = "/schedules";
      }, 2000); // 2 seconds delay
    } catch (e) {
      toast({
        title: "Gagal Menghapus Schedule",
        description: e?.response?.data?.error || "Gagal menghapus schedule",
        className:
          "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      setDeleting(false); // Only reset deleting state on error, not on success
    }
    // Note: We don't reset setDeleting(false) on success to keep the button disabled during redirect
  };

  const statusBadge =
    schedule.status === "posted" ? (
      <Badge className="btn-green border-black font-normal">Posted</Badge>
    ) : schedule.status === "failed" ? (
      <Badge className="bg-red-100 text-black border-black">Failed</Badge>
    ) : (
      <Badge className="btn-orange border-black">Pending</Badge>
    );

  const logs = [
    { time: schedule.createdAt, text: "Schedule created" },
    { time: schedule.updatedAt, text: "Updated metadata" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Schedule Detail
              </h1>
              <p className="text-slate-600 text-sm mt-1">ID: {schedule._id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {schedule.status === "pending" ? (
              editing ? (
                <>
                  <HoverButton
                    size="sm"
                    onClick={saveEdits}
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan…" : "Simpan"}
                  </HoverButton>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    disabled={submitting}
                  >
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <HoverButton
                    type="button"
                    className="px-3 py-1 w-auto cursor-pointer border border-black"
                    onClick={enterEditMode}
                  >
                    Edit
                  </HoverButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        disabled={deleting}
                        className="border border-black"
                      >
                        {deleting ? "Menghapus…" : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus schedule ini?
                          Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSchedule}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border border-black"
                  onClick={() => {
                    toast({
                      title: "Tidak Dapat Diedit",
                      description: `Schedule tidak dapat diedit karena status sudah ${schedule.status}`,
                      className:
                        "bg-gradient-to-r from-orange-400 via-orange-300 to-orange-200 border-orange-300 text-gray-800",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="border border-black"
                  onClick={() => {
                    toast({
                      title: "Tidak Dapat Dihapus",
                      description: `Schedule tidak dapat dihapus karena status sudah ${schedule.status}`,
                      className:
                        "bg-gradient-to-r from-orange-400 via-orange-300 to-orange-200 border-orange-300 text-gray-800",
                    });
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Video preview */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="relative w-full max-w-[360px] mx-auto aspect-[9/16] rounded-xl overflow-hidden border bg-white">
              {schedule.video_id?.secure_url ? (
                <video
                  src={schedule.video_id.secure_url}
                  className="absolute inset-0 h-full w-full object-cover"
                  controls
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-black/5">
                  <Play className="h-10 w-10 text-slate-600" />
                  <span className="text-sm text-slate-600">
                    (Preview video akan tampil di sini)
                  </span>
                </div>
              )}
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                <Clock className="h-3.5 w-3.5" />{" "}
                {fmtDuration(schedule.video_id?.duration_sec || 0)}
              </div>
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Video:{" "}
                  <a
                    className="underline"
                    href={`/videos/${schedule.video_id?._id}`}
                  >
                    {schedule.video_id?.title}
                  </a>
                </div>
                <div className="text-sm text-slate-600">
                  Uploaded {fmtDate(schedule.video_id?.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info Jadwal</CardTitle>
              <CardDescription>Status & metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {statusBadge}
                {!editing ? (
                  <Badge variant="outline">{schedule.platform}</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    {[
                      { label: "Instagram", value: "instagram" },
                      { label: "TikTok", value: "tiktok" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setEditPlatform(p.value)}
                        className={`rounded-full border px-3 py-1 text-sm ${
                          editPlatform === p.value
                            ? "bg-black text-white"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border p-3 text-sm">
                <div className="text-xs text-slate-500">Waktu Terjadwal</div>
                <div className="mt-0.5 font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />{" "}
                  {fmtDateTime(schedule.scheduled_at)}
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium flex items-center gap-2">
                  Caption
                </div>
                {!editing ? (
                  <div className="rounded-xl border p-3 text-sm bg-white">
                    {schedule.caption}
                  </div>
                ) : (
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Tulis caption..."
                    className="min-h-[100px] w-full rounded-xl border p-3 text-sm"
                  />
                )}
                <div className="mt-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!editing)
                        navigator.clipboard?.writeText(schedule.caption || "");
                      else navigator.clipboard?.writeText(editCaption || "");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> copy
                  </Button>
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium flex items-center gap-2">
                  Hashtags
                </div>
                {!editing ? (
                  <div className="flex flex-wrap gap-2">
                    {(schedule.hashtags || "")
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((h, i) => (
                        <Badge key={i} variant="outline">
                          {h}
                        </Badge>
                      ))}
                  </div>
                ) : (
                  <div>
                    <input
                      value={editHashtags}
                      onChange={(e) => setEditHashtags(e.target.value)}
                      placeholder="#tag1 #tag2"
                      className="mt-1 w-full rounded-xl border p-3 text-sm"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editHashtags
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((h, i) => (
                          <Badge key={i} variant="outline">
                            {h.startsWith("#") ? h : `#${h}`}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!editing)
                        navigator.clipboard?.writeText(schedule.hashtags || "");
                      else navigator.clipboard?.writeText(editHashtags || "");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> copy
                  </Button>
                </div>
              </div>

              {editing && (
                <div>
                  <div className="mb-1 text-sm font-medium">
                    Cover Time (seconds)
                  </div>
                  <input
                    type="number"
                    value={editCoverTime}
                    onChange={(e) => setEditCoverTime(Number(e.target.value))}
                    min="0"
                    className="mt-1 w-full rounded-xl border p-3 text-sm"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Tanggal</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Jam</label>
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="mt-1 w-full rounded-xl border p-3 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
