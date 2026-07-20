import { Eye, MessageSquare } from 'lucide-react';
import HelpfulButton from './HelpfulButton';

interface InterviewStatsProps {
  interviewId: string;
  helpfulCount: number;
  commentCount: number;
  viewCount: number;
}

/**
 * InterviewStats displays user engagement counters (helpful votes, comments, views).
 */
export default function InterviewStats({
  interviewId,
  helpfulCount,
  commentCount,
  viewCount,
}: InterviewStatsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
      {/* View/Comment statistics counters */}
      <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-slate-400" />
          {viewCount} {viewCount === 1 ? 'view' : 'views'}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Upvote/Helpful button action */}
      <HelpfulButton interviewId={interviewId} helpfulCount={helpfulCount} />
    </div>
  );
}
