import { useQuery, useMutation, useApolloClient } from "@apollo/client";
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
// BRAND HOOKS - React hooks for brand operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single brand
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
  });
};

// Hook for getting a single brand by slug
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
  });
};

// Hook for getting multiple brands
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
  });
};

// Hook for getting active brands only
export const useActiveBrands = ({
  skip = false,
}: {
  skip?: boolean;
} = {}) => {
  return useQuery(GET_ACTIVE_BRANDS, {
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting brands by account
export const useBrandsByAccount = ({
  accountId,
  skip = false,
}: {
  accountId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_BRANDS_BY_ACCOUNT, {
    variables: { accountId },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating electronic menu (brand + point)
export const useCreateElectronicMenu = () => {
  const client = useApolloClient();

  return useMutation(CREATE_ELECTRONIC_MENU, {
    update: () => {
      client.refetchQueries({
        include: ["GetActiveBrands", "GetBrandsByAccount"],
      });
    },
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for brand selection with caching
export const useBrandSelection = ({
  accountId,
  preselectedBrandId,
}: {
  accountId?: string;
  preselectedBrandId?: string;
}) => {
  const {
    data: brandsData,
    loading,
    error,
  } = useBrandsByAccount({
    accountId: accountId || "",
    skip: !accountId,
  });

  const { data: selectedBrandData } = useBrand({
    input: { id: preselectedBrandId || "" },
    skip: !preselectedBrandId,
  });

  return {
    brands: brandsData?.brands || [],
    selectedBrand: selectedBrandData?.brand || null,
    loading,
    error,
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const BRAND_HOOKS = {
  // Single brand hooks
  useBrand,
  useBrandBySlug,

  // Multiple brands hooks
  useBrands,
  useActiveBrands,
  useBrandsByAccount,

  // Mutation hooks
  useCreateElectronicMenu,

  // Composite hooks
  useBrandSelection,
} as const;
