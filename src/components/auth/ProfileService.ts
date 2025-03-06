
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface ProfileCreationResult {
  success: boolean;
  error?: Error;
}

export const createUserProfile = async (session: Session): Promise<ProfileCreationResult> => {
  try {
    console.log("No profile found, creating one...");
    
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
      
    return { success: true };
  } catch (error: any) {
    console.error("Profile creation error:", error);
    return { 
      success: false, 
      error: new Error(`Failed to set up your account: ${error.message}`)
    };
  }
};

export const checkUserProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
    
  if (profileError && profileError.code !== 'PGRST116') {
    // This is a real error, not just "no rows returned"
    console.error("Error checking for profile:", profileError);
    throw new Error("Failed to check user profile");
  }
  
  return profile;
};
