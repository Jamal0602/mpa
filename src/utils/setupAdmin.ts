
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Creates an admin user with the specified credentials
 */
export const createAdminUser = async (email: string, password: string) => {
  try {
    // First, create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('User creation failed');
    }
    
    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the profile to set role as admin
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);
    
    if (profileError) throw profileError;
    
    toast.success(`Admin user ${email} created successfully`);
    return true;
  } catch (error: any) {
    console.error('Failed to create admin user:', error);
    toast.error(`Failed to create admin: ${error.message}`);
    return false;
  }
};

/**
 * Deletes all users from the system - USE WITH CAUTION
 */
export const deleteAllUsers = async () => {
  try {
    const { data, error } = await supabase.rpc('delete_all_users');
    
    if (error) throw error;
    
    toast.success('All users deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Failed to delete users:', error);
    toast.error(`Failed to delete users: ${error.message}`);
    return false;
  }
};
