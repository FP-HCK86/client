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
import { Button } from "@/components/ui/button";
import HoverButton from "@/components/ui/HoverButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/hooks/use-toast";

const LoginPage = memo(() => {
  const { login, googleLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Local UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Handle form input changes
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear specific field error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({});

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setLoading(true);
      toast({
        title: "Signing In...",
        description: "Please wait while we sign you in",
      });

      try {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast({
            title: "Success!",
            description: "Signed in successfully",
            variant: "purple",
            className:
              "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
          });
          navigate("/dashboard", { replace: true });
        } else {
          const msg =
            result.error || "Login failed. Please check your credentials.";
          setErrors({ general: msg });
          toast({
            title: "Login Failed",
            description: msg,
            variant: "destructive",
            className:
              "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        const msg = "An error occurred during login. Please try again.";
        setErrors({ general: msg });
        toast({
          title: "Login Error",
          description: msg,
          variant: "destructive",
          className:
            "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, login, navigate, toast, validateForm]
  );

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
          toast({
            title: "Success",
            description: "Login successful",
            variant: "purple",
            className:
              "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-300 border-purple-300 text-white",
          });
          navigate("/dashboard", { replace: true });
        } else {
          const msg = result.error || "Google authentication failed";
          setErrors({ general: msg });
          toast({
            title: "Authentication Failed",
            description: msg,
            variant: "destructive",
            className:
              "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
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
          className:
            "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
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
          className:
            "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
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
          className:
            "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
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
      <div className="mx-auto px-8 pt-6 flex items-center justify-between">
        {/* <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link> */}
      </div>

      {/* Main content */}
      <div
        className="mx-auto flex items-center justify-center px-8 py-6 min-h-screen"
        style={{
          background:
            "radial-gradient(80% 80% at 30% 50%, rgba(147,51,234,0.8) 0%, rgba(196,181,253,0.6) 30%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,1) 100%)",
          zIndex: 0,
        }}
      >
        <div className="flex w-full items-center gap-8 lg:gap-16">
          {/* LEFT: Hero content (hide on small screens) */}
          <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 w-full h-full" />
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
                {/* Error Display */}
                {errors.general && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign-In */}
                <div className="mb-6">
                  <div className="flex justify-center">
                    <div id="google-btn" className="flex justify-center" />
                  </div>
                  {googleLoading && (
                    <div className="mt-2 text-center text-sm text-slate-500">
                      Processing Google login...
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Submit Button (HoverButton) */}
                  <HoverButton
                    type="submit"
                    className="w-full"
                    disabled={loading || googleLoading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </HoverButton>
                </form>

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
