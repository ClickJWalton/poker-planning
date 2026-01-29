"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, LogOut } from "lucide-react"
import { useState } from "react"

interface SessionHeaderProps {
  sessionName: string
  sessionCode: string
  participantCount: number
  onLeave: () => void
}

export function SessionHeader({ sessionName, sessionCode, participantCount, onLeave }: SessionHeaderProps) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(sessionCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 bg-card border-b border-border">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-semibold text-card-foreground text-balance">
          {sessionName}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono bg-muted px-2 py-0.5 rounded">{sessionCode}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-accent" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <Badge variant="secondary">{participantCount} participant{participantCount !== 1 ? "s" : ""}</Badge>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onLeave}>
        <LogOut className="h-4 w-4 mr-2" />
        Leave Session
      </Button>
    </div>
  )
}
