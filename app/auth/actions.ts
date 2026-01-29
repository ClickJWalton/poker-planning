"use server"

import { createClient } from "@/lib/supabase/server"

type AuthResult = {
  error?: string
  success?: boolean
}

export async function signUp(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const displayName = formData.get("displayName") as string

  if (!email || !password || !displayName) {
    return { error: "All fields are required" }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || undefined,
        data: {
          display_name: displayName,
          is_admin: false,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Sign up error:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signIn(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Sign in error:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch (err) {
    console.error("Sign out error:", err)
    return { error: "Failed to sign out" }
  }
}
