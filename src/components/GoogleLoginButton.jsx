import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconBrandGoogle } from '@tabler/icons-react';

const GoogleLoginButton = ({ onSuccess, onError, disabled = false }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google OAuth script
    const loadGoogleScript = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
        setIsGoogleLoaded(false);
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup', // Use popup mode
            context: 'signin',
          });
          setIsGoogleLoaded(true);
        } catch (error) {
          console.error('Failed to initialize Google Sign-In:', error);
          setIsGoogleLoaded(false);
        }
      }
    };

    const handleCredentialResponse = (response) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError('Google authentication failed');
      }
    };

    loadGoogleScript();
  }, [onSuccess, onError]);

  const handleGoogleLogin = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      onError('Google Client ID not configured');
      return;
    }

    if (window.google && isGoogleLoaded) {
      try {
        // Use the more reliable renderButton approach with popup
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'none';
        document.body.appendChild(buttonContainer);

        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          width: 400,
          click_listener: () => {
            // This will trigger the popup
            window.google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback to traditional OAuth flow
                initiateOAuthFlow();
              }
            });
          }
        });

        // Programmatically click the hidden button
        const googleButton = buttonContainer.querySelector('div[role="button"]');
        if (googleButton) {
          googleButton.click();
        } else {
          // Fallback if button rendering fails
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              initiateOAuthFlow();
            }
          });
        }

        // Clean up
        setTimeout(() => {
          if (buttonContainer && buttonContainer.parentNode) {
            buttonContainer.parentNode.removeChild(buttonContainer);
          }
        }, 1000);

      } catch (error) {
        console.error('Google Sign-In error:', error);
        initiateOAuthFlow(); // Fallback to OAuth flow
      }
    } else {
      onError('Google authentication not loaded');
    }
  };

  // Fallback OAuth flow
  const initiateOAuthFlow = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = 'email profile';
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=select_account`;

    // Open popup window
    const popup = window.open(
      authUrl,
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for popup to close
    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosed);
        onError('Google authentication was cancelled');
      }
    }, 1000);
  };

  // Test mode button for development
  const handleTestGoogleLogin = () => {
    // Use the test mode that's configured in your backend
    onSuccess('test_credential');
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
        onClick={handleGoogleLogin}
        disabled={disabled || !isGoogleLoaded}
      >
        <IconBrandGoogle className="mr-3 h-5 w-5" />
        Continue with Google
      </Button>
      
      {/* Test mode button for development */}
      {import.meta.env.DEV && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 text-sm text-blue-600 border-blue-300 hover:bg-blue-50"
          onClick={handleTestGoogleLogin}
          disabled={disabled}
        >
          🧪 Test Google Login (Dev Mode)
        </Button>
      )}
    </div>
  );
};

export default GoogleLoginButton;