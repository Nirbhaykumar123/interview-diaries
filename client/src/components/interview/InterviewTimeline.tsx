import RoundCard, { RoundData } from './RoundCard';

interface InterviewTimelineProps {
  rounds: RoundData[];
}

/**
 * InterviewTimeline aggregates a list of RoundCard items, laying them out
 * sequentially along a vertical chronological path.
 */
export default function InterviewTimeline({ rounds }: InterviewTimelineProps) {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        No specific round timelines provided for this experience.
      </div>
    );
  }

  // Sort rounds chronologically by roundNumber before rendering
  const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);

  return (
    <div className="space-y-1">
      {sortedRounds.map((round, index) => (
        <RoundCard key={round.id || index} round={round} />
      ))}
    </div>
  );
}
