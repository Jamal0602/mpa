
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not available');
    }

    // Initialize Supabase client with the service role key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { operation, email, password } = await req.json();

    switch (operation) {
      case 'create_admin': {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        // 1. Create the user in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) {
          throw authError;
        }

        if (!authData.user) {
          throw new Error('Failed to create user');
        }

        // 2. Update the profile to make the user an admin
        const { error: profileError } = await supabase
          .from('MPA_profiles')
          .update({ role: 'admin', key_points: 1000 })
          .eq('id', authData.user.id);

        if (profileError) {
          throw profileError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Admin user created successfully',
            user: authData.user,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      case 'delete_all_users': {
        // Call the public.delete_all_users() function
        const { data, error } = await supabase.rpc('delete_all_users');
        
        if (error) {
          throw error;
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'All users deleted successfully',
            result: data,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      default:
        throw new Error('Unknown operation');
    }
  } catch (error) {
    console.error('Error in admin-operations function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
