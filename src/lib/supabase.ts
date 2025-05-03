
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for RPC functions return values
export interface ErrorReportStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export interface ConstructionProgress {
  construction_mode: boolean;
  construction_progress: number;
}

// Types for services
export interface Service {
  id: string;
  name: string;
  description: string;
  price_in_points: number;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  active: boolean;
  featured: boolean;
  details: any;
  requirements: string[];
  estimated_delivery?: string;
}

// Types for service purchases
export interface ServicePurchase {
  id: string;
  service_id: string;
  user_id: string;
  points_spent: number;
  status: string; // pending, in_progress, completed, rejected
  project_details: any;
  created_at: string;
  updated_at: string;
}

export default supabase;
