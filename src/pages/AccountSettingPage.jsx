import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  Camera,
  Upload,
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
import { useToast } from "@/hooks/use-toast";

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Changed from "token" to "authToken"
        console.log("Token from localStorage:", token ? "exists" : "missing");
        
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Making API call to fetch profile...");
        const response = await axios.get("http://localhost:3000/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        if (response.data.user) {
          const userData = {
            name: response.data.user.username || "User",
            email: response.data.user.email || "",
            avatar: response.data.user.avatar || "",
          };
          
          console.log("Setting profile data:", userData);
          setProfile(userData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        console.error("Error response:", error.response?.data);
        
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load profile data",
          variant: "destructive",
          className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      return;
    }

    setUploading(true);
    
    try {
      const token = localStorage.getItem("authToken"); // Changed from "token" to "authToken"
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(
        "http://localhost:3000/auth/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.user) {
        setProfile(prev => ({
          ...prev,
          avatar: response.data.user.avatar,
        }));
        
        toast({
          title: "Success!",
          description: "Profile picture updated successfully",
          variant: "purple",
          className: "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
        });
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload profile picture",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
    } finally {
      setUploading(false);
    }
  };

  const Avatar = () => (
    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 group cursor-pointer">
      {profile.avatar ? (
        <img 
          src={profile.avatar} 
          alt="Profile"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          <User className="h-7 w-7" />
        </div>
      )}
      
      {/* Upload overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

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
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />{" "}
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" /> {profile.email}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Change Photo
                    </>
                  )}
                </Button>
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
