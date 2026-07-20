import { useState } from 'react';
import {
  useCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../../hooks/useComment';
import CommentCard from './CommentCard';
import ReplyEditor from './ReplyEditor';
import EmptyState from '../common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

interface CommentSectionProps {
  interviewId: string;
}

/**
 * CommentSection wraps the main thread lists, paginations, skeleton indicators,
 * and top-level comment submit inputs.
 */
export default function CommentSection({ interviewId }: CommentSectionProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const activeUserId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  const [page, setPage] = useState(1);
  const limit = 5; // Load 5 top-level comments per page

  // 1. Fetch comments query
  const { data, isLoading, isPlaceholderData } = useCommentsQuery(interviewId, page, limit);

  // 2. Mutations
  const addCommentMutation = useAddCommentMutation(interviewId);
  const updateCommentMutation = useUpdateCommentMutation(interviewId);
  const deleteCommentMutation = useDeleteCommentMutation(interviewId);

  const handleAddComment = async (content: string, parentId?: string) => {
    await addCommentMutation.mutateAsync({ content, parentId });
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    await updateCommentMutation.mutateAsync({ commentId, content });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteCommentMutation.mutateAsync(commentId);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100">
      <div>
        <h3 className="text-base font-bold text-slate-900">Discussion & Activity</h3>
        <p className="text-xs text-slate-400 mt-0.5">Ask questions or share advice regarding this interview experience.</p>
      </div>

      {/* Top level Comment composer */}
      {isLoggedIn ? (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-3">
          <p className="text-xs font-bold text-slate-700">Add to the conversation</p>
          <ReplyEditor
            onSubmit={(text) => handleAddComment(text)}
            placeholder="Share your thoughts or ask a follow-up question..."
            submitLabel="Post Comment"
          />
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/40 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Please log in or sign up to join the discussion.
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-white/50 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !data || data.comments.length === 0 ? (
        <EmptyState
          title="No discussions yet"
          description="Be the first to share a thought, ask a question, or leave some encouragement!"
        />
      ) : (
        <div className="space-y-4">
          {/* Comments Feed */}
          <div className="space-y-4">
            {data.comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                activeUserId={activeUserId}
                isAdmin={isAdmin}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>

          {/* Pagination widgets */}
          {data.pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                Page {page} of {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!data.pagination.hasPreviousPage || isPlaceholderData}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 disabled:opacity-50 transition-colors bg-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, data.pagination.totalPages))}
                  disabled={!data.pagination.hasNextPage || isPlaceholderData}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 disabled:opacity-50 transition-colors bg-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
