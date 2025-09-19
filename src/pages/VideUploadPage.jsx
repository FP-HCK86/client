import React, { useState } from "react";
import { UploadCloud, Film, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import api from "../api/client";

export default function VideoUploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
    setMessage("");
  }

  async function onSave() {
    if (!file) {
      setMessage("Pilih file video.");
      return;
    }
    if (!caption) {
      setMessage("Caption wajib diisi.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const form = new FormData();
      form.append("file", file); // field: "file" (multer)
      form.append("caption", caption);
      form.append("hashtags", hashtags);
      if (title) form.append("title", title);

      const { data } = await api.post("/videos", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(`✔ Sukses upload. ID: ${data?.video?._id || "-"}`);
      // Opsional: redirect ke library
      // navigate(`/videos`);
    } catch (e) {
      setMessage(e?.response?.data?.error || "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Film className="h-6 w-6" /> Upload Video
            </h1>
            <p className="text-slate-600 mt-1">
              Unggah ke Cloudinary & simpan metadata ke DB.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-3">
          {/* Kolom kiri: Upload */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UploadCloud className="h-5 w-5" /> Pilih Video
              </CardTitle>
              <CardDescription>
                Seret & lepas atau klik area di bawah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="group relative w-full rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-slate-300">
                <input
                  id="file"
                  type="file"
                  accept="video/*"
                  onChange={onPickFile}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="pointer-events-none">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="font-medium">Seret & lepas</span> atau klik
                    untuk <span className="font-medium">pilih file</span>
                  </p>
                </div>
              </div>

              {/* Preview sederhana */}
              <div className="mt-4">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded-xl border"
                  />
                ) : (
                  <div className="text-xs text-slate-500">
                    Belum ada preview.
                  </div>
                )}
              </div>

              {/* Metadata minimal */}
              <div className="mt-4 space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul (opsional)"
                  className="w-full rounded-xl border p-3 text-sm"
                />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption (wajib)"
                  className="w-full rounded-xl border p-3 text-sm"
                />
                <input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#tag1 #tag2 #tag3"
                  className="w-full rounded-xl border p-3 text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-xs text-slate-600">{message}</div>
              <Button
                onClick={onSave}
                disabled={!file || !caption || uploading}
              >
                <Save className="mr-2 h-4 w-4" />{" "}
                {uploading ? "Menyimpan…" : "Simpan"}
              </Button>
            </CardFooter>
          </Card>

          {/* Kolom kanan: catatan ringkas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Catatan</CardTitle>
              <CardDescription>
                File dikirim sebagai <code>multipart/form-data</code> ke{" "}
                <code>POST /videos</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <p>
                - Field form: <strong>file</strong> (video),{" "}
                <strong>caption</strong>, <strong>hashtags</strong>,{" "}
                <em>title</em> (opsional).
              </p>
              <p>
                - Server menyimpan <code>secure_url</code> Cloudinary + metadata
                di MongoDB.
              </p>
              <p>
                - Setelah sukses, kamu bisa redirect ke Video Library atau tetap
                di halaman ini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
