import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Reusable Pagination controls bar.
 * Renders numbered page layout triggers and arrow selectors.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-xl shadow-sm">
      {/* Mobile view simple paginator */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          variant="outline"
          size="sm"
          className="ml-3"
        >
          Next
        </Button>
      </div>

      {/* Desktop view numbered layout selectors */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Showing Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Number indicators */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isSelected = pageNum === currentPage;
              
              return (
                <Button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  variant={isSelected ? 'primary' : 'outline'}
                  className="h-9 w-9 rounded-lg text-xs"
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
