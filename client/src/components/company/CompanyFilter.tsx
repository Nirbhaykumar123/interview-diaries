interface CompanyFilterProps {
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
  industriesList: string[];
}

/**
 * CompanyFilter renders dropdown fields for industry categories.
 */
export default function CompanyFilter({
  selectedIndustry,
  onIndustryChange,
  industriesList,
}: CompanyFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
      {/* Industry Select Option */}
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="industry-filter" className="sr-only">Filter by Industry</label>
        <select
          id="industry-filter"
          value={selectedIndustry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
        >
          <option value="">All Industries</option>
          {industriesList.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
