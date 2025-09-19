"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Chrome,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import toast, { Toaster } from "react-hot-toast";

// Environment variables for production
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "411452003367-vi21idqns4uhui7esotdheodqeqhpk6q.apps.googleusercontent.com";

// Production-ready validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 20;
};

// Loading Component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
));

// Success Component
const SuccessMessage = memo(({ message }) => (
  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
    <CheckCircle2 className="h-5 w-5" />
    <span className="text-sm">{message}</span>
  </div>
));

const LoginPage = memo(() => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { login, register, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Memoized validation
  const validationErrors = useMemo(() => {
    const newErrors = {};

    if (!isLogin && formData.username && !validateUsername(formData.username)) {
      newErrors.username = "Username must be 3-20 characters long";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    return newErrors;
  }, [formData, isLogin]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Initialize Google OAuth with error handling
  useEffect(() => {
    let isMounted = true;

    const initializeGoogle = () => {
      if (!isMounted) return;

      try {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSuccess,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: "signin",
            ux_mode: "popup",
            error_callback: handleGoogleError,
          });
        }
      } catch (error) {
        console.error("Google OAuth initialization failed:", error);
        if (isMounted) {
          toast.error("Google authentication setup failed", { icon: "🔒" });
        }
      }
    };

    // Load Google script with timeout
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      const timeout = setTimeout(() => {
        if (isMounted) {
          toast.error("Google authentication failed to load", { icon: "⏰" });
        }
      }, 10000);

      script.onload = () => {
        clearTimeout(timeout);
        initializeGoogle();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        if (isMounted) {
          toast.error("Failed to load Google authentication", { icon: "❌" });
        }
      };

      document.head.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      isMounted = false;
    };
  }, []);

  // Form submission with enhanced error handling
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Client-side validation
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});
      setLoading(true);
      setSuccessMessage("");

      try {
        let result;
        if (isLogin) {
          result = await login(formData.email, formData.password);
        } else {
          result = await register(
            formData.username,
            formData.email,
            formData.password
          );
        }

        if (result.success) {
          if (!isLogin) {
            setSuccessMessage("Account created successfully!");
            toast.success("Account created successfully! ✨", {
              icon: "🎉",
              style: {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            });
            setIsLogin(true);
            setFormData({ username: "", email: "", password: "" });
          } else {
            toast.success("Welcome back! 🚀", {
              icon: "👋",
              style: {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            });
            navigate("/dashboard", { replace: true });
          }
        } else {
          const errorMsg = result.error || "Authentication failed";
          setErrors({ general: errorMsg });
          toast.error(errorMsg, { icon: "⚠️" });
        }
      } catch (error) {
        console.error("Form submission error:", error);
        const errorMsg =
          error.message || "Authentication failed. Please try again.";
        setErrors({ general: errorMsg });
        toast.error(errorMsg, { icon: "⚠️" });
      } finally {
        setLoading(false);
      }
    },
    [formData, isLogin, login, register, navigate, validationErrors]
  );

  // Google OAuth success handler
  const handleGoogleSuccess = useCallback(
    async (response) => {
      if (!response || !response.credential) {
        handleGoogleError(new Error("Invalid Google response"));
        return;
      }

      setErrors({});
      setGoogleLoading(true);

      const loadingToast = toast.loading("Authenticating with Google... ✨", {
        icon: "🔐",
        style: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#ffffff",
        },
      });

      try {
        const result = await googleLogin(response.credential);
        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success("Google authentication successful! 🎉", {
            icon: "✨",
            style: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            },
          });
          navigate("/dashboard", { replace: true });
        } else {
          const errorMsg = result.error || "Google authentication failed";
          setErrors({ general: errorMsg });
          toast.error(errorMsg, { icon: "❌" });
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error("Google login error:", error);
        const errorMsg = "Google authentication failed. Please try again.";
        setErrors({ general: errorMsg });
        toast.error(errorMsg, { icon: "🚫" });
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, navigate]
  );

  // Google OAuth error handler
  const handleGoogleError = useCallback((error) => {
    console.error("Google OAuth error:", error);
    const errorMsg = "Google authentication unavailable. Please try again.";
    setErrors({ general: errorMsg });
    toast.error(errorMsg, { icon: "🔒" });
    setGoogleLoading(false);
  }, []);

  // Input change handler with validation
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear field-specific errors on change
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }

      // Clear general error
      if (errors.general) {
        setErrors((prev) => ({
          ...prev,
          general: undefined,
        }));
      }
    },
    [errors]
  );

  // Google sign-in handler
  const handleGoogleSignIn = useCallback(() => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        handleGoogleError(error);
      }
    } else {
      handleGoogleError(new Error("Google OAuth not initialized"));
    }
  }, [handleGoogleError]);

  // Toggle between login/register
  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setErrors({});
    setSuccessMessage("");
    setFormData({ username: "", email: "", password: "" });
  }, []);

  // Password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar (Back / Sign up) */}
      <div className="mx-auto max-w-6xl px-8 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Back to home"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
      </div>

      {/* Main content */}
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-8 py-6">
        <div className="flex w-full items-center gap-8 lg:gap-16">
          {/* LEFT: Hero image (hide on small screens) */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-black/5 shadow-2xl">
              <img
                src="/login-image.webp"
                alt="Planoria preview"
                className="h-[520px] w-[380px] md:h-[560px] md:w-[420px] lg:h-[600px] lg:w-[450px] object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex-1">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-2">
                <CardTitle className="text-center text-2xl md:text-3xl">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in with Google to access your account. Email/password
                  login coming soon!
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Success Message */}
                {successMessage && <SuccessMessage message={successMessage} />}

                {/* Error Display */}
                {errors.general && (
                  <div
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
                    role="alert"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  </div>
                )}

                {/* OAuth */}
                <div className="flex justify-center mb-4">
                  <Button
                    variant="outline"
                    className="w-full max-w-xs"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    aria-label="Sign in with Google"
                  >
                    {googleLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <Chrome className="mr-2 h-4 w-4" />
                    )}
                    {googleLoading
                      ? "Authenticating..."
                      : "Sign in with Google"}
                  </Button>
                </div>

                <div className="my-4 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-slate-500">or</span>
                  <Separator className="flex-1" />
                </div>

                {/* Email / Password Form - Disabled since backend doesn't support it */}
                <div className="space-y-4 opacity-50 pointer-events-none">
                  {!isLogin && (
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username (Coming Soon)</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (Coming Soon)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password (Coming Soon)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        disabled
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled>
                    {isLogin
                      ? "Sign In (Coming Soon)"
                      : "Create Account (Coming Soon)"}
                  </Button>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-600 text-center">
                    🔧 Email/password authentication is coming soon! For now,
                    please use Google sign-in above.
                  </p>
                </div>

                {/* Toggle between login/register - Disabled since backend doesn't support registration */}
                <div className="mt-4 text-center opacity-50">
                  <span className="text-sm text-slate-500">
                    Registration coming soon! Use Google sign-in for now.
                  </span>
                </div>

                {/* Meta */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <Link
                    to="/forgot"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  >
                    Forgot password?
                  </Link>
                  <Link
                    to="/register"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </div>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
