import { AuthClient } from "@supabase/supabase-js"
import { supabaseAnonKey, supabaseUrl } from "~/shared/supabase/config"

export function createAdminAuth() {
  return new AuthClient({
    url: new URL("/auth/v1", supabaseUrl).href,
    headers: { apikey: supabaseAnonKey },
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  })
}
