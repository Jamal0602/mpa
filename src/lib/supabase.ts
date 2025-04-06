
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Add better error handling and debugging for Supabase
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    storageKey: 'mpa-auth',
    debug: false, // Set to true to enable debugging
  },
  global: {
    headers: {
      'x-application-name': 'MPA Web App',
      'x-client-version': '1.0.0',
    },
  },
  realtime: {
    timeout: 60000, // Timeout for realtime connections (60s)
  },
  db: {
    schema: 'public', // Default schema to use
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Add types for RPC functions return values
export interface ErrorReportStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

// Logger function for consistent supabase logging
export const supabaseLogger = {
  log: (message: string, data?: any) => {
    console.log(`[Supabase] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[Supabase Error] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[Supabase Warning] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    console.info(`[Supabase Info] ${message}`, data || '');
  },
};

// Helper for error handling
export const handleSupabaseError = (error: any, fallbackMessage: string = 'An error occurred') => {
  const errorMessage = error?.message || fallbackMessage;
  supabaseLogger.error(errorMessage, error);
  return errorMessage;
};

export default supabase;
