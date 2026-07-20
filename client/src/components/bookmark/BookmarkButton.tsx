import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useBookmarkStatusQuery, useToggleBookmarkMutation } from '../../hooks/useBookmark';
import { useAuth } from '../../contexts/AuthContext';

interface BookmarkButtonProps {
  interviewId: string;
}

/**
 * BookmarkButton renders a save/unsave toggle for an interview diary.
 *
 * Behavior:
 * - Unauthenticated users: button is disabled with a tooltip hint.
 * - Authenticated users: click immediately flips the icon (optimistic update).
 *   If the API call fails, the icon rolls back automatically.
 */
export default function BookmarkButton({ interviewId }: BookmarkButtonProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const { data: isBookmarked = false, isLoading: statusLoading } = useBookmarkStatusQuery(
    interviewId,
    isLoggedIn
  );

  const { mutate: toggleBookmark, isPending } = useToggleBookmarkMutation(interviewId);

  const handleClick = () => {
    if (!isLoggedIn || isPending) return;
    toggleBookmark(isBookmarked);
  };

  const isDisabled = !isLoggedIn || statusLoading || isPending;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      title={
        !isLoggedIn
          ? 'Log in to save this diary'
          : isBookmarked
          ? 'Remove from bookmarks'
          : 'Save to bookmarks'
      }
      className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-bold border transition-all ${
        isBookmarked
          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={isBookmarked}
    >
      {isPending || statusLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
