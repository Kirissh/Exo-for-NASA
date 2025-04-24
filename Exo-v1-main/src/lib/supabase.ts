
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with actual project values
const supabaseUrl = 'https://lrnoslynzrjroawoifyw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxybm9zbHluenJqcm9hd29pZnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODg3MzcsImV4cCI6MjA1OTg2NDczN30.CYivwK5KhM_fUkros2DtLaqfAQUPbcTgj-rDYgIid7s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Since we've hardcoded the correct values above
};
