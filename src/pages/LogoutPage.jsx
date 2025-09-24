import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FullPageLoader from "@/components/FullPageLoader";

const LogoutPage = () => {
  const { logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const TOAST_KEY = "lastLogoutToastAt";
    const TOAST_TTL = 3000; // milliseconds

    const shouldShowToast = () => {
      try {
        const last = parseInt(sessionStorage.getItem(TOAST_KEY) || "0", 10);
        return Number.isNaN(last) ? true : Date.now() - last > TOAST_TTL;
      } catch (e) {
        return true;
      }
    };

    const markToastShown = () => {
      try {
        sessionStorage.setItem(TOAST_KEY, Date.now().toString());
      } catch (e) {
        // ignore
      }
    };

    const handleLogout = async () => {
      try {
        setLoading(true);
        await logout();
        if (shouldShowToast()) {
          toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
            variant: "success",
          });
          markToastShown();
        }
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
        if (shouldShowToast()) {
          toast({
            title: "Logout Failed",
            description: error?.message || "Logout failed. Please try again.",
            variant: "warning",
          });
          markToastShown();
        }
        // Still redirect to login even if logout fails
        navigate("/login", { replace: true });
      }
    };

    // Only logout if user is authenticated
    if (isAuthenticated) {
      handleLogout();
    } else {
      // If not authenticated, just redirect to login
      navigate("/login", { replace: true });
    }
  }, [logout, navigate, isAuthenticated]);

  if (loading) return <FullPageLoader text="Logging out..." />;

  return null;
};

export default LogoutPage;
