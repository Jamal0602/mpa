
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface ProfileCreationResult {
  success: boolean;
  error?: Error;
  profile?: any;
}

export const createUserProfile = async (session: Session): Promise<ProfileCreationResult> => {
  try {
    console.log("No profile found, creating one...");
    
    // Extract username and format it properly
    let username = '';
    if (session.user.email) {
      username = session.user.email.split('@')[0] || `user_${Date.now()}`;
    } else {
      username = `user_${Date.now()}`;
    }
    
    // Create a unique MPA ID
    const mpaId = username.toLowerCase() + '@mpa';
    
    // Get user metadata
    const avatarUrl = session.user.user_metadata?.avatar_url || null;
    const fullName = session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name || 
                     username;
    
    // Insert the profile with default values
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        username: username,
        avatar_url: avatarUrl,
        full_name: fullName,
        mpa_id: mpaId,
        key_points: 10, // Starting points
        role: 'user',
        theme_preference: 'system',
        country: '',
        state: '',
        district: '',
        place: ''
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }
    
    // Create a welcome notification
    await supabase
      .from("notifications")
      .insert({
        user_id: session.user.id,
        title: "Welcome to MPA!",
        message: "Your account has been created successfully. Start exploring our services.",
        type: "success"
      });
      
    toast.success("Your account has been created successfully!");
    
    return { success: true, profile };
  } catch (error: any) {
    console.error("Profile creation error:", error);
    return { 
      success: false, 
      error: new Error(`Failed to set up your account: ${error.message}`)
    };
  }
};

export const checkUserProfile = async (userId: string) => {
  if (!userId) {
    console.error("No user ID provided to checkUserProfile");
    return null;
  }
  
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking for profile:", error);
      throw error;
    }
    
    return profile;
  } catch (error) {
    console.error("Error in checkUserProfile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: any): Promise<ProfileCreationResult> => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { success: true, profile };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: new Error(`Failed to update profile: ${error.message}`)
    };
  }
};
