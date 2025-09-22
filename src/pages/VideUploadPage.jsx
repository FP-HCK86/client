import React, { useState } from "react";
import { UploadCloud, Film, Save } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import api from "../api/client";

export default function VideoUploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
  }

  async function onSave() {
    if (!file) {
      toast({
        title: "Error",
        description: "Pilih file video.",
        variant: "destructive",
        className:
          "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      return;
    }
    if (!caption) {
      toast({
        title: "Error",
        description: "Caption wajib diisi.",
        variant: "destructive",
        className:
          "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      return;
    }

    try {
      setUploading(true);

      const form = new FormData();
      form.append("file", file); // field: "file" (multer)
      form.append("caption", caption);
      form.append("hashtags", hashtags);
      if (title) form.append("title", title);

      const { data } = await api.post("/videos", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success!",
        description: `✔ Sukses upload. ID: ${data?.video?._id || "-"}`,
        variant: "default",
        className:
          "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
      });
      // Opsional: redirect ke library
      // navigate(`/videos`);
    } catch (e) {
      toast({
        title: "Upload Failed",
        description: e?.response?.data?.error || "Upload gagal.",
        variant: "destructive",
        className:
          "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
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

              {/* Preview is shown in the right column (Catatan) when available */}

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
            <CardFooter className="flex items-center justify-end">
              <HoverButton
                onClick={onSave}
                disabled={!file || !caption || uploading}
                className="cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />{" "}
                {uploading ? "Menyimpan…" : "Simpan"}
              </HoverButton>
            </CardFooter>
          </Card>

          {/* Kolom kanan: preview & catatan ringkas */}
          <Card className="lg:col-span-2">
            <CardHeader className="text-center">
              <CardTitle className="text-lg mx-auto">Preview & Catatan</CardTitle>
              <CardDescription className="mx-auto">
                Pratinjau video yang dipilih akan muncul di sini. Informasi upload
                dan catatan teknis ditampilkan di bawah preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-4">
              <div className="flex justify-center">
                {previewUrl ? (
                  <div className="w-full max-w-[360px]">
                    <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden border">
                      <video
                        src={previewUrl}
                        controls
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 text-xs text-slate-500 py-3 px-3 rounded">
                    Belum ada preview.
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
