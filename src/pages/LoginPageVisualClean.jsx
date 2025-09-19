import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPageVisual() {
  const { googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Local UI state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credential) => {
    setError("");
    setGoogleLoading(true);
    
    const loadingToast = toast.loading('Authenticating with Google... ✨', {
      icon: '🔐',
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
      },
    });
    
    try {
      const result = await googleLogin(credential);
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('Google authentication successful! 🎉', {
          icon: '✨',
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
        });
        navigate("/dashboard", { replace: true });
      } else {
        const errorMsg = result.error || "Google authentication failed";
        setError(errorMsg);
        toast.error(errorMsg, { icon: "❌" });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Google login error:", error);
      const errorMsg = "Google authentication failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, { icon: "🚫" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google OAuth error:", error);
    const errorMsg = "Google authentication unavailable. Please try again.";
    setError(errorMsg);
    toast.error(errorMsg, { icon: "🔒" });
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '14px',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.4), 0 10px 10px -5px rgba(102, 126, 234, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            maxWidth: '400px',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.4), 0 10px 10px -5px rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: 'rgba(102, 126, 234, 0.1)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(255, 107, 107, 0.4), 0 10px 10px -5px rgba(255, 107, 107, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: 'rgba(255, 107, 107, 0.1)',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.4), 0 10px 10px -5px rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: 'rgba(102, 126, 234, 0.1)',
            },
          },
        }}
        containerStyle={{
          top: '24px',
          right: '24px',
        }}
      />
      
      {/* Top bar (Back / Sign up) */}
      <div className="mx-auto max-w-6xl px-8 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
          aria-label="Back to home"
        >
          <IconArrowLeft className="mr-1 h-4 w-4" />
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
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                    <IconAlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}

                {/* Google Login Button */}
                <div className="flex justify-center mb-4">
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={googleLoading}
                  />
                </div>

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
}