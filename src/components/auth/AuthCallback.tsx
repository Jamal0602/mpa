
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash or cookie
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          // Successful login
          console.log("Session found, redirecting to home page");
          toast.success("Successfully signed in!");
          
          // Check if this is a new user
          const { data: profile } = await supabase
            .from("profiles")
            .select("created_at")
            .eq("id", session.user.id)
            .single();
            
          // If this profile was just created (within the last minute)
          const isNewUser = profile && 
            (new Date().getTime() - new Date(profile.created_at).getTime()) < 60000;
            
          if (isNewUser) {
            toast.success("Welcome to MPA! Your account has been created.");
          }
          
          navigate('/', { replace: true });
        } else {
          // No session found, check for auth code in URL
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          const error = params.get('error');
          const errorDescription = params.get('error_description');
          const providerParam = params.get('provider');
          
          if (providerParam) {
            setProvider(providerParam);
          }
          
          if (error) {
            // Handle OAuth error
            throw new Error(`${error}: ${errorDescription || 'Authentication failed'}`);
          } else if (code) {
            // Exchange code for session
            console.log("Found auth code, exchanging for session...");
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            
            toast.success("Successfully signed in!");
            navigate('/', { replace: true });
          } else {
            // Check for hash params from implicit OAuth flow
            if (window.location.hash) {
              // Handle hash response for token-based flow
              const hashParams = new URLSearchParams(window.location.hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              const expiresIn = hashParams.get('expires_in');
              const tokenType = hashParams.get('token_type');
              
              if (accessToken) {
                console.log("Found access token in URL hash");
                
                if (refreshToken && expiresIn && tokenType) {
                  // We have all the tokens needed for setSession
                  const { error: setSessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                  });
                  
                  if (setSessionError) throw setSessionError;
                  
                  toast.success("Successfully authenticated!");
                  navigate('/', { replace: true });
                } else {
                  // We just have an access token, but that's enough to notify the user
                  toast.success("Successfully authenticated!");
                  navigate('/', { replace: true });
                }
              } else {
                throw new Error("No authentication token found in URL");
              }
            } else {
              // No code, no hash, and no session, redirect to auth page
              console.log("No session or auth code found, redirecting to auth page");
              setError("Authentication failed. Please try again.");
              setTimeout(() => {
                navigate('/auth', { replace: true });
              }, 3000);
            }
          }
        }
      } catch (error: any) {
        console.error('Error during auth callback:', error);
        let errorMessage = `Authentication error: ${error.message}`;
        
        // Handle common OAuth errors with more user-friendly messages
        if (error.message.includes("popup_closed_by_user") || error.message.includes("popup closed")) {
          errorMessage = "Authentication cancelled. You closed the login window.";
        } else if (error.message.includes("network") || error.message.includes("connection")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Authentication timed out. Please try again.";
        } else if (error.message.includes("invalid_grant")) {
          errorMessage = "Invalid login credentials. Please try again.";
        } else if (error.message.includes("not a valid UUID")) {
          errorMessage = "Invalid authentication token. Please try signing in again.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 5000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/80">
      <motion.div 
        className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {error ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-destructive">Authentication Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">Redirecting you back to login...</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/auth')}
            >
              Return to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary animate-pulse"></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Completing sign in...</h2>
            <p className="text-muted-foreground">
              {provider 
                ? `Authenticating with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...` 
                : "Please wait while we redirect you."}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
