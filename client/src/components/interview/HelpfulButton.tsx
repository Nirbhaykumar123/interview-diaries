import { ThumbsUp, Loader2 } from 'lucide-react';
import { useHelpfulStatusQuery, useToggleHelpfulMutation } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';

interface HelpfulButtonProps {
  interviewId: string;
  helpfulCount: number;
}

/**
 * HelpfulButton upvotes/downvotes a diary experience.
 */
export default function HelpfulButton({ interviewId, helpfulCount }: HelpfulButtonProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const { data: hasVoted = false, isLoading: statusLoading } = useHelpfulStatusQuery(
    interviewId,
    isLoggedIn
  );

  const { mutate: toggleHelpful, isPending } = useToggleHelpfulMutation(interviewId);

  const handleClick = () => {
    if (!isLoggedIn || isPending) return;
    toggleHelpful(hasVoted);
  };

  const isDisabled = !isLoggedIn || statusLoading || isPending;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      title={
        !isLoggedIn
          ? 'Log in to mark this as helpful'
          : hasVoted
          ? 'Revoke helpful mark'
          : 'Mark as helpful'
      }
      className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-bold border transition-all ${
        hasVoted
          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={hasVoted ? 'Remove helpful vote' : 'Add helpful vote'}
      aria-pressed={hasVoted}
    >
      {isPending || statusLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-blue-600' : ''}`} />
      )}
      <span>{helpfulCount} Helpful</span>
    </button>
  );
}
