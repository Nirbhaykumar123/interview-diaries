import { useState, useEffect } from 'react';
import CompanySearchBar from '../components/company/CompanySearchBar';
import CompanyFilter from '../components/company/CompanyFilter';
import CompanyGrid from '../components/company/CompanyGrid';
import Pagination from '../components/common/Pagination';
import { useCompaniesQuery } from '../hooks';
import useDebounce from '../hooks/useDebounce';

const INDUSTRIES_LIST = ['Technology', 'E-Commerce', 'Finance', 'Consulting', 'Healthcare'];

/**
 * CompaniesPage displays the lists of companies registered in the platform,
 * offering interactive name search inputs and industry filter tags.
 */
export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  // Reset page to 1 whenever filters change to avoid search queries landing out of bounds
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, industry]);

  const { data, isLoading, error } = useCompaniesQuery({
    page,
    limit: 6,
    search: debouncedSearch || undefined,
    industry: industry || undefined,
  });

  const handleClearFilters = () => {
    setSearch('');
    setIndustry('');
  };

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-bold text-red-600">Failed to load companies</h2>
        <p className="text-sm text-slate-500 mt-2">Please check your network and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Browse Companies</h1>
        <p className="mt-2 text-sm text-slate-500">
          Explore organizations and read about actual interview rounds shared by students.
        </p>
      </div>

      {/* Control panel (Search & Filter) */}
      <div className="space-y-4">
        <CompanySearchBar value={search} onChange={setSearch} />
        <CompanyFilter
          selectedIndustry={industry}
          onIndustryChange={setIndustry}
          industriesList={INDUSTRIES_LIST}
        />
      </div>

      {/* Results Feed Grid */}
      <CompanyGrid
        companies={data?.companies || []}
        isLoading={isLoading}
        onClearFilters={handleClearFilters}
      />

      {/* Pagination component */}
      {data && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          hasNextPage={data.pagination.hasNextPage}
          hasPreviousPage={data.pagination.hasPreviousPage}
        />
      )}
    </div>
  );
}
