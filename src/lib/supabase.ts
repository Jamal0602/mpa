
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yblcuyelcpgqlaxqlwnl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibGN1eWVsY3BncWxheHFsd25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDI3MjcsImV4cCI6MjA1NTk3ODcyN30.wH54y3saOsBNldjg4xTmFsmtW6s7WN1q4CmoBgAb0I0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mpa-auth',
    debug: false // Disable debug logs to improve performance
  }
});

// Create admin user function - can be called from the console for testing
export const createAdminUser = async (email: string, password: string) => {
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (authData?.user) {
      // 2. Update profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
      
      if (profileError) throw profileError;
      
      console.log('Admin user created successfully:', email);
      return { success: true, user: authData.user };
    }
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return { success: false, error };
  }
};

// Delete all users function - USE WITH CAUTION
export const deleteAllUsers = async () => {
  try {
    // This is a dangerous operation and should only be used in development
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) throw fetchError;
    
    const deletionPromises = users.users.map(user => 
      supabase.auth.admin.deleteUser(user.id)
    );
    
    await Promise.all(deletionPromises);
    console.log('All users deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete users:', error);
    return { success: false, error };
  }
};

// To use these functions from the console:
// 1. First delete all users: await window.deleteAllUsers()
// 2. Then create admin user: await window.createAdminUser('ja.jamalasraf', 'Ja.0602@')

// Expose functions globally for console access
if (typeof window !== 'undefined') {
  (window as any).createAdminUser = createAdminUser;
  (window as any).deleteAllUsers = deleteAllUsers;
}
