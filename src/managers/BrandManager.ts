import { ApolloClient } from "@apollo/client";
import {
  GET_BRAND_DETAIL,
  GET_BRAND_BY_SLUG,
  GET_BRANDS_DETAIL,
  GET_ACTIVE_BRANDS,
  GET_BRANDS_BY_ACCOUNT,
} from "../graphql/queries/brand";
import { CREATE_ELECTRONIC_MENU } from "../graphql/mutations/brand";

// ====================================================================
// BRAND MANAGER - High-level business logic for brand operations
// ====================================================================

export interface BrandManagerConfig {
  client: ApolloClient<any>;
  defaultAccountId?: string;
}

export interface BrandFilter {
  accountIds?: string[];
  ids?: string[];
  isActive?: boolean;
}

export interface CreateElectronicMenuInput {
  accountId?: string;
  brandName: string;
  isPointAddressClean?: boolean;
  pointAddress: string;
  pointName?: string;
  pointPhone: string;
}

export class BrandManager {
  private client: ApolloClient<any>;
  private config: BrandManagerConfig;

  constructor(config: BrandManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get brand by ID with caching
   */
  async getById(brandId: string) {
    try {
      const result = await this.client.query({
        query: GET_BRAND_DETAIL,
        variables: { input: { id: brandId } },
        fetchPolicy: "cache-first",
      });

      return {
        brand: result.data.brand,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        brand: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get brand by slug with caching
   */
  async getBySlug(slug: string) {
    try {
      const result = await this.client.query({
        query: GET_BRAND_BY_SLUG,
        variables: { input: { slug } },
        fetchPolicy: "cache-first",
      });

      return {
        brand: result.data?.brandBySlug || null,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        brand: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get active brands for selection
   */
  async getActiveBrands() {
    try {
      const result = await this.client.query({
        query: GET_ACTIVE_BRANDS,
        fetchPolicy: "cache-first",
      });

      return {
        brands: result.data.brands || [],
        total: result.data.brands?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        brands: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get brands by account with filtering
   */
  async getBrandsByAccount(accountId?: string, filters: BrandFilter = {}) {
    const targetAccountId = accountId || this.config.defaultAccountId;

    if (!targetAccountId) {
      throw new Error("accountId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_BRANDS_BY_ACCOUNT,
        variables: { accountId: targetAccountId },
        fetchPolicy: "cache-first",
      });

      let brands = result.data.brands || [];

      // Apply client-side filters
      if (filters.isActive !== undefined) {
        brands = brands.filter(
          (brand: any) => brand.isActive === filters.isActive
        );
      }

      if (filters.ids) {
        brands = brands.filter((brand: any) => filters.ids!.includes(brand.id));
      }

      return {
        brands,
        total: brands.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        brands: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get brands with comprehensive filtering
   */
  async getBrands(filters: BrandFilter = {}) {
    try {
      const filterInput = {
        filter: {
          ...(filters.accountIds && { accountsId: filters.accountIds }),
          ...(filters.ids && { ids: filters.ids }),
          ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        },
      };

      const result = await this.client.query({
        query: GET_BRANDS_DETAIL,
        variables: { input: filterInput },
        fetchPolicy: "cache-first",
      });

      return {
        brands: result.data.brands || [],
        total: result.data.brands?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        brands: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  // ================== HIGH-LEVEL MUTATION METHODS ==================

  /**
   * Create electronic menu (brand + point creation)
   */
  async createElectronicMenu(input: CreateElectronicMenuInput) {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_ELECTRONIC_MENU,
        variables: {
          input: {
            ...input,
            accountId: input.accountId || this.config.defaultAccountId,
          },
        },
      });

      return {
        brand: result.data?.electronicMenuCreate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        brand: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Get brand summary for dashboard
   */
  async getBrandSummary(brandId: string) {
    try {
      const brandResult = await this.getById(brandId);

      if (brandResult.error) {
        throw brandResult.error;
      }

      const brand = brandResult.brand;

      return {
        summary: {
          brand,
          stats: {
            pointsCount: brand?.points?.length || 0,
            citiesCount: brand?.cities?.length || 0,
            isActive: brand?.isActive || false,
          },
        },
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        summary: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Check if brand is accessible by user
   */
  async checkBrandAccess(brandId: string, accountId?: string) {
    try {
      const targetAccountId = accountId || this.config.defaultAccountId;

      if (!targetAccountId) {
        return { hasAccess: false, error: "No account context" };
      }

      const result = await this.getBrandsByAccount(targetAccountId);

      if (result.error) {
        return { hasAccess: false, error: result.error.message };
      }

      const hasAccess = result.brands.some(
        (brand: any) => brand.id === brandId
      );

      return { hasAccess, error: null };
    } catch (error) {
      return { hasAccess: false, error: (error as Error).message };
    }
  }
}

// ================== FACTORY FUNCTION ==================

export class BrandManagerFactory {
  static create(config: BrandManagerConfig): BrandManager {
    return new BrandManager(config);
  }

  static createWithDefaults(
    client: ApolloClient<any>,
    defaultAccountId?: string
  ): BrandManager {
    const config: BrandManagerConfig = { client };
    if (defaultAccountId !== undefined) {
      config.defaultAccountId = defaultAccountId;
    }
    return new BrandManager(config);
  }
}
