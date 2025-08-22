import { gql } from "@apollo/client";
import {
  CATEGORY_BASE_FRAGMENT,
  CATEGORY_DETAIL_FRAGMENT,
  CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT,
} from "../fragments";

// ====================================================================
// CATEGORY QUERIES - Standardized GraphQL queries for categories
// ====================================================================

// ================== BASIC QUERIES ==================

// Get single category with minimal fields
export const GET_CATEGORY_BASE = gql`
  query GetCategoryBase($input: CategoryInput!) {
    category(input: $input) {
      ...CategoryBase
    }
  }
  ${CATEGORY_BASE_FRAGMENT}
`;

// Get single category with detailed information
export const GET_CATEGORY_DETAIL = gql`
  query GetCategoryDetail($input: CategoryInput!) {
    category(input: $input) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get categories with minimal fields (for lists)
export const GET_CATEGORIES_BASE = gql`
  query GetCategoriesBase($input: CategoriesInput!) {
    categories(input: $input) {
      ...CategoryBase
    }
  }
  ${CATEGORY_BASE_FRAGMENT}
`;

// Get categories with detailed information
export const GET_CATEGORIES_DETAIL = gql`
  query GetCategoriesDetail($input: CategoriesInput!) {
    categories(input: $input) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// ================== SPECIALIZED QUERIES ==================

// Get categories with products count for menu display
export const GET_CATEGORIES_WITH_PRODUCTS_COUNT = gql`
  query GetCategoriesWithProductsCount(
    $brandId: Uuid!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    categories(
      input: {
        brandId: $brandId
        filter: {
          isActive: true
          pointBinds: { pointId: $pointId, orderType: $orderType }
          productExists: {
            isActive: true
            pointBinds: { pointId: $pointId, orderType: $orderType }
          }
        }
      }
    ) {
      ...CategoryWithProductsCount
      productsCount(
        input: {
          filter: {
            isActive: true
            pointBinds: { pointId: $pointId, orderType: $orderType }
          }
        }
      )
    }
  }
  ${CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT}
`;

// Get categories available for a specific point and order type
export const GET_AVAILABLE_CATEGORIES = gql`
  query GetAvailableCategories(
    $brandId: Uuid!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    categories(
      input: {
        brandId: $brandId
        filter: {
          isActive: true
          pointBinds: { pointId: $pointId, orderType: $orderType }
        }
      }
    ) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// Get categories for a specific brand (admin view)
export const GET_BRAND_CATEGORIES = gql`
  query GetBrandCategories($brandId: Uuid!) {
    categories(input: { brandId: $brandId, filter: { isActive: true } }) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// Get all categories for a brand (including inactive, for admin)
export const GET_ALL_BRAND_CATEGORIES = gql`
  query GetAllBrandCategories($brandId: Uuid!) {
    categories(input: { brandId: $brandId }) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// Get parent categories only
export const GET_PARENT_CATEGORIES = gql`
  query GetParentCategories($brandId: Uuid!) {
    categories(
      input: { brandId: $brandId, filter: { isActive: true, parentId: null } }
    ) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// Get subcategories for a parent category
export const GET_SUBCATEGORIES = gql`
  query GetSubcategories($brandId: Uuid!, $parentId: Uuid!) {
    categories(
      input: {
        brandId: $brandId
        filter: { isActive: true, parentId: $parentId }
      }
    ) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const CATEGORY_QUERIES = {
  // Single category queries
  GET_CATEGORY_BASE,
  GET_CATEGORY_DETAIL,

  // Multiple categories queries
  GET_CATEGORIES_BASE,
  GET_CATEGORIES_DETAIL,

  // Specialized queries
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_AVAILABLE_CATEGORIES,
  GET_BRAND_CATEGORIES,
  GET_ALL_BRAND_CATEGORIES,
  GET_PARENT_CATEGORIES,
  GET_SUBCATEGORIES,
} as const;

// Legacy exports for backward compatibility
export const GET_CATEGORY = GET_CATEGORY_DETAIL;
export const GET_CATEGORIES = GET_CATEGORIES_DETAIL;
