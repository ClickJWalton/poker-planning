"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layers, Plus, Users, LogOut, Crown } from "lucide-react"
import type { User } from "@supabase/supabase-js"

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionName, setSessionName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreating(true)
    setError(null)

    const code = generateCode()

    const { error: createError } = await supabase
      .from("sessions")
      .insert({
        name: sessionName || "Planning Session",
        code,
        admin_id: user.id,
        revealed: false,
      })

    if (createError) {
      setError(createError.message)
      setCreating(false)
      return
    }

    router.push(`/session/${code}`)
  }

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoining(true)
    setError(null)

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("code")
      .eq("code", joinCode.toUpperCase())
      .single()

    if (fetchError || !session) {
      setError("Session not found. Please check the code.")
      setJoining(false)
      return
    }

    router.push(`/session/${session.code}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Layers className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold">Planning Poker</CardTitle>
            <CardDescription className="text-base">
              Real-time story point estimation for agile teams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <a href="/auth/login">Sign in</a>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <a href="/auth/sign-up">Create account</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <span className="font-semibold text-lg text-card-foreground">Planning Poker</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="text-foreground font-medium">{displayName}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
            Start Estimating Together
          </h1>
          <p className="text-muted-foreground text-lg">
            Create a new session or join an existing one
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <Users className="h-4 w-4" />
                Join
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="p-6">
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    placeholder="Sprint 42 Refinement"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Give your session a descriptive name
                  </p>
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full gap-2" disabled={creating}>
                  <Crown className="h-4 w-4" />
                  {creating ? "Creating..." : "Create Session"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {"You'll be the admin and can reveal votes"}
                </p>
              </form>
            </TabsContent>

            <TabsContent value="join" className="p-6">
              <form onSubmit={handleJoinSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Session Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-character code shared by your team
                  </p>
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full gap-2" disabled={joining || joinCode.length < 6}>
                  <Users className="h-4 w-4" />
                  {joining ? "Joining..." : "Join Session"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-12 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Create or Join</h3>
              <p className="text-sm text-muted-foreground">
                Start a new session or join with a code
              </p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Vote Privately</h3>
              <p className="text-sm text-muted-foreground">
                Each team member selects their estimate
              </p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Reveal Together</h3>
              <p className="text-sm text-muted-foreground">
                Admin reveals all votes at once
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
