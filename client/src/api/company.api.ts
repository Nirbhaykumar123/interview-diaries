import { api } from '../lib/api';
import { CompanyData } from '../components/company/CompanyCard';

export interface GetCompaniesResponse {
  status: string;
  data: {
    companies: CompanyData[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface GetCompanyResponse {
  status: string;
  data: {
    company: CompanyData;
  };
}

export interface GetSuggestionsResponse {
  status: string;
  data: {
    suggestions: Pick<CompanyData, 'id' | 'name' | 'slug' | 'logoUrl'>[];
  };
}

export const companyApi = {
  /**
   * Fetch paginated list of companies with optional filters
   */
  getCompanies: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    isHiring?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetCompaniesResponse['data']> => {
    const response = await api.get<GetCompaniesResponse>('/companies', { params });
    return response.data.data;
  },

  /**
   * Fetch a single company by its unique SEO slug
   */
  getCompanyBySlug: async (slug: string): Promise<CompanyData> => {
    const response = await api.get<GetCompanyResponse>(`/companies/slug/${slug}`);
    return response.data.data.company;
  },

  /**
   * Fetch a single company by its primary UUID key
   */
  getCompanyById: async (id: string): Promise<CompanyData> => {
    const response = await api.get<GetCompanyResponse>(`/companies/${id}`);
    return response.data.data.company;
  },

  /**
   * Fetch lightweight autocomplete typeahead suggestions
   */
  getSuggestions: async (query: string): Promise<GetSuggestionsResponse['data']['suggestions']> => {
    const response = await api.get<GetSuggestionsResponse>('/companies/search/suggestions', {
      params: { q: query },
    });
    return response.data.data.suggestions;
  },

  /**
   * Register a new company profile (Requires active auth access token headers)
   */
  createCompany: async (data: {
    name: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    industry?: string;
    location?: string;
    isHiring?: boolean;
  }): Promise<CompanyData> => {
    const response = await api.post<GetCompanyResponse>('/companies', data);
    return response.data.data.company;
  },
};
