"use client"

import { use, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SessionHeader } from "@/components/poker/session-header"
import { VotingPanel } from "@/components/poker/voting-panel"
import { ParticipantCard } from "@/components/poker/participant-card"
import { AdminControls } from "@/components/poker/admin-controls"
import { ResultsSummary } from "@/components/poker/results-summary"
import type { User } from "@supabase/supabase-js"

interface Session {
  id: string
  name: string
  code: string
  admin_id: string
  revealed: boolean
}

interface Vote {
  id: string
  user_id: string
  vote_value: string
  user_email: string
  user_name: string
}

interface PageProps {
  params: Promise<{ code: string }>
}

export default function SessionPage({ params }: PageProps) {
  const { code } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchSession = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("code", code)
      .single()

    if (sessionError || !sessionData) {
      setError("Session not found")
      setLoading(false)
      return
    }

    setSession(sessionData)
    return sessionData
  }, [code, supabase])

  const fetchVotes = useCallback(async (sessionId: string) => {
    const { data: votesData } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId)

    if (votesData) {
      setVotes(votesData)
      const currentUser = (await supabase.auth.getUser()).data.user
      const userVote = votesData.find((v) => v.user_id === currentUser?.id)
      if (userVote) {
        setSelectedValue(userVote.vote_value)
      }
    }
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }
      setUser(currentUser)

      const sessionData = await fetchSession()
      if (sessionData) {
        await fetchVotes(sessionData.id)
      }
      setLoading(false)
    }

    init()
  }, [code, router, supabase, fetchSession, fetchVotes])

  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `session_id=eq.${session.id}` },
        () => {
          fetchVotes(session.id)
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${session.id}` },
        (payload) => {
          setSession(payload.new as Session)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, supabase, fetchVotes])

  const handleVote = async (value: string) => {
    if (!session || !user) return

    setSelectedValue(value)

    const existingVote = votes.find((v) => v.user_id === user.id)
    const userName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Anonymous"

    if (existingVote) {
      await supabase
        .from("votes")
        .update({ vote_value: value })
        .eq("id", existingVote.id)
    } else {
      await supabase
        .from("votes")
        .insert({
          session_id: session.id,
          user_id: user.id,
          user_email: user.email,
          user_name: userName,
          vote_value: value,
        })
    }

    fetchVotes(session.id)
  }

  const handleReveal = async () => {
    if (!session) return
    await supabase
      .from("sessions")
      .update({ revealed: true })
      .eq("id", session.id)
  }

  const handleReset = async () => {
    if (!session) return
    await supabase
      .from("votes")
      .delete()
      .eq("session_id", session.id)
    await supabase
      .from("sessions")
      .update({ revealed: false })
      .eq("id", session.id)
    setSelectedValue(null)
    setVotes([])
  }

  const handleLeave = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading session...</div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "Session not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    )
  }

  const isAdmin = user?.id === session.admin_id

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionHeader
        sessionName={session.name}
        sessionCode={session.code}
        participantCount={votes.length}
        onLeave={handleLeave}
      />

      <main className="flex-1 container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {isAdmin && (
          <AdminControls
            revealed={session.revealed}
            onReveal={handleReveal}
            onReset={handleReset}
            voteCount={votes.length}
            totalParticipants={votes.length}
          />
        )}

        <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            {session.revealed ? "Results" : "Participants"}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {votes.map((vote) => (
              <ParticipantCard
                key={vote.id}
                name={vote.user_name}
                vote={vote.vote_value}
                revealed={session.revealed}
                isAdmin={vote.user_id === session.admin_id}
                isCurrentUser={vote.user_id === user?.id}
              />
            ))}
            {votes.length === 0 && (
              <p className="text-muted-foreground py-8">
                No votes yet. Be the first to estimate!
              </p>
            )}
          </div>
        </div>

        {session.revealed && votes.length > 0 && (
          <ResultsSummary votes={votes} />
        )}

        {!session.revealed && (
          <VotingPanel
            selectedValue={selectedValue}
            onSelect={handleVote}
            disabled={session.revealed}
          />
        )}
      </main>
    </div>
  )
}
