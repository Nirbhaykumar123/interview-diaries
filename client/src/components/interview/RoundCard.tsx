import { Clock } from 'lucide-react';
import QuestionList from './QuestionList';
import DifficultyBadge from './DifficultyBadge';

export interface RoundData {
  id?: string;
  roundNumber: number;
  roundType: 'ONLINE_TEST' | 'TECHNICAL' | 'HR' | 'MANAGERIAL' | 'GROUP_DISCUSSION' | 'OTHER';
  description: string;
  questionsAsked: string[];
  durationMinutes?: number | null;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
}

interface RoundCardProps {
  round: RoundData;
}

/**
 * RoundCard displays detailed information for a single interview round.
 */
export default function RoundCard({ round }: RoundCardProps) {
  const { roundNumber, roundType, description, questionsAsked, durationMinutes, difficulty } = round;

  const typeLabels = {
    ONLINE_TEST: 'Online Assessment / Coding Test',
    TECHNICAL: 'Technical Interview Round',
    HR: 'HR Interview Round',
    MANAGERIAL: 'Managerial Round',
    GROUP_DISCUSSION: 'Group Discussion',
    OTHER: 'Other Assessment Round',
  };

  const currentLabel = typeLabels[roundType] || roundType;

  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Timeline Connecting line */}
      <div className="absolute left-3.5 top-2 bottom-0 w-0.5 bg-slate-200 group-last:hidden" />
      
      {/* Timeline Node Point indicator */}
      <div className="absolute left-1.5 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-900 ring-4 ring-white shadow-sm z-10">
        <span className="text-[10px] font-bold text-white leading-none">{roundNumber}</span>
      </div>

      {/* Round Details Card Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">{currentLabel}</h4>
          
          <div className="flex items-center gap-2">
            {durationMinutes && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {durationMinutes} mins
              </span>
            )}
            {difficulty && <DifficultyBadge difficulty={difficulty} />}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>

        {/* Nested questions Asked component */}
        <QuestionList questions={questionsAsked} />
      </div>
    </div>
  );
}
