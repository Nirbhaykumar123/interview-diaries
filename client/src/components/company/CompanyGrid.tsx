import CompanyCard, { CompanyData } from './CompanyCard';
import CompanySkeleton from './CompanySkeleton';
import EmptyState from '../common/EmptyState';

interface CompanyGridProps {
  companies: CompanyData[];
  isLoading: boolean;
  onClearFilters?: () => void;
}

/**
 * CompanyGrid renders a responsive layout wrapping loaded cards or loading placeholders.
 */
export default function CompanyGrid({ companies, isLoading, onClearFilters }: CompanyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CompanySkeleton key={index} />
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <EmptyState
        title="No companies found"
        description="Try adjusting your keywords, industry categories, or hiring filter constraints."
        actionText={onClearFilters ? "Reset Filters" : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
