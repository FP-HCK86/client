import React from "react";
import { Film, Clock, Trash2, Filter as FilterIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Static VideoLibraryPage: hooks and logic removed, data hardcoded.
export default function VideoLibraryPage() {
  // Hardcoded static data (no hooks/logic)
  const videos = [
    { id: "v-001", title: "Tutorial Editing Cepat #1", createdAt: "2025-09-12T10:00:00.000Z", durationSec: 68, sizeBytes: 42000000, url: "" },
    { id: "v-002", title: "Belajar Lighting Dasar", createdAt: "2025-09-10T10:00:00.000Z", durationSec: 134, sizeBytes: 88000000, url: "" },
    { id: "v-003", title: "Hook Video: Bikin Nempel!", createdAt: "2025-09-07T10:00:00.000Z", durationSec: 59, sizeBytes: 35000000, url: "" },
    { id: "v-004", title: "Transisi Keren di Reels", createdAt: "2025-09-05T10:00:00.000Z", durationSec: 92, sizeBytes: 77000000, url: "" },
    { id: "v-005", title: "Tips Audio Biar Jelas", createdAt: "2025-09-03T10:00:00.000Z", durationSec: 75, sizeBytes: 51000000, url: "" },
    { id: "v-006", title: "Color Grading Cepat", createdAt: "2025-09-01T10:00:00.000Z", durationSec: 101, sizeBytes: 65000000, url: "" },
    { id: "v-007", title: "Bikin Caption Menarik", createdAt: "2025-08-31T10:00:00.000Z", durationSec: 80, sizeBytes: 60000000, url: "" },
    { id: "v-008", title: "Shot List untuk Vlog", createdAt: "2025-08-29T10:00:00.000Z", durationSec: 120, sizeBytes: 90000000, url: "" },
    { id: "v-009", title: "Stabilizer vs Handheld", createdAt: "2025-08-28T10:00:00.000Z", durationSec: 110, sizeBytes: 85000000, url: "" },
  ];

  // Simple format helpers (pure functions)
  const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };
  const fmtSize = (bytes) => {
    if (!bytes) return "-";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${val} ${sizes[i]}`;
  };

  const shown = videos; // all hardcoded visible

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Film className="h-6 w-6" /> Video Library
          </h1>
          <div className="text-sm text-slate-600">Total: <span className="font-medium">{shown.length}</span> video</div>
        </div>

        {/* Filter Bar (static visual only) */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div>
                <label className="text-sm font-medium">Dari Tanggal</label>
                <input type="date" className="mt-1 w-full rounded-xl border p-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <input type="date" className="mt-1 w-full rounded-xl border p-2 text-sm" />
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

        {/* Grid Video (container penuh) */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((v) => (
            <div key={v.id} className="group relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-black/5">
              <div className="relative aspect-[9/16] w-full">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <Film className="h-8 w-8" />
                </div>
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-xs text-white">
                  <Clock className="h-3.5 w-3.5" /> {fmtDuration(v.durationSec)}
                </div>
              </div>

              {/* Hover Modal Overlay (static) */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold leading-5 line-clamp-2">{v.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <Badge variant="secondary">{fmtDate(v.createdAt)}</Badge>
                        <Badge variant="outline">{fmtSize(v.sizeBytes)}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button className="pointer-events-auto" size="sm">Buka Detail</Button>
                    <Button className="pointer-events-auto" size="sm" variant="ghost">
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No dynamic load-more or empty-state (static) */}
      </div>
    </div>
  );
}