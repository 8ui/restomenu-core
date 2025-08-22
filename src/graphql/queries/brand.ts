import { gql } from "@apollo/client";
import { BRAND_BASE_FRAGMENT, BRAND_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// BRAND QUERIES - Standardized GraphQL queries for brands
// ====================================================================

// ================== BASIC QUERIES ==================

// Get single brand with minimal fields
export const GET_BRAND_BASE = gql`
  query GetBrandBase($input: BrandInput!) {
    brand(input: $input) {
      ...BrandBase
    }
  }
  ${BRAND_BASE_FRAGMENT}
`;

// Get single brand with detailed information
export const GET_BRAND_DETAIL = gql`
  query GetBrandDetail($input: BrandInput!) {
    brand(input: $input) {
      ...BrandDetail
    }
  }
  ${BRAND_DETAIL_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get brands with minimal fields (for lists)
export const GET_BRANDS_BASE = gql`
  query GetBrandsBase($input: BrandsInput!) {
    brands(input: $input) {
      ...BrandBase
    }
  }
  ${BRAND_BASE_FRAGMENT}
`;

// Get brands with detailed information
export const GET_BRANDS_DETAIL = gql`
  query GetBrandsDetail($input: BrandsInput!) {
    brands(input: $input) {
      ...BrandDetail
    }
  }
  ${BRAND_DETAIL_FRAGMENT}
`;

// ================== SPECIALIZED QUERIES ==================

// Get brand by slug
export const GET_BRAND_BY_SLUG = gql`
  query GetBrandBySlug($input: BrandBySlugInput!) {
    brandBySlug(input: $input) {
      ...BrandDetail
    }
  }
  ${BRAND_DETAIL_FRAGMENT}
`;

// Get active brands only
export const GET_ACTIVE_BRANDS = gql`
  query GetActiveBrands {
    brands(input: { filter: { isActive: true } }) {
      ...BrandDetail
    }
  }
  ${BRAND_DETAIL_FRAGMENT}
`;

// Get brands by account (using correct field name)
export const GET_BRANDS_BY_ACCOUNT = gql`
  query GetBrandsByAccount($accountId: Uuid!) {
    brands(input: { filter: { accountsId: [$accountId] } }) {
      ...BrandDetail
    }
  }
  ${BRAND_DETAIL_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const BRAND_QUERIES = {
  // Single brand queries
  GET_BRAND_BASE,
  GET_BRAND_DETAIL,
  GET_BRAND_BY_SLUG,

  // Multiple brands queries
  GET_BRANDS_BASE,
  GET_BRANDS_DETAIL,

  // Specialized queries
  GET_ACTIVE_BRANDS,
  GET_BRANDS_BY_ACCOUNT,
} as const;

// Legacy exports for backward compatibility
export const GET_BRAND = GET_BRAND_DETAIL;
export const GET_BRANDS = GET_BRANDS_DETAIL;
