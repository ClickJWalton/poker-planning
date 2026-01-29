"use client"

import { PokerCard } from "./poker-card"

const POINT_VALUES = ["0", "1", "2", "3", "5", "8", "13", "21", "?", "☕"]

interface VotingPanelProps {
  selectedValue: string | null
  onSelect: (value: string) => void
  disabled?: boolean
}

export function VotingPanel({ selectedValue, onSelect, disabled }: VotingPanelProps) {
  return (
    <div className="w-full bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Select your estimate
      </p>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {POINT_VALUES.map((value) => (
          <PokerCard
            key={value}
            value={value}
            selected={selectedValue === value}
            onClick={() => onSelect(value)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}
