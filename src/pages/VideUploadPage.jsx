import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Film, Save } from "lucide-react";
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
import api from '@/api/client';
import FullPageLoader from '@/components/ui/FullPageLoader';

export default function VideoUploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  function onPickFile(e) {
    const f = e.target.files?.[0];
    // Revoke previous preview URL to avoid memory leak
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch (_) {}
    }
    setFile(f || null);
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }
    if (!caption) {
      toast({
        title: "Error",
        description: "Caption is required.",
        variant: "destructive",
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
        description: `Upload video successful.`,
        variant: "success",
      });
      // Redirect to library after a short delay so the user can see the toast
      setTimeout(() => navigate('/videos'), 700);
    } catch (e) {
      toast({
        title: "Upload Failed",
        description: "Upload video failed.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {uploading && <FullPageLoader text="Uploading video…" />}
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Film className="h-6 w-6" /> Upload Video
            </h1>
            <p className="text-slate-600 mt-1">Upload to Cloudinary & save metadata to DB.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-3">
          {/* Kolom kiri: Upload */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UploadCloud className="h-5 w-5" /> Select Video
              </CardTitle>
              <CardDescription>Drag & drop or click the area below.</CardDescription>
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
                    <span className="font-medium">Drag & drop</span> or click to <span className="font-medium">select a file</span>
                  </p>
                </div>
              </div>

              {/* Preview is shown in the right column (Catatan) when available */}

              {/* Metadata minimal */}
              <div className="mt-4 space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full rounded-xl border p-3 text-sm"
                />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption (required)"
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
                {uploading ? "Saving…" : "Save"}
              </HoverButton>
            </CardFooter>
          </Card>

          {/* Kolom kanan: preview & catatan ringkas */}
          <Card className="lg:col-span-2">
            <CardHeader className="text-center">
              <CardTitle className="text-lg mx-auto">Preview & Notes</CardTitle>
              <CardDescription className="mx-auto">
                The selected video preview will appear here. Upload info and technical notes are shown below the preview.
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
                  <div className="bg-gray-100 text-xs text-slate-500 py-3 px-3 rounded">No preview available.</div>
                )}  
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
