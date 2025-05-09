
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface ProfileCreationResult {
  success: boolean;
  error?: Error;
  profile?: any;
}

// Helper function to generate a unique MPA ID
const generateMpaId = (username: string): string => {
  return username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@mpa';
};

// Helper function to generate a referral code
const generateReferralCode = (username: string): string => {
  const prefix = username.substring(0, 3).toUpperCase();
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${randomPart}`;
};

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
    
    // Generate unique MPA ID
    const mpaId = generateMpaId(username);
    
    // Generate unique referral code
    const referralCode = generateReferralCode(username);
    
    // Get user metadata
    const avatarUrl = session.user.user_metadata?.avatar_url || null;
    const fullName = session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.name || 
                   username;
    
    // Special case for admin user
    let role = 'user';
    let initialPoints = 10;
    
    if (session.user.email === 'ja.jamalasraf@example.com' || 
        session.user.email === 'ja.jamalasraf@gmail.com') {
      role = 'admin';
      initialPoints = 1000;
      console.log("Creating admin user account!");
    }
    
    // Insert the profile with default values
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        username: username,
        avatar_url: avatarUrl,
        full_name: fullName,
        key_points: initialPoints,
        role: role,
        theme_preference: 'system',
        referral_code: referralCode,
        mpa_id: mpaId,
        custom_email: session.user.email,
        display_name: fullName
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }
    
    try {
      // Create a welcome notification
      await supabase
        .from("notifications")
        .insert({
          user_id: session.user.id,
          title: "Welcome to MPA!",
          message: "Your account has been created successfully. Start exploring our services.",
          type: "success"
        });
    } catch (err) {
      console.error("Failed to create welcome notification:", err);
      // We don't want to fail the whole process just because of a notification error
    }
      
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

// Update an existing user profile
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

// Fix missing MPA ID and referral code for existing users
export const ensureProfileHasReferralAndMpaId = async (userId: string, username: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("referral_code, mpa_id")
      .eq("id", userId)
      .single();
      
    if (error) {
      console.error("Error checking profile:", error);
      return false;
    }
    
    // If profile is missing either referral code or MPA ID, update it
    if (!profile.referral_code || !profile.mpa_id) {
      const updates: Record<string, string> = {};
      
      if (!profile.referral_code) {
        updates.referral_code = generateReferralCode(username);
      }
      
      if (!profile.mpa_id) {
        updates.mpa_id = generateMpaId(username);
      }
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
        
      if (updateError) {
        console.error("Error updating profile:", updateError);
        return false;
      }
      
      return true;
    }
    
    return true; // Already has both fields
  } catch (error) {
    console.error("Error in ensureProfileHasReferralAndMpaId:", error);
    return false;
  }
};
