import { Calendar, ClipboardList, GraduationCap, Award } from 'lucide-react';
import CompanyLogo from '../company/CompanyLogo';
import ResultBadge from './ResultBadge';
import DifficultyBadge from './DifficultyBadge';
import Badge from '../common/Badge';
import { formatDate } from '../../utils';
import VerificationBadge from '../admin/VerificationBadge';
import { InterviewCardData } from './InterviewCard';

interface InterviewHeaderProps {
  interview: InterviewCardData & {
    company: {
      slug: string;
    };
    author: {
      id: string;
      fullName: string;
      avatar: string | null;
      branch: string;
      degree: 'BTECH' | 'MTECH';
      graduationYear: number;
      isVerified: boolean;
    } | null;
  };
}

/**
 * InterviewHeader renders the top details banner for a diary entry page,
 * mapping company details, job details, and outcomes.
 */
export default function InterviewHeader({ interview }: InterviewHeaderProps) {
  const {
    role,
    type,
    degree,
    branch,
    cgpa,
    academicYear,
    placementBatch,
    campusDriveDate,
    outcome,
    difficulty,
    ctc,
    stipend,
    oaPlatform,
    eligibility,
    createdAt,
    isVerified,
    company,
    author,
  } = interview;

  const compensation = type === 'PLACEMENT' 
    ? (ctc ? `${ctc} LPA` : null) 
    : (stipend ? `₹${stipend.toLocaleString()}/mo` : null);

  const secondRowCols = 1 + (oaPlatform ? 1 : 0) + (eligibility ? 1 : 0);
  const secondRowColsClass = 
    secondRowCols === 3 ? 'md:grid-cols-3' :
    secondRowCols === 2 ? 'md:grid-cols-2' :
    'md:grid-cols-1';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-100 pb-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="lg" />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {company.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-medium text-slate-500">
                {type === 'PLACEMENT' ? 'Placement Experience' : 'Internship Experience'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight flex flex-wrap items-center gap-2">
              {role}
              <VerificationBadge isVerified={isVerified} />
            </h1>

            {/* Compensation tags and details */}
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              <ResultBadge outcome={outcome} />
              <DifficultyBadge difficulty={difficulty} />
              {compensation && (
                <Badge variant="info" className="font-mono text-xs">
                  {compensation}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Author details in top-right corner */}
        {author && (
          <div className="flex flex-col items-start sm:items-end text-left sm:text-right shrink-0 select-none space-y-1 sm:mt-1">
            <span className="text-xs text-slate-500 font-medium">
              Author: <span className="font-bold text-slate-800">{author.fullName}</span>
            </span>
            {author.isVerified && (
              <span 
                aria-label="Verified NITC Student"
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 rounded border border-indigo-100 shrink-0"
              >
                ✓ Verified NITC Student
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta grid rows */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Academic Year</p>
            <p className="text-slate-800 mt-0.5">{academicYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Batch</p>
            <p className="text-slate-800 mt-0.5">{placementBatch}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <ClipboardList className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate Info</p>
            <p className="text-slate-800 mt-0.5">{degree} - {branch}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <Award className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">CGPA</p>
            <p className="text-slate-800 mt-0.5">{cgpa.toFixed(2)} CGPA</p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${secondRowColsClass} gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500`}>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Drive Date / Shared On</p>
          <p className="text-slate-800 mt-0.5">
            {campusDriveDate ? new Date(campusDriveDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : formatDate(createdAt)}
          </p>
        </div>
        {oaPlatform && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">OA Platform</p>
            <p className="text-slate-800 mt-0.5">{oaPlatform}</p>
          </div>
        )}
        {eligibility && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Eligibility Criteria</p>
            <p className="text-slate-800 mt-0.5 whitespace-pre-wrap">{eligibility}</p>
          </div>
        )}
      </div>
    </div>
  );
}
