import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "@/api/client";
import {
  User,
  Mail,
  Link2,
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
import HoverButton from "@/components/HoverButton";

// Base URL for API calls. Override via VITE_API_BASE_URL if needed.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [updating, setUpdating] = useState(false);
  // Track connecting/loading per platform so only the clicked button shows loading
  const [connectingByPlatform, setConnectingByPlatform] = useState({});
  const connectingRef = useRef({}); // mirror for synchronous checks inside callbacks
  const fileInputRef = useRef(null);
  const lastConnectRef = useRef({}); // To prevent duplicate calls per platform
  const { toast } = useToast();

  const handleConnect = useCallback(
    async (platform) => {
      console.log("=== HANDLE CONNECT DEBUG ===");
      console.log("handleConnect called with platform:", platform);

      if (!platform || typeof platform !== "string") {
        console.error("Invalid platform parameter:", platform);
        toast({
          title: "Error",
          description: "Platform parameter is invalid",
          variant: "warning",
        });
        return;
      }

      // Prevent duplicate calls within short time window per platform
      const now = Date.now();
      if (
        lastConnectRef.current?.[platform] &&
        now - lastConnectRef.current[platform] < 1000
      ) {
        console.log("Preventing duplicate call within 1 second for", platform);
        return;
      }
      lastConnectRef.current[platform] = now;

      // If this platform is already connecting, ignore
      if (connectingRef.current?.[platform]) {
        console.log(
          "Already connecting for",
          platform,
          "- ignoring duplicate call"
        );
        return;
      }

      // mark this platform as connecting
      setConnectingByPlatform((prev) => {
        const next = { ...(prev || {}), [platform]: true };
        connectingRef.current = next;
        return next;
      });

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast({
            title: "Error",
            description: "Token not found. Please log in again.",
            variant: "warning",
          });
          return;
        }

        console.log("Making request to:", `/connect/${platform}`);

        const resp = await api.get(`/connect/${platform}`, {
          headers: { Authorization: `Bearer ${token}` },
          maxRedirects: 0,
          validateStatus: (status) => status < 400,
        });

        console.log("Response received:", resp.status, resp.headers, resp.data);

        if (platform === "undefined") {
          console.error(
            'Guard hit: platform literal string "undefined" reached success path – aborting.'
          );
          toast({
            title: "Platform Error",
            description:
              "Platform parameter is invalid (undefined). Please reload the page and try again.",
            variant: "warning",
          });
          return;
        }

        const redirectUrl =
          resp.data?.redirectUrl ||
          resp.data?.authUrl ||
          resp.headers?.location ||
          resp.data?.location ||
          resp.data?.redirect_url ||
          resp.data?.redirectUrl;
        if (redirectUrl) {
          console.log("Redirecting user-agent to:", redirectUrl);
          window.location.href = redirectUrl;
          return;
        }

        toast({
          title: "No OAuth URL",
          description:
            "Server did not return a redirect URL. Please try again later.",
          variant: "warning",
        });
      } catch (error) {
        console.log("=== ERROR CAUGHT ===");
        console.log("Error object:", error);
        console.log("Error message:", error?.message);
        console.log("Error response:", error?.response);
        console.log("Error response status:", error?.response?.status);
        console.log("Error response data:", error?.response?.data);

        const status = error?.response?.status;
        const loc = error?.response?.headers?.location;
        if (status === 302 && loc) {
          console.log("Found 302 redirect to:", loc);
          window.location.href = loc;
          return;
        }
        if (
          status === 400 &&
          error?.response?.data?.error?.includes("Platform undefined")
        ) {
          toast({
            title: "Invalid Platform",
            description:
              "Front-end sent platform undefined. Please refresh and try again.",
            variant: "warning",
          });
          return;
        }
        if (status === 502) {
          toast({
            title: "Failed to Get Redirect",
            description:
              "Late API did not return a redirect URL. Please try again later or contact the administrator.",
            variant: "warning",
          });
          return;
        }
        if (status === 401) {
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "warning",
          });
          return;
        }
        toast({
          title: "Connection Error",
          description:
            (error?.response?.data && error.response.data.error) ||
            error?.message ||
            "Failed to start connection to platform",
          variant: "warning",
        });
      } finally {
        // unset only this platform's connecting state
        setConnectingByPlatform((prev) => {
          const next = { ...(prev || {}) };
          next[platform] = false;
          connectingRef.current = next;
          return next;
        });
      }
    },
    [toast]
  );

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");
        const res = await api.get(`/auth/profile`);
        if (res.data && res.data.user) {
          setProfile({
            name: res.data.user.username || "User",
            email: res.data.user.email || "",
            avatar: res.data.user.avatar || "",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            (error?.response?.data && error.response.data.message) ||
            "Failed to load profile data",
          variant: "warning",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  /**
   * Handle uploading a new avatar image. Performs basic client-side
   * validation and sends the file to the backend.
   */
  const handleAvatarUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "warning",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "warning",
      });
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post(`/auth/upload-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data && res.data.user && res.data.user.avatar) {
        setProfile((prev) => ({ ...prev, avatar: res.data.user.avatar }));
        toast({
          title: "Success!",
          description: "Profile picture updated successfully",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description:
          (error?.response?.data && error.response.data.message) ||
          "Failed to upload profile picture",
        variant: "warning",
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
      const response = await api.patch(`/auth/profile`, {
        username: tempUsername.trim(),
      });

      if (response.data.user) {
        setProfile((prev) => ({
          ...prev,
          name: response.data.user.username,
        }));

        toast({
          title: "Success!",
          description: "Username updated successfully",
          variant: "success",
        });
      }

      setIsEditingUsername(false);
    } catch (error) {
      console.error("Failed to update username:", error);
      toast({
        title: "Update Failed",
        description:
          error.response?.data?.message || "Failed to update username",
        variant: "warning",
      });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Avatar subcomponent displays the user's avatar and shows an overlay
   * button for uploading a new picture.
   */
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
      <div
        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </div>
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
              Manage your profile and connected platforms.
            </p>
          </div>
        </div>
        {/* Profile */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Basic account information.</CardDescription>
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
                          if (e.key === "Enter") handleUsernameUpdate();
                          if (e.key === "Escape") setIsEditingUsername(false);
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleUsernameUpdate}
                        disabled={updating}
                        className="btn-default hover-btn-green cursor-pointer"
                      >
                        {updating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingUsername(false)}
                        className="cursor-pointer"
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
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  disabled={uploading}
                  className="cursor-pointer border border-black"
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
            <CardTitle className="text-lg">Integrations</CardTitle>
            <CardDescription>
              Connect accounts for automated posting.
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
                <HoverButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConnect("instagram");
                  }}
                  disabled={!!connectingByPlatform?.instagram}
                  className="cursor-pointer"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {connectingByPlatform?.instagram
                    ? "Connecting..."
                    : "Connect"}
                </HoverButton>
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
                <HoverButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConnect("tiktok");
                  }}
                  disabled={!!connectingByPlatform?.tiktok}
                  className="cursor-pointer"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {connectingByPlatform?.tiktok ? "Connecting..." : "Connect"}
                </HoverButton>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-slate-600">
              By connecting an account you agree to the required scopes for
              publishing content and reading profile information. You may
              disconnect at any time.
            </div>
          </CardFooter>
        </Card>
        {/* Danger Zone */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>Manage sessions & connections.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-4">
              <div className="text-sm">Logout</div>
              <Button variant="outline" asChild className="cursor-pointer">
                <Link to="/logout">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
