// ====================================================================
// @restomenu/core - Comprehensive GraphQL SDK for Restomenu Platform
// ====================================================================

// Import required classes for SDK interface
import { RestomenuManagers, createOptimizedCache } from "./managers";

// ================== TYPES ==================
export * from "./types";

// ================== GRAPHQL OPERATIONS ==================
// Export all GraphQL fragments, queries, mutations, and utilities
export * from "./graphql";

// Export specific collections for convenience
export {
  FRAGMENTS,
  PRODUCT_QUERIES,
  CATEGORY_QUERIES,
  USER_QUERIES,
  ORDER_QUERIES,
  BRAND_QUERIES,
  CITY_QUERIES,
  POINT_QUERIES,
} from "./graphql";

export {
  PRODUCT_MUTATIONS,
  CATEGORY_MUTATIONS,
  USER_MUTATIONS,
  ORDER_MUTATIONS,
} from "./graphql";

export { COMPOSITE_OPERATIONS, QUERY_UTILS, GET_MENU_DATA } from "./graphql";

// ================== REACT HOOKS ==================
// Export all React hooks for easy integration
export * from "./hooks";

// Export specific hook collections for convenience
export { PRODUCT_HOOKS, CATEGORY_HOOKS, MENU_HOOKS } from "./hooks";
export {
  BRAND_HOOKS,
  CITY_HOOKS,
  ORDER_HOOKS,
  POINT_HOOKS,
  USER_HOOKS,
} from "./hooks";

// Export commonly used hooks directly
export {
  useProduct,
  useProducts,
  useAvailableProducts,
  useMenuProducts,
  useProductFormData,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategory,
  useCategories,
  useMenuCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useMenuData,
  useOrganizedMenuData,
  useMenuFilter,
} from "./hooks";

// ================== BUSINESS MANAGERS ==================
// Export high-level business logic managers
export * from "./managers";

// Export specific managers for convenience
export {
  ProductManager,
  ProductManagerFactory,
  CategoryManager,
  CategoryManagerFactory,
  MenuManager,
  MenuManagerFactory,
  RestomenuManagers,
  CacheManager,
  PerformanceMonitor,
  createOptimizedCache,
} from "./managers";

// Export manager types
export type {
  ProductManagerConfig,
  ProductFilter,
  CreateProductInput,
  CategoryManagerConfig,
  CategoryFilter,
  CreateCategoryInput,
  CategoryHierarchy,
  MenuManagerConfig,
  MenuFilter,
  MenuData,
} from "./managers";

// ================== UTILITIES ==================
export * from "./utils";

// ================== CONSTANTS ==================
export * from "./constants";

// ================== SDK METADATA ==================
export const SDK_VERSION = "1.0.0";
export const SDK_NAME = "@restomenu/core";
export const SDK_DESCRIPTION =
  "Comprehensive GraphQL SDK for Restomenu Platform";

// SDK feature flags and configuration
export const SDK_FEATURES = {
  GRAPHQL_OPERATIONS: true,
  REACT_HOOKS: true,
  BUSINESS_MANAGERS: true,
  TYPESCRIPT_SUPPORT: true,
  APOLLO_CLIENT_INTEGRATION: true,
  FRAGMENT_COMPOSITION: true,
  COMPOSITE_OPERATIONS: true,
  CACHE_OPTIMIZATION: true,
  PERFORMANCE_MONITORING: true,
} as const;

// Export main SDK interface for easy usage
export const RestoMenuSDK = {
  version: SDK_VERSION,
  name: SDK_NAME,
  description: SDK_DESCRIPTION,
  features: SDK_FEATURES,

  // Quick access to main functionality
  createManagers: (
    apolloClient: any,
    defaults?: {
      brandId?: string;
      pointId?: string;
      orderType?: "DELIVERY" | "PICKUP";
    }
  ) => new RestomenuManagers(apolloClient, defaults),

  createOptimizedCache,
} as const;
