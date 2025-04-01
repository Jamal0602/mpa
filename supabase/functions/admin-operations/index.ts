
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { operation, email, password } = await req.json();

    // Process different operations
    if (operation === "create_admin") {
      // Create user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (userError) throw userError;

      // Update profile to admin role
      if (userData.user) {
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", userData.user.id);

        if (profileError) throw profileError;
      }

      return new Response(
        JSON.stringify({ success: true, message: "Admin user created successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (operation === "delete_all_users") {
      // Get all users
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersError) throw usersError;
      
      // Delete each user
      for (const user of usersData.users) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "All users deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else {
      throw new Error("Invalid operation");
    }
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
