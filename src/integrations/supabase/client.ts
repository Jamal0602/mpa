
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://psbtwdcmcxatdpaiabtl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYnR3ZGNtY3hhdGRwYWlhYnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzEwNTksImV4cCI6MjA1OTE0NzA1OX0.TBV0Z36X80FJmJvfzla-e1HQ7aptWXqvaqEEfnMMeCg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mpa-auth',
    debug: false, // Disable debug logs to improve performance
    flowType: 'implicit' // Set to implicit for browser-based auth
  },
  global: {
    headers: {
      'x-application-name': 'MPA Web App'
    }
  }
});
