import React from "react";
import {
  Video,
  CalendarDays,
  UploadCloud,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play,
  MoreHorizontal,
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
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {

  const stats = {
    totalVideos: 128,
    scheduled: 12,
    posted7d: 24,
    failed7d: 1,
    scheduleProgress: 60,
  };

  const recentVideos = [
    {
      id: "v-201",
      title: "Editing Cepat: 3 trik padat",
      createdAt: "1 day ago",
      durationSec: 76,
      status: "Analyzed",
    },
    {
      id: "v-198",
      title: "Lighting untuk konten mobile",
      createdAt: "2 days ago",
      durationSec: 112,
      status: "Queued",
    },
    {
      id: "v-197",
      title: "Hook 3 detik yang nempel",
      createdAt: "3 days ago",
      durationSec: 59,
      status: "Analyzed",
    },
  ];

  const upcoming = [
    {
      id: "s-501",
      title: "IG Reels: Editing cepat",
      date: "2 hours from now",
      platform: "Instagram",
    },
    {
      id: "s-502",
      title: "TikTok: Transisi keren",
      date: "8 hours from now",
      platform: "TikTok",
    },
    {
      id: "s-503",
      title: "YT Shorts: Workflow upload",
      date: "26 hours from now",
      platform: "YouTube",
    },
  ];

  const postsByDay = [6, 3, 5, 2, 4, 7, 5];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Ringkasan performa, video terbaru, dan jadwal mendatang.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Video 
            </Button>
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </Button>
            <Button variant="ghost">
              <MoreHorizontal className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Video className="h-5 w-5" />}
            title="Total Videos"
            value={stats.totalVideos}
            sub="semua waktu"
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Scheduled"
            value={stats.scheduled}
            sub="antrian aktif"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Posted (7d)"
            value={stats.posted7d}
            sub="terakhir 7 hari"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Failed (7d)"
            value={stats.failed7d}
            sub="perlu tindakan"
          />
        </div>

        {/* Middle Row: Performance + Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Performance Overview</CardTitle>
              <CardDescription>
                Posting per hari (7 hari terakhir).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MinisBars data={postsByDay} />
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <div className="text-sm text-slate-500">
                    Target jadwal minggu ini
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-xl font-semibold">20</div>
                    <Badge variant="secondary">
                      {stats.scheduleProgress}%
                    </Badge>
                  </div>
                  <Progress value={stats.scheduleProgress} className="mt-2" />
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-sm text-slate-500">
                    Estimasi jangkauan
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xl font-semibold">
                    <BarChart3 className="h-5 w-5" /> 48K
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Perkiraan berdasarkan performa minggu lalu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Langkah cepat yang sering dipakai.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload & Analyze
              </Button>
              <Button
                className="w-full"
                variant="secondary"
              >
                <Video className="mr-2 h-4 w-4" /> Open Library
              </Button>
              <Button
                className="w-full"
                variant="outline"
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Create Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Recent Videos + Upcoming */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Videos</CardTitle>
              <CardDescription>
                Aktivitas terbaru yang sudah diupload.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y">
                {recentVideos.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-12 w-20 overflow-hidden rounded-md bg-black/5 ring-1 ring-slate-200">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          <Play className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {v.title}
                        </div>
                        <div className="text-xs text-slate-600">
                          {v.createdAt} · {Math.floor(v.durationSec / 60)}:{String(v.durationSec % 60).padStart(2, "0")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          v.status === "Analyzed" ? "default" : "secondary"
                        }
                      >
                        {v.status}
                      </Badge>
                      <Button size="sm">
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="ghost">
                View all
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Schedules</CardTitle>
              <CardDescription>Posting yang akan tayang.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {upcoming.map((e) => (
                  <button
                    key={e.id}
                    className="flex items-center justify-between rounded-xl border p-3 text-left hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-medium leading-5">
                        {e.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {e.date} ·{" "}
                        <span className="font-medium">{e.platform}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{e.date.split(" ")[0]}h</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="ghost">
                Open Calendar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Helpers & small components ---
function StatCard({ icon, title, value, sub }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-slate-600">
            {title} · {sub}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MinisBars({ data = [] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="grid grid-cols-7 items-end gap-2 rounded-xl border p-4">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-28 w-6 rounded-md bg-slate-100">
            <div
              className="w-full rounded-md bg-black"
              style={{ height: `${(v / max) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">D{i + 1}</div>
        </div>
      ))}
    </div>
  );
}

// (hapus helper tak terpakai untuk bersihkan ESLint)
