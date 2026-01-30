import { NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json()

    // Validation
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(email, displayName, password)
    if (!user) {
      return NextResponse.json(
        { error: "Email already in use or failed to create user" },
        { status: 400 }
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
    console.error("Sign up error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
