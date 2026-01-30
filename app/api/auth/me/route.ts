import { NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
