
import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          mpa_id: string;
          avatar_url: string;
          role: string;
          key_points: number;
          display_name: string;
          last_login: string;
          theme_preference: string;
          country: string;
          state: string;
          created_at: string;
          updated_at: string;
          full_name: string;
          place: string;
          district: string;
          custom_email: string;
          referral_code: string;
          referred_by: string;
        }
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          likes: number;
          comments: number;
          published: boolean;
        }
      };
      widgets: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          code: string;
          settings: any;
          created_by: string;
          created_at: string;
          updated_at: string;
        }
      };
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          position: string;
          email: string;
          resume_url: string;
          cover_letter: string;
          status: string;
          created_at: string;
          updated_at: string;
        }
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          user_id: string;
          category: string;
          file_url: string;
          file_type: string;
          file_path: string;
          status: string;
          type: string;
          created_at: string;
          updated_at: string;
        }
      };
      comments: {
        Row: {
          id: string;
          content: string;
          user_id: string;
          project_id: string;
          created_at: string;
          updated_at: string;
        }
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        }
      };
      error_reports: {
        Row: {
          id: string;
          error_type: string;
          title: string;
          description: string;
          status: string;
          created_at: string;
          contact_email: string;
          user_id: string;
          error_message: string;
          error_details: any;
          page_url: string;
          browser_info: string;
          steps_to_reproduce: string;
          priority: string;
          category: string;
        }
      };
      // Define all other tables needed for the application
    }
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://psbtwdcmcxatdpaiabtl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYnR3ZGNtY3hhdGRwYWlhYnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzEwNTksImV4cCI6MjA1OTE0NzA1OX0.TBV0Z36X80FJmJvfzla-e1HQ7aptWXqvaqEEfnMMeCg";

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
