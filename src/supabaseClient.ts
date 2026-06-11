import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export function getSupabaseClient(url: string, key: string) {
  if (!url || !key) return null;
  
  // Re-create client only if URL or Key changed
  if (!supabaseInstance || supabaseInstance.supabaseUrl !== url) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
    supabaseInstance.supabaseUrl = url;
  }
  return supabaseInstance;
}
