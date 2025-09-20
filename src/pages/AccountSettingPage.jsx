import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Link2,
  Link2Off,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
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

export default function AccountSettingsPage() {
  const profile = {
    name: "Akun Creator",
    email: "creator@example.com",
    avatarUrl: "",
  };

  const Avatar = () => (
    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
      {profile.avatarUrl ? (
        <div className="h-full w-full object-cover bg-slate-200" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          <User className="h-7 w-7" />
        </div>
      )}
    </div>
  );

  // (data integrasi dummy tidak digunakan di UI, hapus agar bersih ESLint)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-4xl px-2 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Account Settings
            </h1>
            <p className="text-slate-600 mt-1">
              Kelola profil dan koneksi platform Anda.
            </p>
          </div>
        </div>

        {/* Profile */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Profil</CardTitle>
            <CardDescription>Informasi akun dasar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />{" "}
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" /> {profile.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Integrasi Platform</CardTitle>
            <CardDescription>
              Hubungkan akun untuk otomatisasi posting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Instagram */}
            <div className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Instagram</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <Link2 className="mr-2 h-4 w-4" /> Connect
                </Button>
              </div>
            </div>

            {/* TikTok */}
            <div className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">TikTok</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <Link2 className="mr-2 h-4 w-4" /> Connect
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-slate-600">
              Dengan menghubungkan akun, Anda menyetujui scope yang dibutuhkan
              untuk publish konten dan membaca profil. Anda dapat memutuskan
              koneksi kapan saja.
            </div>
          </CardFooter>
        </Card>

        {/* Danger Zone (opsional) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Keamanan</CardTitle>
            <CardDescription>Kelola sesi & koneksi.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-4">
              <div className="text-sm">Logout dari semua sesi perangkat.</div>
              <Button variant="outline" asChild>
                <Link to="/logout">
                  <LogOut className="mr-2 h-4 w-4" /> Logout All
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
