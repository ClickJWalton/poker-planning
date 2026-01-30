import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { createHash, randomUUID } from "crypto"

export async function hashPassword(password: string): Promise<string> {
  return createHash("sha256").update(password).digest("hex")
}

export async function createUser(
  email: string,
  displayName: string,
  password: string
): Promise<{ id: string } | null> {
  const passwordHash = await hashPassword(password)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, display_name: displayName, password_hash: passwordHash }])
    .select("id")
    .single()

  if (error) {
    console.error("Failed to create user:", error)
    return null
  }

  return data
}

export async function verifyPassword(
  storedHash: string,
  password: string
): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === storedHash
}

export async function createSession(userId: string): Promise<string | null> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const supabase = await createClient()

  const { error } = await supabase.from("user_sessions").insert([
    {
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    },
  ])

  if (error) {
    console.error("Failed to create session:", error)
    return null
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })

  return token
}

export async function getUserFromSession(): Promise<{
  id: string
  email: string
  display_name: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_sessions")
    .select("user_id, expires_at")
    .eq("token", token)
    .single()

  if (error || !data) {
    return null
  }

  // Check if session is expired
  if (new Date(data.expires_at) < new Date()) {
    return null
  }

  // Get user data
  const { data: user } = await supabase
    .from("users")
    .select("id, email, display_name")
    .eq("id", data.user_id)
    .single()

  return user || null
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}
