import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { exchangeCodeForTokens } from '../utils/auth';

/**
 * Hook to handle OAuth callback
 * Checks for ?code= in URL and exchanges for tokens
 */
export function useAuthCallback() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      setLoading(true);

      // Clean URL (remove ?code=xxx)
      window.history.replaceState({}, '', window.location.pathname);

      // Exchange code for tokens
      exchangeCodeForTokens(code)
        .then(setTokens)
        .catch((error) => {
          console.error('Auth callback error:', error);
          setLoading(false);
        });
    }
  }, [setTokens, setLoading]);
}
