import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useMemo, useCallback } from "react";
import {
  GET_BRAND_BASE,
  GET_BRAND_DETAIL,
  GET_BRAND_BY_SLUG,
  GET_BRANDS_BASE,
  GET_BRANDS_DETAIL,
  GET_ACTIVE_BRANDS,
  GET_BRANDS_BY_ACCOUNT,
} from "../graphql/queries/brand";
import { CREATE_ELECTRONIC_MENU } from "../graphql/mutations/brand";
import type {
  BrandInput,
  BrandBySlugInput,
  BrandsInput,
  ElectronicMenuCreateInput,
} from "../graphql-types";

// ====================================================================
// BRAND HOOKS - Domain-Specific React Hooks for Brand Operations
// ====================================================================
//
// Brand Domain Characteristics:
// - Brand operations, selection, and electronic menu creation
// - Multi-account brand management and filtering
// - Brand-city relationships and geographic context
// - Brand activation and status management
// - Electronic menu creation workflows
//
// This implementation follows the domain-specific optimization strategy
// outlined in the README, providing specialized hooks for brand-specific
// use cases rather than generic CRUD operations.
// ====================================================================

// ================== CORE QUERY HOOKS ==================

// Hook for getting a single brand with enhanced error handling
export const useBrand = ({
  input,
  level = "detail",
  skip = false,
}: {
  input: BrandInput;
  level?: "base" | "detail";
  skip?: boolean;
}) => {
  const query = level === "base" ? GET_BRAND_BASE : GET_BRAND_DETAIL;

  return useQuery(query, {
    variables: { input },
    skip,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

// Hook for getting a single brand by slug (optimized for public access)
export const useBrandBySlug = ({
  input,
  skip = false,
}: {
  input: BrandBySlugInput;
  skip?: boolean;
}) => {
  return useQuery(GET_BRAND_BY_SLUG, {
    variables: { input },
    skip,
    errorPolicy: "all",
    // Enable caching for public brand access
    fetchPolicy: "cache-first",
  });
};

// Hook for getting multiple brands with filtering optimization
export const useBrands = ({
  input,
  level = "detail",
  skip = false,
}: {
  input: BrandsInput;
  level?: "base" | "detail";
  skip?: boolean;
}) => {
  const query = level === "base" ? GET_BRANDS_BASE : GET_BRANDS_DETAIL;

  return useQuery(query, {
    variables: { input },
    skip,
    errorPolicy: "all",
    // Optimize for lists - use cache-first for base, cache-and-network for detail
    fetchPolicy: level === "base" ? "cache-first" : "cache-and-network",
  });
};

// Hook for getting active brands only (optimized for selection interfaces)
export const useActiveBrands = ({
  skip = false,
}: {
  skip?: boolean;
} = {}) => {
  return useQuery(GET_ACTIVE_BRANDS, {
    skip,
    errorPolicy: "all",
    // Cache active brands list for better UX
    fetchPolicy: "cache-first",
  });
};

// Hook for getting brands by account (core admin functionality)
export const useBrandsByAccount = ({
  accountId,
  skip = false,
}: {
  accountId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_BRANDS_BY_ACCOUNT, {
    variables: { accountId },
    skip: skip || !accountId,
    errorPolicy: "all",
    // Fresh data for account management
    fetchPolicy: "cache-and-network",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating electronic menu with comprehensive cache updates
export const useCreateElectronicMenu = () => {
  const client = useApolloClient();

  return useMutation(CREATE_ELECTRONIC_MENU, {
    update: (cache, { data }) => {
      // Optimistically update cache with new brand
      if (data?.electronicMenuCreate) {
        // Refetch related queries to ensure consistency
        client.refetchQueries({
          include: ["GetActiveBrands", "GetBrandsByAccount", "GetBrandsDetail"],
        });
      }
    },
    errorPolicy: "all",
  });
};

// ================== DOMAIN-SPECIFIC COMPOSITE HOOKS ==================

// Enhanced brand selection hook with validation and error handling
export const useBrandSelection = ({
  accountId,
  preselectedBrandId,
}: {
  accountId?: string;
  preselectedBrandId?: string;
}) => {
  const {
    data: brandsData,
    loading: brandsLoading,
    error: brandsError,
  } = useBrandsByAccount({
    accountId: accountId || "",
    skip: !accountId,
  });

  const {
    data: selectedBrandData,
    loading: brandLoading,
    error: brandError,
  } = useBrand({
    input: { id: preselectedBrandId || "" },
    level: "detail",
    skip: !preselectedBrandId,
  });

  // Validate that selected brand belongs to account
  const isValidSelection = useMemo(() => {
    if (!preselectedBrandId || !brandsData?.brands) return true;
    return brandsData.brands.some(
      (brand: any) => brand.id === preselectedBrandId
    );
  }, [preselectedBrandId, brandsData]);

  return {
    brands: brandsData?.brands || [],
    selectedBrand: selectedBrandData?.brand || null,
    loading: brandsLoading || brandLoading,
    error: brandsError || brandError,
    isValidSelection,
    hasMultipleBrands: (brandsData?.brands?.length || 0) > 1,
  };
};

// Hook for brand management workflow (admin use case)
export const useBrandManagement = ({
  accountId,
  includeInactive = false,
}: {
  accountId: string;
  includeInactive?: boolean;
}) => {
  const brandsQuery = useBrands({
    input: {
      filter: {
        accountsId: [accountId],
        ...(includeInactive ? {} : { isActive: true }),
      },
    },
    level: "detail",
    skip: !accountId,
  });

  const activeBrandsCount = useMemo(() => {
    return (
      brandsQuery.data?.brands?.filter((brand: any) => brand.isActive)
        ?.length || 0
    );
  }, [brandsQuery.data]);

  const inactiveBrandsCount = useMemo(() => {
    return (
      brandsQuery.data?.brands?.filter((brand: any) => !brand.isActive)
        ?.length || 0
    );
  }, [brandsQuery.data]);

  return {
    brands: brandsQuery.data?.brands || [],
    activeBrandsCount,
    inactiveBrandsCount,
    totalBrands: brandsQuery.data?.brands?.length || 0,
    loading: brandsQuery.loading,
    error: brandsQuery.error,
    refetch: brandsQuery.refetch,
  };
};

// Hook for electronic menu creation workflow
export const useElectronicMenuWorkflow = () => {
  const [createElectronicMenu, createMutationResult] =
    useCreateElectronicMenu();

  const createMenu = useCallback(
    async (input: ElectronicMenuCreateInput) => {
      try {
        const result = await createElectronicMenu({
          variables: { input },
        });
        return {
          success: true,
          brand: result.data?.electronicMenuCreate,
          error: null,
        };
      } catch (error) {
        return {
          success: false,
          brand: null,
          error: error as Error,
        };
      }
    },
    [createElectronicMenu]
  );

  return {
    createMenu,
    loading: createMutationResult.loading,
    error: createMutationResult.error,
    data: createMutationResult.data,
  };
};

// Hook for brand context (used across multiple domains)
export const useBrandContext = ({
  brandId,
  level = "detail",
}: {
  brandId: string;
  level?: "base" | "detail";
}) => {
  const brandQuery = useBrand({
    input: { id: brandId },
    level,
    skip: !brandId,
  });

  const brand = brandQuery.data?.brand;

  // Extract useful context information
  const brandContext = useMemo(() => {
    if (!brand) return null;

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      isActive: brand.isActive,
      cities: brand.cities || [],
      points: brand.points || [],
      hasMultipleCities: (brand.cities?.length || 0) > 1,
      hasMultiplePoints: (brand.points?.length || 0) > 1,
    };
  }, [brand]);

  return {
    brand,
    brandContext,
    loading: brandQuery.loading,
    error: brandQuery.error,
    refetch: brandQuery.refetch,
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const BRAND_HOOKS = {
  // Core query hooks
  useBrand,
  useBrandBySlug,
  useBrands,
  useActiveBrands,
  useBrandsByAccount,

  // Mutation hooks
  useCreateElectronicMenu,

  // Domain-specific composite hooks
  useBrandSelection,
  useBrandManagement,
  useElectronicMenuWorkflow,
  useBrandContext,
} as const;

// ================== DOMAIN-SPECIFIC UTILITIES ==================

// Brand validation utilities
export const brandUtils = {
  // Check if brand has active points in a city
  hasActivePointsInCity: (brand: any, cityId: string) => {
    return brand?.points?.some(
      (point: any) => point.cityId === cityId && point.isActive
    );
  },

  // Get primary city for brand (highest priority)
  getPrimaryCity: (brand: any) => {
    if (!brand?.brandCities?.length) return null;
    return brand.brandCities.reduce((primary: any, current: any) => {
      return !primary || current.priority > primary.priority
        ? current
        : primary;
    }).city;
  },

  // Check if brand supports specific order type
  supportsOrderType: (brand: any, orderType: string) => {
    // This would be extended based on actual brand configuration
    return brand?.isActive;
  },

  // Format brand display name with context
  getDisplayName: (brand: any, includeCity = false) => {
    if (!brand) return "";
    if (!includeCity) return brand.name;

    const primaryCity = brandUtils.getPrimaryCity(brand);
    return primaryCity ? `${brand.name} (${primaryCity.name})` : brand.name;
  },
} as const;
