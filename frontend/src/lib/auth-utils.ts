import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export async function getUserSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function requireSuperadmin() {
  const { user } = await getUserSession()

  if (!user || user.app_metadata?.is_superadmin !== true) {
    redirect('/dashboard')
  }

  return user
}

export async function requireAuth() {
  const { user } = await getUserSession()

  if (!user) {
    redirect('/login')
  }

  return user
}
