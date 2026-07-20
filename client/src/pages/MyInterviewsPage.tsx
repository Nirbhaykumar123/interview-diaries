import { Link } from 'react-router-dom';
import { useMyInterviewsQuery, useDeleteInterviewMutation } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ResultBadge from '../components/interview/ResultBadge';
import DifficultyBadge from '../components/interview/DifficultyBadge';
import Button from '../components/common/Button';
import { Trash2, Edit, ExternalLink, Inbox } from 'lucide-react';

/**
 * MyInterviewsPage displays a table/list of all interview experiences
 * shared by the currently logged-in student, allowing quick edits and deletions.
 */
export default function MyInterviewsPage() {
  const { isAuthenticated } = useAuth();
  
  // Fetch posts written by current user
  const { data: interviews = [], isLoading, error } = useMyInterviewsQuery(isAuthenticated);
  const deleteMutation = useDeleteInterviewMutation();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience review? This action is permanent.')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      alert('Post deleted successfully');
    } catch (err) {
      alert('Failed to delete experience post.');
    }
  };

  if (isLoading) {
    return <Loader fullScreen message="Loading your shared stories..." />;
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <p className="text-red-500 font-bold">Failed to load your interview diaries.</p>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <EmptyState
        title="No experiences shared yet"
        description="You have not logged any interview round experiences. Share your first process to help other peers prep."
        icon={<Inbox className="h-6 w-6" />}
        actionText="Share Experience"
        onAction={() => window.location.href = '/dashboard/interviews/create'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Shared Experiences</h1>
          <p className="text-sm text-slate-500">Track, publish, or edit your logged reviews.</p>
        </div>
        <Link to="/dashboard/interviews/create">
          <Button variant="primary" size="sm">
            Share New Experience
          </Button>
        </Link>
      </div>

      {/* List feed of student's posts */}
      <div className="space-y-4">
        {interviews.map((post) => (
          <div
            key={post.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {post.company.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-400">{post.academicYear}</span>
              </div>
              <p className="text-base font-bold text-slate-900 truncate">{post.role}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <ResultBadge outcome={post.outcome} />
                <DifficultyBadge difficulty={post.difficulty} />
              </div>
            </div>

            {/* Editing and deletion action buttons */}
            <div className="flex gap-2 w-full md:w-auto justify-end border-t border-slate-50 md:border-none pt-3 md:pt-0">
              <Link to={`/interviews/${post.id}`} className="shrink-0">
                <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-600">
                  <ExternalLink className="h-4 w-4" /> View
                </Button>
              </Link>
              <Link to={`/dashboard/interviews/${post.id}/edit`} className="shrink-0">
                <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-600">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              </Link>
              <Button
                onClick={() => handleDelete(post.id)}
                variant="outline"
                size="sm"
                className="h-9 px-3 gap-1.5 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
