
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ErrorStatus, CreatingProfileStatus, LoadingStatus } from './AuthCallbackStatus';
import { createUserProfile, checkUserProfile } from './ProfileService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash or cookie
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          // Successful login
          console.log("Session found, checking for profile...");
          
          // Check if this user has a profile
          const profile = await checkUserProfile(session.user.id);
            
          // If no profile exists, we need to create one
          if (!profile) {
            setIsCreatingProfile(true);
            
            const result = await createUserProfile(session);
            if (!result.success) {
              throw result.error;
            }
          }
          
          toast.success("Successfully signed in!");
          navigate('/', { replace: true });
        } else {
          // No session found, check for auth code in URL
          await handleURLParams();
        }
      } catch (error: any) {
        console.error('Error during auth callback:', error);
        handleAuthError(error);
      } finally {
        setIsProcessing(false);
      }
    };

    const handleURLParams = async () => {
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
        
        // This will redirect the user back to this component with a session
        // The flow will then handle the profile creation in the section above
      } else {
        // Check for hash params from implicit OAuth flow
        if (window.location.hash) {
          await handleHashParams();
        } else {
          // No code, no hash, and no session, redirect to auth page
          console.log("No session or auth code found, redirecting to auth page");
          setError("Authentication failed. Please try again.");
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
        }
      }
    };

    const handleHashParams = async () => {
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
          
          // Session is now set, the next reload will catch it above
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
    };

    const handleAuthError = (error: any) => {
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
      } else if (error.message.includes("duplicate key")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("relation \"profiles\" does not exist")) {
        errorMessage = "Database setup issue. Please contact support.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 5000);
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
          <ErrorStatus error={error} />
        ) : isCreatingProfile ? (
          <CreatingProfileStatus />
        ) : (
          <LoadingStatus provider={provider} />
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
