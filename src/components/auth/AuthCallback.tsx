
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingPage } from '@/components/ui/loading';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash or cookie
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          // Successful login
          console.log("Session found, redirecting to home page");
          navigate('/', { replace: true });
        } else {
          // No session found, check for auth code in URL
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          
          if (code) {
            // Exchange code for session
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            navigate('/', { replace: true });
          } else {
            // No code and no session, redirect to auth page
            console.log("No session or auth code found, redirecting to auth page");
            setError("Authentication failed. Please try again.");
            setTimeout(() => {
              navigate('/auth', { replace: true });
            }, 3000);
          }
        }
      } catch (error: any) {
        console.error('Error during auth callback:', error);
        setError(`Authentication error: ${error.message}`);
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-destructive">
            <h2 className="text-2xl font-semibold mb-2">Authentication Error</h2>
            <p>{error}</p>
            <p className="mt-4 text-muted-foreground">Redirecting you back to login...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2">Completing sign in...</h2>
            <p className="text-muted-foreground">Please wait while we redirect you.</p>
            <LoadingPage />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
