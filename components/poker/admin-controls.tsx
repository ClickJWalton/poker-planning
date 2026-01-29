"use client"

import { Button } from "@/components/ui/button"
import { Eye, RotateCcw } from "lucide-react"

interface AdminControlsProps {
  revealed: boolean
  onReveal: () => void
  onReset: () => void
  voteCount: number
  totalParticipants: number
}

export function AdminControls({ revealed, onReveal, onReset, voteCount, totalParticipants }: AdminControlsProps) {
  const allVoted = voteCount === totalParticipants && totalParticipants > 0

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-muted/50 rounded-xl">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{voteCount}</span> of{" "}
        <span className="font-medium text-foreground">{totalParticipants}</span> voted
      </div>
      <div className="flex gap-2">
        {!revealed ? (
          <Button
            onClick={onReveal}
            disabled={voteCount === 0}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Reveal Votes
          </Button>
        ) : (
          <Button onClick={onReset} variant="outline" className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            New Round
          </Button>
        )}
      </div>
      {!revealed && allVoted && (
        <span className="text-sm text-accent font-medium">All votes in!</span>
      )}
    </div>
  )
}
