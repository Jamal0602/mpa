
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { checkUserProfile, createUserProfile, ensureProfileHasReferralAndMpaId } from '@/components/auth/ProfileService';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  key_points: number;
  role: string;
  theme_preference?: string;
  mpa_id?: string;
  referral_code?: string;
  referred_by?: string;
  country?: string;
  state?: string;
  district?: string;
  place?: string;
  display_name?: string;
  custom_email?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signUp: (credentials: { email: string; password: string; options?: any }) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  profile: null, 
  loading: true,
  refreshProfile: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  const fetchProfile = async (userId: string) => {
    try {
      // Updated to use MPA_profiles table
      const { data: profileData, error } = await supabase
        .from('MPA_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !profileData) {
        if (session) {
          console.log("No profile found, attempting to create one...");
          
          // Create a basic profile with default values
          const { data: newProfile, error: insertError } = await supabase
            .from('MPA_profiles')
            .insert([{ 
              id: userId,
              username: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url || null
            }])
            .select()
            .single();
            
          if (insertError || !newProfile) {
            console.error("Failed to create profile:", insertError);
            return null;
          }
          
          return newProfile as UserProfile;
        }
        return null;
      }
      
      // If user has a theme preference, apply it
      if (profileData?.theme_preference && profileData.theme_preference !== 'system') {
        setTheme(profileData.theme_preference);
      }
      
      // Ensure the profile has MPA ID and referral code
      if (profileData && profileData.username) {
        // Make sure referral code and MPA ID exist
        if (!profileData.referral_code || !profileData.mpa_id) {
          const referralCode = profileData.referral_code || 
            `MPA${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          const mpaId = profileData.mpa_id || 
            `MPA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            
          await supabase
            .from('MPA_profiles')
            .update({ 
              referral_code: referralCode,
              mpa_id: mpaId 
            })
            .eq('id', userId);
            
          profileData.referral_code = referralCode;
          profileData.mpa_id = mpaId;
        }
      }
      
      return profileData as UserProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Sign in with email and password
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async ({ email, password, options }: { email: string; password: string; options?: any }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: error as Error };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (error) {
      console.error("Google sign in error:", error);
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Set up auth state listener FIRST to prevent missed events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Use setTimeout to prevent potential deadlocks
              setTimeout(async () => {
                const profileData = await fetchProfile(session.user.id);
                if (profileData) {
                  setProfile(profileData);
                } else {
                  console.warn("Could not fetch or create user profile");
                }
              }, 0);
            } else {
              setProfile(null);
            }
            
            setLoading(false);
          }
        );
        
        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
          } else {
            console.warn("Could not fetch or create user profile on initial load");
          }
        }
        
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast.error("Error connecting to authentication service");
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      refreshProfile,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
