import { Link } from 'react-router-dom';
import { Briefcase, MapPin, ExternalLink } from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import Badge from '../common/Badge';
import { Card, CardContent } from '../common/Card';
import { truncateText } from '../../utils';

export interface CompanyData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  isHiring: boolean;
  interviewCount: number;
}

interface CompanyCardProps {
  company: CompanyData;
}

/**
 * CompanyCard renders a summarizing card block for a single company row,
 * highlighting details like location, industry tags, and hiring badges.
 */
export default function CompanyCard({ company }: CompanyCardProps) {
  const { name, slug, description, logoUrl, website, industry, location, interviewCount } = company;

  return (
    <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200/80 hover:border-indigo-200/60 hover:bg-indigo-50/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <CompanyLogo name={name} logoUrl={logoUrl} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/companies/${slug}`}
                className="text-base font-bold text-slate-900 hover:text-indigo-600 group-hover:text-indigo-600 transition-colors truncate"
              >
                {name}
              </Link>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-600 hover:scale-110 p-0.5 transition-all"
                  aria-label={`Visit ${name} website`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            
            {/* Tag details */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {industry && <Badge variant="default">{industry}</Badge>}
            </div>
          </div>
        </div>

        {/* Short description */}
        <p className="mt-4 text-xs text-slate-500 leading-relaxed min-h-[40px]">
          {description ? truncateText(description, 100) : 'No company description provided.'}
        </p>

        {/* Footer info statistics */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">{location || 'Remote / Multiple'}</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            <span>{interviewCount} {interviewCount === 1 ? 'Interview' : 'Interviews'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
