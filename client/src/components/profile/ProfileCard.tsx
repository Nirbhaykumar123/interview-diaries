import { GraduationCap, Building2, MapPin } from 'lucide-react';
import UserAvatar from './UserAvatar';
import SkillBadge from './SkillBadge';
import SocialLinks from './SocialLinks';

interface ProfileCardProps {
  fullName: string;
  username: string;
  college?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  currentCompany?: string | null;
  currentRole?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  skills?: string[];
  /** If true, renders a compact horizontal layout */
  compact?: boolean;
}

/**
 * ProfileCard renders a student's public portfolio summary.
 * Used on the dashboard header and the /users/profile/:username page.
 */
export default function ProfileCard({
  fullName,
  username,
  college,
  branch,
  graduationYear,
  currentCompany,
  currentRole,
  bio,
  avatarUrl,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  skills = [],
  compact = false,
}: ProfileCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <UserAvatar avatarUrl={avatarUrl} fullName={fullName} size="lg" />
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900 truncate">{fullName}</p>
          <p className="text-xs text-slate-500 font-semibold">@{username}</p>
          {(currentRole || currentCompany) && (
            <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
              {currentRole}{currentRole && currentCompany ? ' at ' : ''}{currentCompany}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Avatar + Name header */}
      <div className="flex items-start gap-4">
        <UserAvatar avatarUrl={avatarUrl} fullName={fullName} size="xl" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">{fullName}</h2>
          <p className="text-sm text-slate-500 font-semibold">@{username}</p>

          {/* Career badge */}
          {(currentRole || currentCompany) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <p className="text-xs font-semibold text-slate-600 truncate">
                {[currentRole, currentCompany].filter(Boolean).join(' at ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Academic info */}
      {(college || branch || graduationYear) && (
        <div className="flex flex-wrap gap-3">
          {college && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{college}</span>
            </div>
          )}
          {branch && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{branch}</span>
            </div>
          )}
          {graduationYear && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Class of {graduationYear}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {bio && (
        <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {skills.map((skill) => (
            <SkillBadge key={skill} skill={skill} variant="outline" />
          ))}
        </div>
      )}

      {/* Social links */}
      {(linkedinUrl || githubUrl || portfolioUrl) && (
        <div className="border-t border-slate-100 pt-4">
          <SocialLinks
            linkedinUrl={linkedinUrl}
            githubUrl={githubUrl}
            portfolioUrl={portfolioUrl}
          />
        </div>
      )}
    </div>
  );
}
