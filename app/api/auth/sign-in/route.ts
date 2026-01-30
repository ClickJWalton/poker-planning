import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user by email
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .single()

    if (getUserError || !user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password_hash, password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create session
    const token = await createSession(user.id)
    if (!token) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
