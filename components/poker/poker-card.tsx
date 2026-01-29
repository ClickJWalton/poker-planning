"use client"

import { cn } from "@/lib/utils"

interface PokerCardProps {
  value: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  revealed?: boolean
  hidden?: boolean
}

export function PokerCard({ value, selected, onClick, disabled, revealed, hidden }: PokerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-16 h-24 md:w-20 md:h-28 rounded-xl border-2 transition-all duration-200 font-semibold text-xl md:text-2xl",
        "flex items-center justify-center",
        "hover:scale-105 active:scale-95",
        "disabled:hover:scale-100 disabled:cursor-not-allowed",
        hidden && "bg-primary text-primary-foreground border-primary shadow-lg",
        !hidden && selected && "bg-primary text-primary-foreground border-primary shadow-lg scale-105",
        !hidden && !selected && "bg-card text-card-foreground border-border hover:border-primary/50 hover:shadow-md",
        disabled && !hidden && "opacity-50",
        revealed && "animate-in fade-in duration-300"
      )}
    >
      {hidden ? (
        <div className="w-10 h-14 md:w-12 md:h-16 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
          <span className="text-primary-foreground/60 text-lg">?</span>
        </div>
      ) : (
        value
      )}
    </button>
  )
}
