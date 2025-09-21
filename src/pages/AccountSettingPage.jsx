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
  const [userIds, setUserIds] = useState({
    userId: null,
    profileId: null
  });
  const [connectionStatus, setConnectionStatus] = useState({
    instagram: false,
    tiktok: false
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [updating, setUpdating] = useState(false);
  const [connecting, setConnecting] = useState({
    instagram: false,
    tiktok: false
  });
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch profile data
        const profileResponse = await axios.get("http://localhost:3000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileResponse.data.user) {
          const userData = {
            name: profileResponse.data.user.username || "User",
            email: profileResponse.data.user.email || "",
            avatar: profileResponse.data.user.avatar || "",
          };
          setProfile(userData);
        }

        // Fetch user IDs for social media integration
        const userProfileResponse = await axios.get("http://localhost:3000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userProfileResponse.data.data) {
          setUserIds({
            userId: userProfileResponse.data.data.userId,
            profileId: userProfileResponse.data.data.profileId
          });
        }

        // Fetch connection status
        const connectionResponse = await axios.get("http://localhost:3000/user/connections", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (connectionResponse.data.data) {
          setConnectionStatus(connectionResponse.data.data);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
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

    fetchAllData();
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

  const handleUsernameUpdate = async () => {
    if (!tempUsername.trim() || tempUsername.trim() === profile.name) {
      setIsEditingUsername(false);
      return;
    }

    setUpdating(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.patch(
        "http://localhost:3000/auth/profile",
        { username: tempUsername.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.user) {
        setProfile(prev => ({
          ...prev,
          name: response.data.user.username,
        }));
        
        toast({
          title: "Success!",
          description: "Username updated successfully",
          variant: "purple",
          className: "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
        });
      }
      
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Failed to update username:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update username",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleConnect = async (platform) => {
    // Check if we have userId (profileId can be null for new users)
    if (!userIds.userId) {
      toast({
        title: "Error",
        description: "User information not loaded. Please refresh the page.",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
      return;
    }

    setConnecting(prev => ({ ...prev, [platform]: true }));
    
    try {
      // Use profileId if available, otherwise use userId as fallback
      const profileIdToUse = userIds.profileId || userIds.userId;
      
      // Construct the connection URL based on platform
      const connectUrl = `http://localhost:3000/connect/${platform}?profileId=${profileIdToUse}&userId=${userIds.userId}`;
      
      console.log(`Connecting to ${platform} with URL:`, connectUrl);
      
      // Open in new window/tab for OAuth flow
      const popup = window.open(
        connectUrl,
        `connect-${platform}`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for connection completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setConnecting(prev => ({ ...prev, [platform]: false }));
          
          // Refresh connection status after OAuth flow
          refreshConnectionStatus();
        }
      }, 1000);

      // Handle message from popup (optional, for immediate feedback)
      window.addEventListener('message', (event) => {
        if (event.origin !== 'http://localhost:3000') return;
        
        if (event.data.type === 'SOCIAL_CONNECT_SUCCESS' && event.data.platform === platform) {
          setConnectionStatus(prev => ({ ...prev, [platform]: true }));
          setConnecting(prev => ({ ...prev, [platform]: false }));
          popup.close();
          
          toast({
            title: "Success!",
            description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully`,
            variant: "purple",
            className: "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
          });
        } else if (event.data.type === 'SOCIAL_CONNECT_ERROR') {
          setConnecting(prev => ({ ...prev, [platform]: false }));
          popup.close();
          
          toast({
            title: "Connection Failed",
            description: event.data.message || `Failed to connect ${platform}`,
            variant: "destructive",
            className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
          });
        }
      });

    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      setConnecting(prev => ({ ...prev, [platform]: false }));
      
      toast({
        title: "Connection Failed",
        description: `Failed to initiate ${platform} connection`,
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
      });
    }
  };

  const refreshConnectionStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:3000/user/connections", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data) {
        setConnectionStatus(response.data.data);
      }
    } catch (error) {
      console.error("Failed to refresh connection status:", error);
    }
  };

  const Avatar = () => (
    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 group cursor-pointer">
      {profile.avatar && profile.avatar !== "https://example.com/avatar.jpg" ? (
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
                  <User className="h-4 w-4" />
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter username"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUsernameUpdate();
                          if (e.key === 'Escape') setIsEditingUsername(false);
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleUsernameUpdate}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingUsername(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span 
                      className="font-medium cursor-pointer hover:text-purple-600 hover:underline"
                      onClick={() => {
                        setTempUsername(profile.name);
                        setIsEditingUsername(true);
                      }}
                      title="Click to edit username"
                    >
                      {profile.name}
                    </span>
                  )}
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
                  {connectionStatus.instagram && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {connectionStatus.instagram 
                    ? "Connected - ready for posting" 
                    : "Connect to enable Instagram posting"
                  }
                </div>
              </div>
              <div className="flex gap-2">
                {connectionStatus.instagram ? (
                  <Button variant="outline" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Connected
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleConnect('instagram')}
                    disabled={connecting.instagram}
                  >
                    {connecting.instagram ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" /> Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* TikTok */}
            <div className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">TikTok</span>
                  {connectionStatus.tiktok && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {connectionStatus.tiktok 
                    ? "Connected - ready for posting" 
                    : "Connect to enable TikTok posting"
                  }
                </div>
              </div>
              <div className="flex gap-2">
                {connectionStatus.tiktok ? (
                  <Button variant="outline" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Connected
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleConnect('tiktok')}
                    disabled={connecting.tiktok}
                  >
                    {connecting.tiktok ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" /> Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Development Status Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Development Status</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Social media integration is ready. Late API key needs to be updated for full OAuth functionality.
                Current connection URLs: {userIds.userId ? `userId=${userIds.userId}` : 'Loading...'}
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
