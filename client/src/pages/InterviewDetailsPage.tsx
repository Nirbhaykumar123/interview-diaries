import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, AlertTriangle } from 'lucide-react';
import InterviewHeader from '../components/interview/InterviewHeader';
import InterviewStats from '../components/interview/InterviewStats';
import InterviewTimeline from '../components/interview/InterviewTimeline';
import NotFoundPage from './error/NotFoundPage';
import { useInterviewDetailsQuery, useRelatedInterviewsQuery } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import BookmarkButton from '../components/bookmark/BookmarkButton';
import ReportDialog from '../components/common/ReportDialog';
import CommentSection from '../components/comment/CommentSection';
import SubmitEvidenceDialog from '../components/admin/SubmitEvidenceDialog';

/**
 * InterviewDetailsPage renders a detailed chronological review of a single
 * interview experience, mapping company info, rounds checklists, and prep advice.
 */
export default function InterviewDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const { data: interview, isLoading, error } = useInterviewDetailsQuery(id || '');
  const { data: related = [] } = useRelatedInterviewsQuery(id || '');

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        {/* Back link & actions skeleton */}
        <div className="flex items-center justify-between pb-2">
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-slate-200 rounded-lg"></div>
            <div className="h-9 w-20 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        {/* Header banner skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-slate-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-3 min-w-0">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              
              {/* Author row skeleton */}
              <div className="flex gap-3 py-3 border-y border-slate-100 my-2">
                <div className="h-11 w-11 bg-slate-200 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                  <div className="h-3.5 w-1/3 bg-slate-200 rounded"></div>
                </div>
              </div>

              <div className="h-7 w-3/4 bg-slate-200 rounded"></div>
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-around h-16">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>

        {/* Layout split skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-5 w-32 bg-slate-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-32 bg-slate-100 rounded-xl"></div>
              <div className="h-32 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-44 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return <NotFoundPage />;
  }

  const isOwner = user && interview.authorId === user.id;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button and edit options */}
      <div className="flex items-center justify-between">
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Search
        </Link>
        <div className="flex items-center gap-2">
          <BookmarkButton interviewId={id ?? ''} />
          
          {/* Report Button (Candidate only, cannot report own post) */}
          {!isOwner && user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportOpen(true)}
              className="gap-1.5 text-xs font-semibold h-9 rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
            >
              <AlertTriangle className="h-4 w-4" /> Report
            </Button>
          )}

          {isOwner && (
            <Link to={`/dashboard/interviews/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold h-9 rounded-lg">
                <Edit className="h-4 w-4" /> Edit Post
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Styled banner header */}
      <InterviewHeader interview={interview} />

      {/* Stats row helpful votes */}
      <InterviewStats
        interviewId={id ?? ''}
        helpfulCount={interview.helpfulCount}
        commentCount={interview.commentCount ?? 0}
        viewCount={interview.viewCount ?? 0}
      />

      {/* Layout Split: Left details, Right tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Timeline Rounds */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Rounds & Process</h3>
          </div>
          <InterviewTimeline rounds={interview.rounds} />
        </div>

        {/* Right Side: Overall description & tips */}
        <div className="space-y-6">
          {/* Overall Experience summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Overall Experience</h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {interview.overallExperience}
            </p>
          </div>

          {/* Verification Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Verification Status</h4>
            {interview.isVerified ? (
              <div className="text-xs text-green-700 bg-green-50 border border-green-100 p-3 rounded-xl font-semibold leading-relaxed">
                ✓ Verified Experience. The details of this candidate's selection process have been validated.
              </div>
            ) : interview.verification ? (
              <div className="space-y-2">
                {interview.verification.status === 'PENDING' || interview.verification.status === 'UNDER_REVIEW' ? (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl font-semibold leading-relaxed animate-pulse">
                    ⌛ Verification Pending. Our moderation team is currently reviewing your document proof.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl font-semibold leading-relaxed">
                      ⚠ Verification Rejected. Reason: {interview.verification.rejectionReason || 'Invalid proof format.'}
                    </div>
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold"
                        onClick={() => setIsVerifyOpen(true)}
                      >
                        Resubmit Proof
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  This post has not been verified. Verified diaries display a blue checkmark badge, boosting visibility.
                </p>
                {isOwner ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => setIsVerifyOpen(true)}
                  >
                    Verify Experience
                  </Button>
                ) : (
                  <div className="text-xs text-slate-400 italic font-semibold">
                    Verification is only requested by the author.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prep tips */}
          {interview.tips && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
              <h4 className="text-sm font-bold border-b border-slate-800 pb-2 text-slate-200">Preparation Tips</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {interview.tips}
              </p>
            </div>
          )}

          {/* Related Interviews */}
          {related.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Related Experiences</h4>
              <div className="space-y-3">
                {related.map((post) => (
                  <Link
                    key={post.id}
                    to={`/interviews/${post.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="block p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                  >
                    <p className="font-bold text-slate-800 uppercase tracking-wider">{post.company.name}</p>
                    <p className="font-semibold text-slate-600 mt-1 truncate">{post.role}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discussion section */}
      <CommentSection interviewId={id ?? ''} />

      {/* Report dialog modal overlay */}
      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        interviewId={id ?? ''}
      />

      {/* Submit evidence modal overlay */}
      <SubmitEvidenceDialog
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        interviewId={id ?? ''}
      />
    </div>
  );
}
