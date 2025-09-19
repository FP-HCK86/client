"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/hooks/use-toast";

const LoginPage = memo(() => {
  const { googleLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Local UI state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      setGoogleLoading(true);
      setErrors({});
      toast({
        title: "Authenticating...",
        description: "Verifying Google credential",
      });
      try {
        const result = await googleLogin(response.credential);
        if (result.success) {
          toast({ title: "Success", description: "Login successful" });
          navigate("/dashboard", { replace: true });
        } else {
          const msg = result.error || "Google authentication failed";
          setErrors({ general: msg });
          toast({
            title: "Authentication Failed",
            description: msg,
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Google Sign-In error", e);
        const msg = "Google authentication failed. Please try again.";
        setErrors({ general: msg });
        toast({
          title: "Authentication Error",
          description: msg,
          variant: "destructive",
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, navigate, toast]
  );

  // Single script loader & initializer (deduplicated)
  useEffect(() => {
    const initialize = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          cancel_on_tap_outside: true,
          context: "signin",
        });
        const mountPoint = document.getElementById("google-btn");
        if (mountPoint && mountPoint.childElementCount === 0) {
          window.google.accounts.id.renderButton(mountPoint, {
            theme: "outline",
            size: "large",
            width: 320,
          });
        }
      } catch (err) {
        console.error("Google init failed", err);
        toast({
          title: "Init Error",
          description: "Failed to initialize Google Sign-In",
          variant: "destructive",
        });
      }
    };

    if (window.google?.accounts?.id) {
      initialize();
      return;
    }

    const scriptId = "google-identity-services";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      script.onerror = () =>
        toast({
          title: "Script Error",
          description: "Failed to load Google Sign-In script",
          variant: "destructive",
        });
      document.head.appendChild(script);
    } else {
      const t = setTimeout(initialize, 500);
      return () => clearTimeout(t);
    }
  }, [handleCredentialResponse, toast]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar (Back / Sign up) */}
      <div className="mx-auto max-w-6xl px-8 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
      </div>

      {/* Main content */}
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-8 py-6">
        <div className="flex w-full items-center gap-8 lg:gap-16">
          {/* LEFT: Hero content (hide on small screens) */}
          <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden min-h-[400px]">
            <div
              aria-hidden
              className="absolute inset-0 w-full h-full"
              style={{
                background:
                  "radial-gradient(80% 80% at 30% 50%, rgba(147,51,234,0.8) 0%, rgba(196,181,253,0.6) 30%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,1) 100%)",
                zIndex: 0,
              }}
            />
            <div className="p-8 lg:p-12 relative z-10">
              <div className="flex flex-col justify-center lg:justify-start space-y-4 sm:space-y-6 lg:space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-[0.95] text-slate-900">
                  Create Impactful Stories with Planoria Today
                  <span className="align-super">^</span>
                </h1>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex-1">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-2">
                <CardTitle className="text-center text-2xl md:text-3xl">
                  Welcome
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in with Google to access your account.
                  <div className="flex justify-center mt-4">
                    <div id="google-btn" className="flex justify-center" />
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Success Message */}
                {/* {successMessage && <SuccessMessage message={successMessage} />} */}

                {/* Error Display */}
                {errors.general && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                {googleLoading && (
                  <div className="mt-4 text-center text-sm text-slate-500">
                    Processing Google login...
                  </div>
                )}

                {/* Meta */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <Link
                    to="/forgot"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                  <Link
                    to="/register"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 cursor-pointer"
                  >
                    Create account
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-[10px] text-slate-400">
              © 2025 ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
