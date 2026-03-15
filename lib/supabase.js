import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Create a Supabase client for server-side requests.
 * If an auth token is provided, it will be used for the request.
 */
export function createSupabaseClient(authToken) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_')) return null

  // When running on the server, we do not want Supabase to persist session data.
  // We can use `accessToken` to make requests on behalf of a user.
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    accessToken: authToken ? async () => authToken : undefined,
  }

  return createClient(supabaseUrl, supabaseAnonKey, options)
}
