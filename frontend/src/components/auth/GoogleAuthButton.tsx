import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/errors';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!googleClientId) return;

    // Load Google Identity Services script if not already present
    if (!window.google && !document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.google) {
      setScriptLoaded(true);
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post('/auth/google', {
        idToken: response.credential,
      });
      login(res.data.accessToken, res.data.user);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleClick = async () => {
    // If real Google Client ID is configured and script is ready
    if (googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.prompt();
      } catch (e: any) {
        if (onError) onError(e.message || 'Google Auth failed');
      }
      return;
    }

    // Dev/Mock fallback mode if Client ID is not yet placed in .env
    try {
      setIsLoading(true);
      const devProfile = {
        googleId: 'google-test-user-12345',
        email: 'google.user@example.com',
        name: 'Google User',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      };

      const res = await apiClient.post('/auth/google', {
        userInfo: devProfile,
      });

      login(res.data.accessToken, res.data.user);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleCustomGoogleClick}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] border border-slate-700 text-slate-100 font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 text-sm min-h-[44px] cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>

      {!googleClientId && (
        <p className="text-[10px] text-slate-500 text-center mt-1">
          (Dev mode active: Click button to test instant Google sign-in)
        </p>
      )}
    </div>
  );
};
