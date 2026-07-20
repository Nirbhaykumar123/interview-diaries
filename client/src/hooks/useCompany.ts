import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';

/**
 * Hook to retrieve a paginated and filtered list of companies.
 * Uses placeholderData: keepPreviousData to keep previous pages active during navigation
 * and prevent screen flickering or shifts.
 */
export function useCompaniesQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  isHiring?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => companyApi.getCompanies(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to fetch a single company by its unique SEO slug.
 */
export function useCompanyBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ['company', 'slug', slug],
    queryFn: () => companyApi.getCompanyBySlug(slug),
    enabled: !!slug, // Only run the query if a valid slug is present
  });
}

/**
 * Hook to fetch lightweight search suggestions.
 */
export function useCompanySuggestionsQuery(query: string) {
  return useQuery({
    queryKey: ['company-suggestions', query],
    queryFn: () => companyApi.getSuggestions(query),
    enabled: query.trim().length >= 2, // Only fetch autocomplete suggestions if query has >= 2 characters
    staleTime: 60 * 1000, // Caches autocomplete inputs for 1 minute
  });
}

/**
 * Mutation hook to register a new company record.
 * Automatically invalidates the 'companies' query cache on success to trigger feed updates.
 */
export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.createCompany,
    onSuccess: (newCompany) => {
      // Invalidate the companies query cache list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      // Pre-seed the specific company cache to make detail navigation instant
      queryClient.setQueryData(['company', 'slug', newCompany.slug], newCompany);
    },
  });
}
