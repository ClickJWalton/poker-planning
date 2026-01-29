"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Layers } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError("Email and password are required")
      setIsPending(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
      } else {
        router.push("/")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Layers className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Planning Poker account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/auth/sign-up"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
