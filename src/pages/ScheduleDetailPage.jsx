import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Clock, Video, Hash, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "../api/client";

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data } = await api.get(`/schedules/${id}`);
        setSchedule(data.schedule);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSchedule();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!schedule) return <div className="min-h-screen flex items-center justify-center">Schedule not found</div>;

  const fmtDateTime = (iso) => new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtDuration = (s) => { const m = Math.floor(s/60); const sec = String(Math.floor(s%60)).padStart(2,"0"); return `${m}:${sec}`; };

  const statusBadge = (
    schedule.status === "posted" ? <Badge className="bg-green-600 text-white">Posted</Badge>
    : schedule.status === "failed" ? <Badge className="bg-red-600 text-white">Failed</Badge>
    : <Badge className="bg-amber-500 text-white">Pending</Badge>
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
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Schedule Detail</h1>
              <p className="text-slate-600 text-sm mt-1">ID: {schedule._id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Edit</Button>
            <Button variant="ghost">Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Video preview */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="relative aspect-square max-w-sm mx-auto w-full bg-black/5">
              {schedule.video_id?.secure_url ? (
                <video
                  src={schedule.video_id.secure_url}
                  className="absolute inset-0 h-full w-full object-contain bg-black"
                  controls
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 bg-black/80">
                  <Play className="h-10 w-10" />
                  <span className="text-sm text-white/80">(Preview video akan tampil di sini)</span>
                </div>
              )}
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                <Clock className="h-3.5 w-3.5" /> {fmtDuration(schedule.video_id?.duration_sec || 0)}
              </div>
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">Video: <a className="underline" href={`/videos/${schedule.video_id?._id}`}>{schedule.video_id?.title}</a></div>
                <div className="text-sm text-slate-600">Uploaded {fmtDate(schedule.video_id?.createdAt)}</div>
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
                <Badge variant="outline">{schedule.platform}</Badge>
              </div>
              <div className="rounded-xl border p-3 text-sm">
                <div className="text-xs text-slate-500">Waktu Terjadwal</div>
                <div className="mt-0.5 font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {fmtDateTime(schedule.scheduled_at)}</div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium flex items-center gap-2"><Video className="h-4 w-4" /> Caption</div>
                <div className="rounded-xl border p-3 text-sm bg-white">{schedule.caption}</div>
                <div className="mt-2 text-right">
                  <Button size="sm" variant="ghost">Copy Caption</Button>
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium flex items-center gap-2"><Hash className="h-4 w-4" /> Hashtags</div>
                <div className="flex flex-wrap gap-2">
                  {(schedule.hashtags || "").split(/\s+/).filter(Boolean).map((h, i) => (
                    <Badge key={i} variant="outline">{h}</Badge>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <Button size="sm" variant="ghost">Copy Hashtags</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity / Logs */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas</CardTitle>
            <CardDescription>Riwayat status & tindakan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {logs.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">Belum ada aktivitas</div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div>{log.text}</div>
                  <div className="text-xs text-slate-500">{fmtDateTime(log.time)}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-end">
            <div className="text-xs text-slate-500">Terakhir diperbarui: {fmtDateTime(schedule.updatedAt)}</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}