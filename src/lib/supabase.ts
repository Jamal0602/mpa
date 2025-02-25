
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yblcuyelcpgqlaxqlwnl.supabase.co';
const supabaseAnonKey = 'vwb9oZRp4KpSje4TAOaAkTkOt1dC425IQTwszIpHyFtMDVoEBmYp';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
