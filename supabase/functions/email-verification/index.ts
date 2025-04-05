
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
const baseUrl = 'https://mpa.cubiz.space';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, email, signUpToken } = await req.json();

    // Check which type of email to send
    if (type === 'verification') {
      // Create a verification URL 
      const verificationUrl = `${baseUrl}/auth/callback#access_token=${signUpToken}`;
      
      const emailResult = await resend.emails.send({
        from: 'MPA <no-reply@mpa.cubiz.space>',
        to: [email],
        subject: 'Verify your email for MPA',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Verify your MPA account</h1>
            <p>Thank you for signing up! Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Verify Email Address
            </a>
            <p>Or copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #6B7280; font-size: 14px;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, you can safely ignore this email.</p>
            <p style="margin-top: 32px; color: #6B7280; font-size: 14px;">
              &copy; ${new Date().getFullYear()} Multi Project Association. All rights reserved.
            </p>
          </div>
        `,
      });
      
      return new Response(JSON.stringify({ success: true, data: emailResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (type === 'password-reset') {
      // Generate a password reset token
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${baseUrl}/auth/reset-callback`,
        }
      });
      
      if (error) throw error;
      
      const resetUrl = data.properties.action_link;
      
      const emailResult = await resend.emails.send({
        from: 'MPA <no-reply@mpa.cubiz.space>',
        to: [email],
        subject: 'Reset your MPA password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to choose a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #6B7280; font-size: 14px;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p style="margin-top: 32px; color: #6B7280; font-size: 14px;">
              &copy; ${new Date().getFullYear()} Multi Project Association. All rights reserved.
            </p>
          </div>
        `,
      });
      
      return new Response(JSON.stringify({ success: true, data: emailResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid email type' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (error) {
    console.error('Error in email-verification function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
