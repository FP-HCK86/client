import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const LogoutPage = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Show loading toast
        const loadingToast = toast.loading('Logging out...', {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
          },
        });

        // Perform logout
        await logout();

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success message
        toast.success('Logged out successfully!', {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
        });

        // Redirect to login page
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed. Please try again.', {
        });
        // Still redirect to login even if logout fails
        navigate('/login', { replace: true });
      }
    };

    // Only logout if user is authenticated
    if (isAuthenticated) {
      handleLogout();
    } else {
      // If not authenticated, just redirect to login
      navigate('/login', { replace: true });
    }
  }, [logout, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Logging out...
        </h2>
        <p className="text-gray-600">
          Please wait while we securely log you out.
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;