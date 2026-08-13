import { createClient } from '@supabase/supabase-js'
import { authStorage } from './storage'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase =
  url && anonKey ? createClient(url, anonKey, { auth: { storage: authStorage } }) : null