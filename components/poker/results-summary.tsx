"use client"

interface Vote {
  user_id: string
  vote_value: string
}

interface ResultsSummaryProps {
  votes: Vote[]
}

export function ResultsSummary({ votes }: ResultsSummaryProps) {
  const numericVotes = votes
    .map((v) => v.vote_value)
    .filter((v) => !isNaN(Number(v)))
    .map(Number)

  if (numericVotes.length === 0) {
    return null
  }

  const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
  const sortedVotes = [...numericVotes].sort((a, b) => a - b)
  const median = sortedVotes.length % 2 === 0
    ? (sortedVotes[sortedVotes.length / 2 - 1] + sortedVotes[sortedVotes.length / 2]) / 2
    : sortedVotes[Math.floor(sortedVotes.length / 2)]

  const voteCounts = votes.reduce((acc, v) => {
    acc[v.vote_value] = (acc[v.vote_value] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedCounts = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
      <h3 className="text-lg font-semibold text-card-foreground">Results</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Average</p>
          <p className="text-2xl font-bold text-foreground">{average.toFixed(1)}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Median</p>
          <p className="text-2xl font-bold text-foreground">{median}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Min</p>
          <p className="text-2xl font-bold text-foreground">{Math.min(...numericVotes)}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Max</p>
          <p className="text-2xl font-bold text-foreground">{Math.max(...numericVotes)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Vote distribution</p>
        <div className="flex flex-wrap gap-2">
          {sortedCounts.map(([value, count]) => (
            <div
              key={value}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
            >
              <span className="font-semibold text-primary">{value}</span>
              <span className="text-xs text-muted-foreground">x{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
