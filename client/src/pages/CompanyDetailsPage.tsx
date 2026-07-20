import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Globe } from 'lucide-react';
import CompanyLogo from '../components/company/CompanyLogo';
import CompanyStats from '../components/company/CompanyStats';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import NotFoundPage from './error/NotFoundPage';
import InterviewCard from '../components/interview/InterviewCard';
import Pagination from '../components/common/Pagination';
import { useCompanyBySlugQuery, useInterviewsQuery } from '../hooks';

/**
 * CompanyDetailsPage showcases detailed statistics and listed interview round experiences
 * associated with a single company.
 */
export default function CompanyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  // Fetch company details by SEO slug
  const { data: company, isLoading: companyLoading, error: companyError } = useCompanyBySlugQuery(slug || '');

  // Fetch interviews for this company
  const { data: interviewData, isLoading: interviewsLoading } = useInterviewsQuery({
    companyId: company?.id,
    page,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const isLoading = companyLoading || (company && interviewsLoading);

  if (isLoading) {
    return <Loader fullScreen message="Retrieving company profile..." />;
  }

  if (companyError || !company) {
    return <NotFoundPage />;
  }

  const interviews = interviewData?.interviews || [];
  const pagination = interviewData?.pagination || { page: 1, totalPages: 1, totalItems: 0, hasNextPage: false, hasPreviousPage: false };

  return (
    <div className="space-y-8">
      {/* Back button link */}
      <div>
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Companies
        </Link>
      </div>

      {/* Main Company Profile Header Card */}
      <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="lg" />
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{company.name}</h1>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {company.description || 'No company description available.'}
          </p>
        </div>
      </div>

      {/* Statistics counters section */}
      <CompanyStats
        interviewCount={company.interviewCount}
        location={company.location}
      />

      {/* Experiences feed block */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Interview Experiences</h2>
          <Link to="/dashboard/interviews/create">
            <Button variant="primary" size="sm">
              Add Experience
            </Button>
          </Link>
        </div>
        
        {interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
            
            {pagination.totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400 font-semibold">
            No interview experiences shared for {company.name} yet. Be the first to share!
          </div>
        )}
      </div>
    </div>
  );
}
