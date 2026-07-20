import { Link } from 'react-router-dom';
import { ThumbsUp, Calendar, Eye } from 'lucide-react';
import CompanyLogo from '../company/CompanyLogo';
import ResultBadge from './ResultBadge';
import DifficultyBadge from './DifficultyBadge';
import Badge from '../common/Badge';
import { Card, CardContent } from '../common/Card';
import VerificationBadge from '../admin/VerificationBadge';

export interface InterviewCardData {
  id: string;
  role: string;
  type: 'INTERNSHIP' | 'PLACEMENT';
  degree: 'BTECH' | 'MTECH';
  branch: string;
  cgpa: number;
  academicYear: string;
  placementBatch: number;
  campusDriveDate?: string | null;
  outcome: 'SELECTED' | 'REJECTED' | 'PENDING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  ctc?: number | null;
  stipend?: number | null;
  oaPlatform?: string | null;
  eligibility?: string | null;
  overallExperience: string;
  helpfulCount: number;
  commentCount?: number;
  viewCount?: number;
  createdAt: string;
  authorId: string;
  tips?: string | null;
  isVerified: boolean;
  company: {
    name: string;
    logoUrl?: string | null;
  };
}

interface InterviewCardProps {
  interview: InterviewCardData;
}

/**
 * InterviewCard presents a summarized block of an interview experience,
 * mapping outcomes, difficulties, company logo, and helpful vote totals.
 */
export default function InterviewCard({ interview }: InterviewCardProps) {
  const {
    id,
    role,
    type,
    degree,
    branch,
    cgpa,
    placementBatch,
    outcome,
    difficulty,
    ctc,
    stipend,
    helpfulCount,
    viewCount = 0,
    company,
  } = interview;

  const compensation = type === 'PLACEMENT' 
    ? (ctc ? `${ctc} LPA` : null) 
    : (stipend ? `₹${stipend.toLocaleString()}/mo` : null);

  return (
    <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200/80 hover:border-indigo-200/60 hover:bg-indigo-50/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {company.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500">
                  {type === 'PLACEMENT' ? 'Placement' : 'Internship'}
                </span>
              </div>
              
              <Link
                to={`/interviews/${id}`}
                className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900 hover:text-indigo-600 group-hover:text-indigo-600 transition-colors truncate mt-1"
              >
                <span>{role}</span>
                <VerificationBadge isVerified={interview.isVerified} />
              </Link>

              {/* Badges block */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <ResultBadge outcome={outcome} />
                <DifficultyBadge difficulty={difficulty} />
                {compensation && (
                  <Badge variant="info" className="font-mono">
                    {compensation}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Views count metadata */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 select-none bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 shrink-0 mt-0.5">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>{viewCount} {viewCount === 1 ? 'view' : 'views'}</span>
          </div>
        </div>

        {/* Metadata section */}
        <div className="mt-6 flex flex-wrap gap-y-3 items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Batch: {placementBatch}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {degree} - {branch}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-500">
              CGPA: {cgpa.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 font-semibold text-slate-600">
            <ThumbsUp className="h-3.5 w-3.5 text-slate-400" />
            <span>{helpfulCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
