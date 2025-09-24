"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import HoverButton from "@/components/HoverButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import FullPageLoader from '@/components/FullPageLoader';

const RegisterPage = memo(() => {
  const { register, googleLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Local UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Initialize AOS for this page matching the login page behavior
  useEffect(() => {
    AOS.init({ once: false, mirror: true, duration: 450, offset: 120 });
    AOS.refresh();
  }, []);

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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

      try {
        const result = await register(
          formData.username,
          formData.email,
          formData.password
        );
        if (result.success) {
          toast({
            title: "Success!",
            description: "Account created successfully. You can now sign in.",
            variant: "success",
          });
          // Delay navigation briefly so the user can see the success toast
          setTimeout(() => navigate("/login", { replace: true }), 700);
        } else {
          const msg = result.error || "Registration failed. Please try again.";
          setErrors({ general: msg });
          toast({
            title: "Registration Failed",
            description: msg,
            variant: "warning",
          });
        }
      } catch (error) {
        console.error("Registration error:", error);
        const msg = "An error occurred during registration. Please try again.";
        setErrors({ general: msg });
        toast({
          title: "Registration Error",
          description: msg,
          variant: "warning",
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, register, navigate, toast, validateForm]
  );

  // Google Sign-In handler (same as login page)
  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      setGoogleLoading(true);
      setErrors({});
      try {
        const result = await googleLogin(response.credential);
        if (result.success) {
          toast({
            title: "Success",
            description: "Registration successful via Google",
            variant: "success",
          });
          // Delay navigation briefly so the user can see the success toast
          setTimeout(() => navigate("/dashboard", { replace: true }), 700);
        } else {
          const msg = result.error || "Google authentication failed";
          setErrors({ general: msg });
          toast({
            title: "Authentication Failed",
            description: msg,
            variant: "warning",
          });
        }
      } catch (e) {
        console.error("Google Sign-In error", e);
        const msg = "Google authentication failed. Please try again.";
        setErrors({ general: msg });
        toast({
          title: "Authentication Error",
          description: msg,
          variant: "warning",
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, navigate, toast]
  );

  // Google Sign-In initialization (same as login page)
  useEffect(() => {
    const initialize = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          cancel_on_tap_outside: true,
          context: "signup",
        });
        const mountPoint = document.getElementById("google-btn-register");
        if (mountPoint && mountPoint.childElementCount === 0) {
          window.google.accounts.id.renderButton(mountPoint, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signup_with",
          });
        }
      } catch (err) {
        console.error("Google init failed", err);
        toast({
          title: "Init Error",
          description: "Failed to initialize Google Sign-In",
          variant: "warning",
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
            variant: "warning",
          });
      document.head.appendChild(script);
    } else {
      const t = setTimeout(initialize, 500);
      return () => clearTimeout(t);
    }
  }, [handleCredentialResponse, toast]);

  return (
    <div className="min-h-screen bg-white">
      {(loading || googleLoading) && <FullPageLoader text={loading ? 'Creating account…' : 'Processing…'} />}
      {/* Main content */}
      <div className="mx-auto flex min-h-[calc(100vh-64px)] items-center justify-center px-8 py-6">
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
                  <PointerHighlight>
                    Join Planoria and Start Creating
                    <span className="align-super">^</span>
                  </PointerHighlight>
                </h1>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex-1">
            <Card
              className="w-full max-w-md mx-auto"
              data-aos="zoom-in"
              data-aos-delay="80"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-center text-2xl md:text-3xl">
                  Create Account
                </CardTitle>
                <CardDescription className="text-center">
                  Sign up with Google or create an account with email.
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

                {/* Google Sign-Up */}
                <div className="mb-6">
                  <div className="flex justify-center">
                    <div
                      id="google-btn-register"
                      className="flex justify-center"
                    />
                  </div>
                  {googleLoading && (
                    <div
                      className="mt-2 text-center text-sm text-slate-500 flex items-center justify-center gap-2"
                      role="status"
                      aria-live="polite"
                    >
                      <LoadingSpinner
                        sizeVariant="sm"
                        speed="0.9s"
                        thickness={3}
                      />
                      <span>Processing Google signup...</span>
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

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`pl-10 ${
                          errors.username ? "border-red-500" : ""
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <HoverButton
                    type="submit"
                    className="w-full"
                    disabled={loading || googleLoading}
                    aria-busy={loading}
                    aria-disabled={loading || googleLoading}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner
                          sizeVariant="sm"
                          speed="0.9s"
                          thickness={3}
                        />
                        <span className="sr-only">Creating Account</span>
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </HoverButton>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    >
                      Sign in here
                    </Link>
                  </p>
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

RegisterPage.displayName = "RegisterPage";

export default RegisterPage;
