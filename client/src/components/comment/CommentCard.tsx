import { useState } from 'react';
import { CommentData } from '../../api/comment.api';
import ReplyEditor from './ReplyEditor';
import UserAvatar from '../profile/UserAvatar';
import { MessageSquare, Edit2, Trash2, AlertTriangle, CornerDownRight } from 'lucide-react';
import ReportDialog from '../common/ReportDialog';

interface CommentCardProps {
  comment: CommentData;
  activeUserId?: string;
  isAdmin?: boolean;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

/**
 * Format relative date distances manually to avoid external libraries.
 */
const formatDistanceToNow = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

/**
 * CommentCard renders a single comment block.
 * Handles edit toggles, replies insertion, deletion triggers, and report dialog overlays.
 */
export default function CommentCard({
  comment,
  activeUserId,
  isAdmin,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const isOwner = comment.authorId === activeUserId;
  const canModify = (isOwner || isAdmin) && !comment.isDeleted;
  const isReply = comment.parentId !== null;

  const handleEditSubmit = async (text: string) => {
    await onUpdateComment(comment.id, text);
    setIsEditing(false);
  };

  const handleReplySubmit = async (text: string) => {
    await onAddComment(text, comment.id);
    setIsReplying(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(comment.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Target card envelope */}
      <div className={`flex gap-3 p-4 rounded-xl border border-slate-100 bg-white/50 transition-all ${
        comment.isDeleted ? 'bg-slate-50/50' : 'hover:border-slate-200 hover:shadow-sm'
      }`}>
        <UserAvatar
          fullName={comment.author.fullName}
          avatarUrl={comment.author.profile?.avatarUrl}
          className="h-8 w-8 text-xs font-bold shrink-0"
        />

        <div className="flex-1 space-y-1">
          {/* Metadata info */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-900">{comment.author.fullName}</span>
              <span className="text-[10px] text-slate-400 font-semibold">@{comment.author.username}</span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] text-slate-400 font-semibold">{formatDistanceToNow(comment.createdAt)}</span>
            </div>
            
            {/* Action controls */}
            {!comment.isDeleted && (
              <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                {canModify && (
                  <>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-1 hover:bg-slate-100 hover:text-slate-900 text-slate-400 rounded transition-all"
                      title="Edit Comment"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-1 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded transition-all"
                      title="Delete Comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                {!isOwner && activeUserId && (
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="p-1 hover:bg-amber-50 hover:text-amber-600 text-slate-400 rounded transition-all"
                    title="Report Comment"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comment Payload content */}
          {comment.isDeleted ? (
            <p className="text-xs font-semibold text-slate-400 italic bg-slate-100/50 p-2 rounded-lg inline-block">
              This comment was deleted by the author.
            </p>
          ) : isEditing ? (
            <div className="pt-2">
              <ReplyEditor
                initialValue={comment.content}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
                submitLabel="Save"
              />
            </div>
          ) : (
            <p className="text-xs md:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          )}

          {/* Inline Reply Trigger (Only for top-level non-deleted comments) */}
          {!isReply && !comment.isDeleted && activeUserId && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-900 transition-colors font-semibold"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="ml-8 border-l-2 border-slate-100 pl-4 py-1">
          <ReplyEditor
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
            placeholder={`Reply to ${comment.author.fullName}...`}
          />
        </div>
      )}

      {/* Nested child replies list */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 md:ml-8 space-y-4 border-l border-slate-100 pl-4 pt-1">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="relative">
              {/* Connector graphics icon */}
              <div className="absolute -left-5 top-4 text-slate-200">
                <CornerDownRight className="h-4 w-4" />
              </div>
              <CommentCard
                comment={reply}
                activeUserId={activeUserId}
                isAdmin={isAdmin}
                onAddComment={onAddComment}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
              />
            </div>
          ))}
        </div>
      )}

      {/* Report dialog portal overlay */}
      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        commentId={comment.id}
      />
    </div>
  );
}
