
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yblcuyelcpgqlaxqlwnl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibGN1eWVsY3BncWxheHFsd25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDI3MjcsImV4cCI6MjA1NTk3ODcyN30.wH54y3saOsBNldjg4xTmFsmtW6s7WN1q4CmoBgAb0I0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
