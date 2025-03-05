
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // This is a real error, not just "no rows returned"
            console.error("Error checking for profile:", profileError);
            throw new Error("Failed to check user profile");
          }
          
          // If no profile exists, we need to create one
          if (!profile) {
            console.log("No profile found, creating one...");
            setIsCreatingProfile(true);
            
            try {
              // Create the basic profile for the user
              const username = session.user.email?.split('@')[0] || `user_${Date.now()}`;
              const mpaId = username.toLowerCase() + '@mpa';
              
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: session.user.id,
                  username: username,
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                  mpa_id: mpaId,
                  key_points: 10,
                  role: 'user'
                });
              
              if (insertError) {
                console.error("Error creating profile:", insertError);
                throw new Error(`Failed to create profile: ${insertError.message}`);
              }
              
              toast.success("Your account has been created successfully!");
              
              // Create a welcome notification
              await supabase
                .from("notifications")
                .insert({
                  user_id: session.user.id,
                  title: "Welcome to MPA!",
                  message: "Your account has been created successfully. Start exploring our services.",
                  type: "success"
                });
            } catch (error: any) {
              console.error("Profile creation error:", error);
              throw new Error(`Failed to set up your account: ${error.message}`);
            } finally {
              setIsCreatingProfile(false);
            }
          }
          
          toast.success("Successfully signed in!");
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
            
            // This will redirect the user back to this component with a session
            // The flow will then handle the profile creation in the section above
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
      } finally {
        setIsProcessing(false);
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
        ) : isCreatingProfile ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
              <CheckCircle className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Setting up your account...</h2>
            <p className="text-muted-foreground">
              We're creating your profile. This will only take a moment.
            </p>
            <div className="flex justify-center mt-4">
              <div className="h-2 w-40 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse"></div>
              </div>
            </div>
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
