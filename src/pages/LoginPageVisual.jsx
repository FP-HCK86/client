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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/hooks/use-toast";

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

  const { login, register, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
          toast({
            title: "Authentication Error",
            description: "Google authentication setup failed",
            variant: "destructive",
          });
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
          toast({
            title: "Loading Error",
            description: "Google authentication failed to load",
            variant: "destructive",
          });
        }
      }, 10000);

      script.onload = () => {
        clearTimeout(timeout);
        initializeGoogle();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        if (isMounted) {
          toast({
            title: "Script Error",
            description: "Failed to load Google authentication",
            variant: "destructive",
          });
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
            toast({
              title: "Success!",
              description: "Account created successfully!",
            });
            setIsLogin(true);
            setFormData({ username: "", email: "", password: "" });
          } else {
            toast({
              title: "Welcome back!",
              description: "Login successful!",
            });
            navigate("/dashboard", { replace: true });
          }
        } else {
          const errorMsg = result.error || "Authentication failed";
          setErrors({ general: errorMsg });
          toast({
            title: "Authentication Failed",
            description: errorMsg,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Form submission error:", error);
        const errorMsg =
          error.message || "Authentication failed. Please try again.";
        setErrors({ general: errorMsg });
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
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

      toast({
        title: "Authenticating...",
        description: "Authenticating with Google",
      });

      try {
        const result = await googleLogin(response.credential);

        if (result.success) {
          toast({
            title: "Success!",
            description: "Google authentication successful!",
          });
          navigate("/dashboard", { replace: true });
        } else {
          const errorMsg = result.error || "Google authentication failed";
          setErrors({ general: errorMsg });
          toast({
            title: "Authentication Failed",
            description: errorMsg,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Google login error:", error);
        const errorMsg = "Google authentication failed. Please try again.";
        setErrors({ general: errorMsg });
        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive",
        });
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
    toast({
      title: "Authentication Unavailable",
      description: errorMsg,
      variant: "destructive",
    });
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
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in with Google to access your account. Email/password
                  login coming soon!
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

                {/* OAuth */}
                <div className="flex justify-center mb-4">
                  <Button
                    variant="outline"
                    className="w-full max-w-xs cursor-pointer"
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
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
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

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled
                  >
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
