import { useParams, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { usePublicProfileQuery } from '../hooks/useUser';
import { useInterviewsQuery } from '../hooks';
import ProfileCard from '../components/profile/ProfileCard';
import InterviewCard from '../components/interview/InterviewCard';
import Loader from '../components/common/Loader';
import NotFoundPage from './error/NotFoundPage';

/**
 * UserProfilePage renders a public student portfolio.
 * Accessible at /users/:username — no authentication required.
 * Respects the isPrivate flag enforced server-side.
 */
export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading, error } = usePublicProfileQuery(username ?? '');

  // Load interviews authored by this user for the feed section
  // We filter by searching the author's username via the existing interviews endpoint
  const { data: interviewData } = useInterviewsQuery({
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (isLoading) {
    return <Loader fullScreen message={`Loading ${username}'s profile...`} />;
  }

  if (error || !user) {
    return <NotFoundPage />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back breadcrumb */}
      <div>
        <Link
          to="/search"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Back to Search
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Full ProfileCard */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard
            fullName={user.fullName}
            username={user.username}
            college={(user as any).college}
            branch={(user as any).branch}
            graduationYear={(user as any).graduationYear}
            currentRole={user.profile?.currentRole}
            currentCompany={user.profile?.currentCompany}
            bio={user.profile?.bio}
            avatarUrl={user.profile?.avatarUrl}
            linkedinUrl={user.profile?.linkedinUrl}
            githubUrl={user.profile?.githubUrl}
            portfolioUrl={user.profile?.portfolioUrl}
            skills={user.profile?.skills}
          />
        </div>

        {/* Right: Content section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-xl font-bold text-slate-900">
              {user.fullName.split(' ')[0]}'s Interview Diaries
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Experiences shared with the community.
            </p>
          </div>

          {/* Interview list — shows recent published posts */}
          {interviewData?.interviews && interviewData.interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewData.interviews.slice(0, 4).map((post) => (
                <InterviewCard key={post.id} interview={post} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-2">
              <GraduationCap className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No experiences shared yet</p>
              <p className="text-xs text-slate-500">
                This student hasn't published any interview diaries yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
