"use client"

import { cn } from "@/lib/utils"
import { PokerCard } from "./poker-card"
import { Crown, Check } from "lucide-react"

interface ParticipantCardProps {
  name: string
  vote: string | null
  revealed: boolean
  isAdmin?: boolean
  isCurrentUser?: boolean
}

export function ParticipantCard({ name, vote, revealed, isAdmin, isCurrentUser }: ParticipantCardProps) {
  const hasVoted = vote !== null

  return (
    <div className={cn(
      "flex flex-col items-center gap-3 p-4 rounded-xl transition-all",
      isCurrentUser && "bg-primary/5 ring-2 ring-primary/20"
    )}>
      <PokerCard
        value={revealed ? (vote || "-") : ""}
        revealed={revealed && hasVoted}
        hidden={hasVoted && !revealed}
        disabled
      />
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          {isAdmin && <Crown className="h-3.5 w-3.5 text-amber-500" />}
          <span className={cn(
            "text-sm font-medium truncate max-w-24",
            isCurrentUser && "text-primary"
          )}>
            {name}
            {isCurrentUser && " (you)"}
          </span>
        </div>
        {hasVoted && !revealed && (
          <div className="flex items-center gap-1 text-xs text-accent">
            <Check className="h-3 w-3" />
            <span>Voted</span>
          </div>
        )}
      </div>
    </div>
  )
}
