
import { supabase } from '@/integrations/supabase/client';
import { generateReferralCode, generateMpaId } from '@/utils/idGenerators';
import { toast } from 'sonner';

// Check if users need migration (missing MPA ID or referral code)
export const checkForMigrationNeeds = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .or('referral_code.is.null,mpa_id.is.null')
      .limit(1);
      
    if (error) {
      console.error("Error checking migration needs:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error in checkForMigrationNeeds:", error);
    return false;
  }
};

// Migrate a specific user
export const migrateUser = async (userId: string, username: string): Promise<boolean> => {
  try {
    const updates: Record<string, string> = {};
    
    // Get current profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('referral_code, mpa_id, username')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error getting user profile:", error);
      return false;
    }
    
    // Set username if needed
    const effectiveUsername = username || profile.username || `user_${Date.now()}`;
    
    // Update missing fields
    if (!profile.mpa_id) {
      updates.mpa_id = generateMpaId(effectiveUsername);
    }
    
    if (!profile.referral_code) {
      updates.referral_code = generateReferralCode(effectiveUsername);
    }
    
    if (Object.keys(updates).length === 0) {
      // Nothing to update
      return true;
    }
    
    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in migrateUser:", error);
    return false;
  }
};

// Migrate all users
export const migrateAllUsers = async (): Promise<number> => {
  try {
    // Get all users needing migration
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .or('referral_code.is.null,mpa_id.is.null')
      .limit(100); // Process in batches
      
    if (error) {
      console.error("Error getting users for migration:", error);
      return 0;
    }
    
    if (!data || data.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    
    // Migrate each user
    for (const user of data) {
      const success = await migrateUser(user.id, user.username);
      if (success) {
        successCount++;
      }
    }
    
    return successCount;
  } catch (error) {
    console.error("Error in migrateAllUsers:", error);
    return 0;
  }
};
