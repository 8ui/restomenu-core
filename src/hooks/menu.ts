import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useMemo, useCallback } from "react";
import { GET_MENU_DATA } from "../graphql/utils";
import {
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_AVAILABLE_CATEGORIES,
  GET_CATEGORIES_DETAIL,
} from "../graphql/queries/category";
import {
  GET_PRODUCTS_FOR_MENU,
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_FILTERED_PRODUCTS,
} from "../graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
} from "../graphql/mutations/product";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_CATEGORY_ACTIVE,
} from "../graphql/mutations/category";
import type {
  ProductInput,
  ProductsInput,
  ProductCreateInput,
  ProductUpdateInput,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "../graphql-types";

// OrderType from existing graphql-types (simplified for compatibility)
type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";

// ====================================================================
// MENU HOOKS - React hooks for menu operations following order.ts patterns
// ====================================================================

// Interface for MenuInput (similar to OrderInput pattern)
export interface MenuInput {
  brandId: string;
  pointId: string;
  orderType: OrderType;
}

// Interface for menu filter (enhanced from existing)
export interface MenuFilterInput {
  searchTerm?: string;
  categoryId?: string;
  categoriesId?: string[];
  tagsIdAll?: string[];
  tagsIdAny?: string[];
  tagsIdNotAll?: string[];
  tagsIdNotAny?: string[];
  priceRange?: { min?: number; max?: number };
  sortBy?: "name" | "price" | "popularity" | "category" | "categoryPriority";
  sortOrder?: "asc" | "desc";
}

// Legacy interface for backward compatibility
export interface MenuFilter extends MenuFilterInput {}

// ================== QUERY HOOKS ==================

// Hook for getting menu data with flexible detail levels (following order.ts pattern)
export const useMenuData = ({
  input,
  level = "detail",
  skip = false,
  pollInterval,
}: {
  input: MenuInput;
  level?: "basic" | "detail" | "full";
  skip?: boolean;
  pollInterval?: number;
}) => {
  const getQuery = () => {
    // For now using the composite query, can be expanded with specialized queries
    return GET_MENU_DATA;
  };

  const queryOptions: any = {
    variables: {
      brandId: input.brandId,
      pointId: input.pointId,
      orderType: input.orderType,
    },
    skip,
    errorPolicy: "all",
  };

  if (pollInterval) {
    queryOptions.pollInterval = pollInterval;
    queryOptions.notifyOnNetworkStatusChange = true;
  }

  return useQuery(getQuery(), queryOptions);
};

// Hook for getting menu categories with hierarchy
export const useMenuCategories = ({
  brandId,
  pointId,
  orderType,
  includeProducts = false,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  includeProducts?: boolean;
  skip?: boolean;
}) => {
  const query = includeProducts
    ? GET_CATEGORIES_WITH_PRODUCTS_COUNT
    : GET_AVAILABLE_CATEGORIES;

  return useQuery(query, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting menu products with filtering
export const useMenuProducts = ({
  brandId,
  pointId,
  orderType,
  categoryFilter,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  categoryFilter?: string[];
  skip?: boolean;
}) => {
  const input: ProductsInput = useMemo(() => {
    const filter: any = {
      isActive: true,
      pointBinds: { pointId, orderType },
    };

    if (categoryFilter && categoryFilter.length > 0) {
      filter.categoriesId = categoryFilter;
    }

    return {
      brandId,
      filter,
    };
  }, [brandId, pointId, orderType, categoryFilter]);

  return useQuery(GET_PRODUCTS_FOR_MENU, {
    variables: { input, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for menu items with real-time updates
export const useMenuItems = ({
  brandId,
  pointId,
  orderType,
  pollInterval = 60000,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  pollInterval?: number;
  skip?: boolean;
}) => {
  return useQuery(GET_AVAILABLE_PRODUCTS, {
    variables: { brandId, pointId, orderType },
    skip,
    pollInterval,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating menu items (products)
export const useCreateMenuItem = () => {
  const client = useApolloClient();

  return useMutation(CREATE_PRODUCT, {
    update: (cache, { data }) => {
      client.refetchQueries({
        include: [
          "GetMenuData",
          "GetAvailableProducts",
          "GetProductsForMenu",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating menu items (products)
export const useUpdateMenuItem = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_PRODUCT, {
    optimisticResponse: (variables: any) => ({
      productUpdate: {
        __typename: "Product",
        id: variables.input.id,
        ...variables.input,
      },
    }),
    update: (cache, { data }) => {
      if (data?.productUpdate) {
        const productRef = cache.identify(data.productUpdate);
        if (productRef) {
          cache.modify({
            id: productRef,
            fields: {
              name: () => data.productUpdate.name,
              description: () => data.productUpdate.description,
              isActive: () => data.productUpdate.isActive,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });
};

// Hook for deleting menu items (products)
export const useDeleteMenuItem = () => {
  const client = useApolloClient();

  return useMutation(DELETE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      if (data && variables) {
        // Remove from cache
        cache.evict({
          id: cache.identify({
            __typename: "Product",
            id: (variables as any).input.id,
          }),
        });
        cache.gc();
      }
      client.refetchQueries({
        include: [
          "GetMenuData",
          "GetAvailableProducts",
          "GetProductsForMenu",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating menu category
export const useUpdateMenuCategory = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_CATEGORY, {
    optimisticResponse: (variables: any) => ({
      categoryUpdate: {
        __typename: "Category",
        id: variables.input.id,
        ...variables.input,
      },
    }),
    update: (cache, { data }) => {
      if (data?.categoryUpdate) {
        const categoryRef = cache.identify(data.categoryUpdate);
        if (categoryRef) {
          cache.modify({
            id: categoryRef,
            fields: {
              name: () => data.categoryUpdate.name,
              isActive: () => data.categoryUpdate.isActive,
              priority: () => data.categoryUpdate.priority,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });
};

// Hook for menu item management (combined operations)
export const useMenuItemManagement = () => {
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const toggleItemActive = useMutation(TOGGLE_PRODUCT_ACTIVE, {
    optimisticResponse: (variables: any) => ({
      productUpdate: {
        __typename: "Product",
        id: variables.id,
        isActive: variables.isActive,
      },
    }),
    errorPolicy: "all",
  });

  return {
    createItem,
    updateItem,
    deleteItem,
    toggleItemActive,
  };
};

// ================== COMPOSITE HOOKS ==================

// Hook for comprehensive menu management
export const useMenuManagement = ({
  brandId,
  pointId,
  orderType,
  employeeRole,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  employeeRole?: string;
}) => {
  const menuData = useMenuData({
    input: { brandId, pointId, orderType },
    skip: !brandId || !pointId,
  });

  const { createItem, updateItem, deleteItem, toggleItemActive } =
    useMenuItemManagement();

  const updateCategory = useUpdateMenuCategory();

  // Menu state analysis
  const menuState = useMemo(() => {
    const categories = menuData.data?.categories || [];
    const products = menuData.data?.products || [];

    const activeProducts = products.filter((p: any) => p.isActive);
    const inactiveProducts = products.filter((p: any) => !p.isActive);

    const canEdit = employeeRole === "admin" || employeeRole === "manager";
    const canCreate = canEdit;
    const canDelete = employeeRole === "admin";

    return {
      canEdit,
      canCreate,
      canDelete,
      totalCategories: categories.length,
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      inactiveProducts: inactiveProducts.length,
      hasData: categories.length > 0 || products.length > 0,
    };
  }, [menuData.data, employeeRole]);

  // Management actions
  const managementActions = useMemo(
    () => ({
      createProduct: (input: ProductCreateInput) =>
        createItem[0]({ variables: { input } }),
      updateProduct: (input: ProductUpdateInput) =>
        updateItem[0]({ variables: { input } }),
      deleteProduct: (id: string) =>
        deleteItem[0]({
          variables: { input: { brandId, id } },
        }),
      toggleProductActive: (id: string, isActive: boolean) =>
        toggleItemActive[0]({
          variables: { id, brandId, isActive },
        }),
      updateCategory: (input: CategoryUpdateInput) =>
        updateCategory[0]({ variables: { input } }),
    }),
    [createItem, updateItem, deleteItem, toggleItemActive, updateCategory, brandId]
  );

  return {
    categories: menuData.data?.categories || [],
    products: menuData.data?.products || [],
    menuState,
    managementActions,
    loading: menuData.loading,
    error: menuData.error,
    refetch: menuData.refetch,
  };
};

// Hook for menu organization and display
export const useMenuOrganization = ({
  brandId,
  pointId,
  orderType,
  groupBy = "category",
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  groupBy?: "category" | "price" | "popularity";
}) => {
  const menuData = useMenuData({
    input: { brandId, pointId, orderType },
    skip: !brandId || !pointId,
  });

  const organizedData = useMemo(() => {
    const categories = menuData.data?.categories || [];
    const products = menuData.data?.products || [];

    if (groupBy === "category") {
      // Organize products by categories
      const organizedCategories = categories.map((category: any) => ({
        ...category,
        products: products.filter((product: any) =>
          product.categoryBinds?.some(
            (bind: any) => bind.categoryId === category.id
          )
        ),
      }));

      // Products without category
      const uncategorizedProducts = products.filter(
        (product: any) =>
          !product.categoryBinds || product.categoryBinds.length === 0
      );

      return {
        type: "category" as const,
        organizedCategories,
        uncategorizedProducts,
        allCategories: categories,
        allProducts: products,
      };
    } else if (groupBy === "price") {
      // Group by price ranges
      const priceRanges = [
        { label: "$0-10", min: 0, max: 10 },
        { label: "$10-25", min: 10, max: 25 },
        { label: "$25-50", min: 25, max: 50 },
        { label: "$50+", min: 50, max: Infinity },
      ];

      const groupedByPrice = priceRanges.map((range) => ({
        ...range,
        products: products.filter((product: any) => {
          const price = product.pricePoint || 0;
          return price >= range.min && price < range.max;
        }),
      }));

      return {
        type: "price" as const,
        priceGroups: groupedByPrice,
        allProducts: products,
      };
    }

    return {
      type: "default" as const,
      allCategories: categories,
      allProducts: products,
    };
  }, [menuData.data, groupBy]);

  return {
    ...organizedData,
    loading: menuData.loading,
    error: menuData.error,
    refetch: menuData.refetch,
  };
};

// Hook for menu filtering with real-time updates
export const useMenuFilter = ({
  brandId,
  pointId,
  orderType,
  filters,
  autoUpdate = true,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  filters: MenuFilterInput;
  autoUpdate?: boolean;
}) => {
  // Build GraphQL filter input
  const input: ProductsInput = useMemo(() => {
    const filter: any = {
      isActive: true,
      pointBinds: { pointId, orderType },
    };

    if (filters.categoryId) {
      filter.categoriesId = [filters.categoryId];
    } else if (filters.categoriesId && filters.categoriesId.length > 0) {
      filter.categoriesId = filters.categoriesId;
    }

    if (filters.tagsIdAll && filters.tagsIdAll.length > 0) {
      filter.tagsIdAll = filters.tagsIdAll;
    }

    if (filters.tagsIdAny && filters.tagsIdAny.length > 0) {
      filter.tagsIdAny = filters.tagsIdAny;
    }

    return { brandId, filter };
  }, [brandId, pointId, orderType, filters]);

  const query = useQuery(GET_FILTERED_PRODUCTS, {
    variables: { input, pointId, orderType },
    skip: !brandId || !pointId,
    errorPolicy: "all",
    pollInterval: autoUpdate ? 30000 : undefined,
  });

  // Apply client-side filtering for search term and other complex filters
  const filteredProducts = useMemo(() => {
    let products = query.data?.products || [];

    // Search term filtering
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      products = products.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.tags?.some((tag: any) =>
            tag.name.toLowerCase().includes(searchTerm)
          )
      );
    }

    // Price range filtering
    if (filters.priceRange) {
      products = products.filter((product: any) => {
        const price = product.pricePoint || 0;
        const { min, max } = filters.priceRange!;
        return (
          (min === undefined || price >= min) &&
          (max === undefined || price <= max)
        );
      });
    }

    // Sorting
    if (filters.sortBy) {
      products = [...products].sort((a: any, b: any) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            comparison = (a.pricePoint || 0) - (b.pricePoint || 0);
            break;
          case "category":
            const aCat = a.categoryBinds?.[0]?.categoryId || "";
            const bCat = b.categoryBinds?.[0]?.categoryId || "";
            comparison = aCat.localeCompare(bCat);
            break;
          default:
            comparison = 0;
        }
        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return products;
  }, [query.data, filters]);

  return {
    products: filteredProducts,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    appliedFilters: filters,
    totalProducts: filteredProducts.length,
  };
};

// Hook for advanced menu search
export const useMenuSearch = ({
  brandId,
  pointId,
  orderType,
  searchTerm,
  filters,
  sortBy = "relevance",
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  searchTerm: string;
  filters?: MenuFilterInput;
  sortBy?: "relevance" | "name" | "price" | "category";
}) => {
  // Build search filter
  const searchFilter = useMemo(() => {
    const filter: MenuFilterInput = {
      searchTerm,
      ...filters,
      sortBy,
    };
    return filter;
  }, [searchTerm, filters, sortBy]);

  const searchResults = useMenuFilter({
    brandId,
    pointId,
    orderType,
    filters: searchFilter,
    autoUpdate: false,
  });

  // Calculate relevance scores for search results
  const enhancedResults = useMemo(() => {
    if (!searchTerm || !searchResults.products) {
      return searchResults.products;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    return searchResults.products.map((product: any) => {
      let relevanceScore = 0;
      const name = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      // Name matching (highest priority)
      if (name === searchTermLower) relevanceScore += 100;
      else if (name.startsWith(searchTermLower)) relevanceScore += 80;
      else if (name.includes(searchTermLower)) relevanceScore += 60;

      // Description matching
      if (description.includes(searchTermLower)) relevanceScore += 30;

      // Tag matching
      product.tags?.forEach((tag: any) => {
        if (tag.name.toLowerCase().includes(searchTermLower)) {
          relevanceScore += 20;
        }
      });

      return {
        ...product,
        relevanceScore,
      };
    }).sort((a: any, b: any) => {
      if (sortBy === "relevance") {
        return b.relevanceScore - a.relevanceScore;
      }
      return 0; // Other sorting handled by useMenuFilter
    });
  }, [searchResults.products, searchTerm, sortBy]);

  return {
    searchResults: enhancedResults,
    totalResults: enhancedResults?.length || 0,
    loading: searchResults.loading,
    error: searchResults.error,
    refetch: searchResults.refetch,
  };
};

// ================== DOMAIN-SPECIFIC UTILITIES ==================

// Menu item validation utility
export const isValidMenuItemConfiguration = (item: any): boolean => {
  if (!item) return false;
  if (!item.name || typeof item.name !== "string" || item.name.trim().length === 0) return false;
  if (!item.brandId || typeof item.brandId !== "string") return false;
  if (item.priceSettings && (!item.priceSettings.price || item.priceSettings.price < 0)) return false;
  return true;
};

// Category hierarchy validation
export const isValidCategoryHierarchy = (categories: any[]): boolean => {
  if (!Array.isArray(categories)) return false;
  
  const categoryIds = new Set(categories.map(cat => cat.id));
  
  // Check for circular references
  for (const category of categories) {
    if (category.parentId && !categoryIds.has(category.parentId)) {
      return false; // Parent doesn't exist
    }
    
    // Check for circular reference (simplified)
    let current = category;
    const visited = new Set();
    while (current.parentId) {
      if (visited.has(current.id)) {
        return false; // Circular reference
      }
      visited.add(current.id);
      current = categories.find(c => c.id === current.parentId);
      if (!current) break;
    }
  }
  
  return true;
};

// Menu performance calculation utility
export const calculateMenuPerformance = (menuData: any) => {
  const products = menuData?.products || [];
  const categories = menuData?.categories || [];
  
  const activeProducts = products.filter((p: any) => p.isActive);
  const totalProducts = products.length;
  const averageProductsPerCategory = categories.length > 0 ? totalProducts / categories.length : 0;
  
  return {
    totalProducts,
    activeProducts: activeProducts.length,
    inactiveProducts: totalProducts - activeProducts.length,
    totalCategories: categories.length,
    averageProductsPerCategory: Math.round(averageProductsPerCategory * 100) / 100,
    activationRate: totalProducts > 0 ? (activeProducts.length / totalProducts) * 100 : 0,
  };
};

// Menu optimization suggestions
export const getMenuOptimizationSuggestions = (menuData: any) => {
  const suggestions = [];
  const performance = calculateMenuPerformance(menuData);
  
  if (performance.activationRate < 80) {
    suggestions.push({
      type: "warning",
      message: `${performance.inactiveProducts} products are inactive. Consider removing or reactivating them.`,
    });
  }
  
  if (performance.averageProductsPerCategory > 20) {
    suggestions.push({
      type: "info",
      message: "Some categories have many products. Consider creating subcategories for better organization.",
    });
  }
  
  if (performance.totalCategories === 0 && performance.totalProducts > 0) {
    suggestions.push({
      type: "error",
      message: "Products exist without categories. Organize products into categories for better navigation.",
    });
  }
  
  return suggestions;
};

// ================== LEGACY COMPATIBILITY LAYER ==================

// Legacy hook with deprecation warning
export const useMenuData_DEPRECATED = (args: any) => {
  console.warn(
    "useMenuData with legacy parameters is deprecated. Use the new useMenuData, useMenuManagement, or useMenuOrganization hooks instead."
  );
  return useMenuData({
    input: {
      brandId: args.brandId,
      pointId: args.pointId,
      orderType: args.orderType,
    },
    skip: args.skip,
  });
};

// Legacy organized menu data hook
export const useOrganizedMenuData_DEPRECATED = (args: any) => {
  console.warn(
    "useOrganizedMenuData is deprecated. Use useMenuOrganization instead."
  );
  return useMenuOrganization({
    brandId: args.brandId,
    pointId: args.pointId,
    orderType: args.orderType,
    groupBy: "category",
  });
};

// Legacy menu filter hook
export const useMenuFilter_DEPRECATED = (args: any) => {
  console.warn(
    "useMenuFilter with legacy parameters is deprecated. Use the new useMenuFilter hook instead."
  );
  
  const filters: MenuFilterInput = {
    searchTerm: args.searchTerm,
    categoryId: args.selectedCategoryId,
    categoriesId: args.selectedCategoriesId,
    tagsIdAll: args.tagFilters?.tagsIdAll,
    tagsIdAny: args.tagFilters?.tagsIdAny,
    tagsIdNotAll: args.tagFilters?.tagsIdNotAll,
    tagsIdNotAny: args.tagFilters?.tagsIdNotAny,
    priceRange: args.priceRange,
    sortBy: args.sortBy,
    sortOrder: args.sortOrder,
  };
  
  return useMenuFilter({
    brandId: args.brandId,
    pointId: args.pointId,
    orderType: args.orderType,
    filters,
    autoUpdate: true,
  });
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const MENU_HOOKS = {
  // Basic query hooks
  useMenuData,
  useMenuCategories,
  useMenuProducts,
  useMenuItems,

  // Basic mutation hooks
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUpdateMenuCategory,

  // Item management hooks
  useMenuItemManagement,

  // Advanced composite hooks
  useMenuManagement,
  useMenuOrganization,
  useMenuFilter,
  useMenuSearch,

  // Legacy compatibility (deprecated)
  useMenuData_DEPRECATED,
  useOrganizedMenuData_DEPRECATED,
  useMenuFilter_DEPRECATED,
} as const;

// Legacy exports for backward compatibility
export const useOrganizedMenuData = useOrganizedMenuData_DEPRECATED;
export const useProductsByTags = (args: any) => {
  console.warn("useProductsByTags is deprecated. Use useMenuFilter instead.");
  return useMenuFilter({
    brandId: args.brandId,
    pointId: args.pointId,
    orderType: args.orderType,
    filters: {
      tagsIdAll: args.tagsIdAll,
      tagsIdAny: args.tagsIdAny,
      tagsIdNotAll: args.tagsIdNotAll,
      tagsIdNotAny: args.tagsIdNotAny,
      categoryId: args.categoryId,
      sortBy: args.sortBy,
      sortOrder: args.sortOrder,
    },
  });
};

export const useMenuStatistics = (args: any) => {
  console.warn("useMenuStatistics is deprecated. Use calculateMenuPerformance utility instead.");
  const menuData = useMenuData({
    input: {
      brandId: args.brandId,
      pointId: args.pointId,
      orderType: args.orderType,
    },
    skip: args.skip,
  });
  
  const statistics = useMemo(() => {
    return calculateMenuPerformance(menuData.data);
  }, [menuData.data]);
  
  return {
    statistics,
    loading: menuData.loading,
    error: menuData.error,
  };
};