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
    const handleLogout = async () => {
      try {
        setLoading(true);
        await logout();
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
          variant: "success",
        });
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Logout Failed",
          description: error?.message || "Logout failed. Please try again.",
          variant: "warning",
        });
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
