import { useQuery } from "@apollo/client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { GET_MENU_DATA } from "../graphql/utils";
import { MenuManager, MenuFilter } from "../managers/MenuManager";

// ====================================================================
// MENU HOOKS - Enhanced composite hooks for menu operations
// ====================================================================

// Enhanced hook for getting complete menu data with manager support
export const useMenuData = ({
  brandId,
  pointId,
  orderType,
  skip = false,
  filters,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  skip?: boolean;
  filters?: MenuFilter;
}) => {
  const query = useQuery(GET_MENU_DATA, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });

  // Apply client-side filtering if needed
  const processedData = useMemo(() => {
    if (!query.data || !filters) {
      return {
        categories: query.data?.categories || [],
        products: query.data?.products || [],
      };
    }

    // Apply basic filtering logic here
    let categories = query.data.categories || [];
    let products = query.data.products || [];

    // Filter by search term
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

    // Filter by category
    if (filters.categoryId) {
      products = products.filter((product: any) =>
        product.categoryBinds?.some(
          (bind: any) => bind.categoryId === filters.categoryId
        )
      );
    }

    // Filter by tags
    if (filters.tagsIdAny && filters.tagsIdAny.length > 0) {
      products = products.filter((product: any) => {
        const productTagIds = product.tags?.map((tag: any) => tag.id) || [];
        return filters.tagsIdAny!.some((tagId) =>
          productTagIds.includes(tagId)
        );
      });
    }

    return { categories, products };
  }, [query.data, filters]);

  return {
    categories: processedData.categories,
    products: processedData.products,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Enhanced hook for organized menu data with products grouped by categories
export const useOrganizedMenuData = ({
  brandId,
  pointId,
  orderType,
  skip = false,
  filters,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  skip?: boolean;
  filters?: MenuFilter;
}) => {
  const menuDataOptions: {
    brandId: string;
    pointId: string;
    orderType: string;
    skip?: boolean;
    filters?: MenuFilter;
  } = { brandId, pointId, orderType, skip };

  if (filters) {
    menuDataOptions.filters = filters;
  }

  const { categories, products, loading, error, refetch } =
    useMenuData(menuDataOptions);

  const processedData = useMemo(() => {
    // Organize products by categories
    const organizedData = categories.map((category: any) => ({
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
      organizedCategories: organizedData,
      uncategorizedProducts,
      allCategories: categories,
      allProducts: products,
    };
  }, [categories, products]);

  return {
    ...processedData,
    loading,
    error,
    refetch,
  };
};

// Enhanced hook for menu filtering and search with GraphQL schema support
export const useMenuFilter = ({
  brandId,
  pointId,
  orderType,
  searchTerm = "",
  selectedCategoryId = null,
  selectedCategoriesId = null,
  tagFilters = {},
  priceRange,
  sortBy = "name",
  sortOrder = "asc",
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  searchTerm?: string;
  selectedCategoryId?: string | null;
  selectedCategoriesId?: string[] | null;
  tagFilters?: {
    tagsIdAll?: string[];
    tagsIdAny?: string[];
    tagsIdNotAll?: string[];
    tagsIdNotAny?: string[];
  };
  priceRange?: { min?: number; max?: number };
  sortBy?: "name" | "price" | "popularity" | "category" | "categoryPriority";
  sortOrder?: "asc" | "desc";
  skip?: boolean;
}) => {
  // Build comprehensive filters
  const filters: MenuFilter = useMemo(() => {
    const result: MenuFilter = {};

    if (searchTerm) result.searchTerm = searchTerm;
    if (selectedCategoryId) result.categoryId = selectedCategoryId;
    if (selectedCategoriesId) result.categoriesId = selectedCategoriesId;
    if (priceRange) result.priceRange = priceRange;
    if (sortBy) result.sortBy = sortBy;
    if (sortOrder) result.sortOrder = sortOrder;

    // Add tag filters
    if (tagFilters.tagsIdAll) result.tagsIdAll = tagFilters.tagsIdAll;
    if (tagFilters.tagsIdAny) result.tagsIdAny = tagFilters.tagsIdAny;
    if (tagFilters.tagsIdNotAll) result.tagsIdNotAll = tagFilters.tagsIdNotAll;
    if (tagFilters.tagsIdNotAny) result.tagsIdNotAny = tagFilters.tagsIdNotAny;

    return result;
  }, [
    searchTerm,
    selectedCategoryId,
    selectedCategoriesId,
    tagFilters,
    priceRange,
    sortBy,
    sortOrder,
  ]);

  const organizedMenuOptions: {
    brandId: string;
    pointId: string;
    orderType: string;
    skip?: boolean;
    filters?: MenuFilter;
  } = { brandId, pointId, orderType, skip };

  if (Object.keys(filters).length > 0) {
    organizedMenuOptions.filters = filters;
  }

  const {
    organizedCategories,
    uncategorizedProducts,
    loading,
    error,
    refetch,
  } = useOrganizedMenuData(organizedMenuOptions);

  // Additional client-side filtering for complex cases
  const filteredData = useMemo(() => {
    let categories = organizedCategories;
    let uncategorized = uncategorizedProducts;

    // Apply category selection filter
    if (selectedCategoryId && categories.length > 0) {
      categories = categories.filter((category: any) => {
        return category.id === selectedCategoryId;
      });
      uncategorized = []; // Clear if specific category selected
    }

    if (selectedCategoriesId && selectedCategoriesId.length > 0) {
      categories = categories.filter((category: any) => {
        return selectedCategoriesId.includes(category.id);
      });
    }

    // Filter categories that have products after filtering
    const categoriesWithProducts = categories.filter(
      (category: any) => category.products && category.products.length > 0
    );

    return {
      categories: categoriesWithProducts,
      uncategorizedProducts: uncategorized,
    };
  }, [
    organizedCategories,
    uncategorizedProducts,
    selectedCategoryId,
    selectedCategoriesId,
  ]);

  const totalProducts = useMemo(() => {
    return filteredData.categories.reduce(
      (total: number, cat: any) => total + (cat.products?.length || 0),
      filteredData.uncategorizedProducts.length
    );
  }, [filteredData]);

  return {
    ...filteredData,
    loading,
    error,
    refetch,
    totalProducts,
    appliedFilters: filters,
  };
};

// ================== ADVANCED MENU HOOKS ==================

// Hook for menu search with advanced capabilities
export const useMenuSearch = ({
  brandId,
  pointId,
  orderType,
  searchTerm,
  categoryFilter,
  tagFilters,
  sortBy = "relevance",
  limit = 20,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  searchTerm: string;
  categoryFilter?: string;
  tagFilters?: {
    tagsIdAll?: string[];
    tagsIdAny?: string[];
    tagsIdNotAll?: string[];
    tagsIdNotAny?: string[];
  };
  sortBy?: "relevance" | "name" | "price" | "category";
  limit?: number;
  skip?: boolean;
}) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // We'll need to create a MenuManager instance - this should be done via context or provider
  const performSearch = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2 || skip) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll use the basic menu data and apply search logic
      // In a real implementation, you'd want to inject the MenuManager
      const { categories, products } = await new Promise<{
        categories: any[];
        products: any[];
      }>((resolve) => {
        // This is a placeholder - you'd want to use proper data fetching
        resolve({ categories: [], products: [] });
      });

      // Simple client-side search implementation
      const searchTermLower = searchTerm.toLowerCase();

      const productResults = (products as any[])
        .filter((product: any) => {
          // Basic search matching
          const nameMatch = product.name
            .toLowerCase()
            .includes(searchTermLower);
          const descMatch = product.description
            ?.toLowerCase()
            .includes(searchTermLower);
          const tagMatch = product.tags?.some((tag: any) =>
            tag.name.toLowerCase().includes(searchTermLower)
          );

          return nameMatch || descMatch || tagMatch;
        })
        .map((product: any) => ({
          ...product,
          type: "product",
          relevanceScore: calculateSimpleRelevance(product, searchTermLower),
        }));

      const categoryResults = (categories as any[])
        .filter((category: any) =>
          category.name.toLowerCase().includes(searchTermLower)
        )
        .map((category: any) => ({
          ...category,
          type: "category",
          relevanceScore: 50, // Simple scoring
        }));

      let allResults = [...productResults, ...categoryResults];

      if (sortBy === "relevance") {
        allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      } else if (sortBy === "name") {
        allResults.sort((a, b) => a.name.localeCompare(b.name));
      }

      setSearchResults({
        results: allResults.slice(0, limit),
        totalResults: allResults.length,
        productCount: productResults.length,
        categoryCount: categoryResults.length,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    brandId,
    pointId,
    orderType,
    searchTerm,
    categoryFilter,
    tagFilters,
    sortBy,
    limit,
    skip,
  ]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return {
    searchResults,
    loading,
    error,
    refetch: performSearch,
  };
};

// Helper function for simple relevance calculation
const calculateSimpleRelevance = (product: any, searchTerm: string): number => {
  const name = product.name?.toLowerCase() || "";
  const description = product.description?.toLowerCase() || "";

  let score = 0;
  if (name === searchTerm) score += 100;
  else if (name.startsWith(searchTerm)) score += 80;
  else if (name.includes(searchTerm)) score += 60;

  if (description.includes(searchTerm)) score += 30;

  return score;
};

// Hook for products by tags with advanced filtering
export const useProductsByTags = ({
  brandId,
  pointId,
  orderType,
  tagsIdAll,
  tagsIdAny,
  tagsIdNotAll,
  tagsIdNotAny,
  categoryId,
  sortBy = "name",
  sortOrder = "asc",
  limit,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  tagsIdAll?: string[];
  tagsIdAny?: string[];
  tagsIdNotAll?: string[];
  tagsIdNotAny?: string[];
  categoryId?: string;
  sortBy?: "name" | "price" | "categoryPriority";
  sortOrder?: "asc" | "desc";
  limit?: number;
  skip?: boolean;
}) => {
  const filters: MenuFilter = useMemo(() => {
    const result: MenuFilter = {};

    if (tagsIdAll) result.tagsIdAll = tagsIdAll;
    if (tagsIdAny) result.tagsIdAny = tagsIdAny;
    if (tagsIdNotAll) result.tagsIdNotAll = tagsIdNotAll;
    if (tagsIdNotAny) result.tagsIdNotAny = tagsIdNotAny;
    if (categoryId) result.categoryId = categoryId;
    if (sortBy) result.sortBy = sortBy;
    if (sortOrder) result.sortOrder = sortOrder;

    return result;
  }, [
    tagsIdAll,
    tagsIdAny,
    tagsIdNotAll,
    tagsIdNotAny,
    categoryId,
    sortBy,
    sortOrder,
  ]);

  const menuDataOptions: {
    brandId: string;
    pointId: string;
    orderType: string;
    skip?: boolean;
    filters?: MenuFilter;
  } = { brandId, pointId, orderType, skip };

  if (Object.keys(filters).length > 0) {
    menuDataOptions.filters = filters;
  }

  const { products, loading, error, refetch } = useMenuData(menuDataOptions);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply tag filters
    if (tagsIdAll && tagsIdAll.length > 0) {
      result = result.filter((product: any) => {
        const productTagIds = product.tags?.map((tag: any) => tag.id) || [];
        return tagsIdAll.every((tagId) => productTagIds.includes(tagId));
      });
    }

    if (tagsIdAny && tagsIdAny.length > 0) {
      result = result.filter((product: any) => {
        const productTagIds = product.tags?.map((tag: any) => tag.id) || [];
        return tagsIdAny.some((tagId) => productTagIds.includes(tagId));
      });
    }

    if (tagsIdNotAll && tagsIdNotAll.length > 0) {
      result = result.filter((product: any) => {
        const productTagIds = product.tags?.map((tag: any) => tag.id) || [];
        return !tagsIdNotAll.every((tagId) => productTagIds.includes(tagId));
      });
    }

    if (tagsIdNotAny && tagsIdNotAny.length > 0) {
      result = result.filter((product: any) => {
        const productTagIds = product.tags?.map((tag: any) => tag.id) || [];
        return !tagsIdNotAny.some((tagId) => productTagIds.includes(tagId));
      });
    }

    // Apply category filter
    if (categoryId) {
      result = result.filter((product: any) =>
        product.categoryBinds?.some(
          (bind: any) => bind.categoryId === categoryId
        )
      );
    }

    // Apply limit
    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [
    products,
    tagsIdAll,
    tagsIdAny,
    tagsIdNotAll,
    tagsIdNotAny,
    categoryId,
    limit,
  ]);

  return {
    products: filteredProducts,
    loading,
    error,
    refetch,
    totalProducts: filteredProducts.length,
  };
};

// Hook for menu statistics
export const useMenuStatistics = ({
  brandId,
  pointId,
  orderType,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  skip?: boolean;
}) => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { products, categories } = useMenuData({
    brandId,
    pointId,
    orderType,
    skip,
  });

  const calculatedStats = useMemo(() => {
    if (!products || !categories) return null;

    const activeProducts = products.filter((p: any) => p.isActive);
    const inactiveProducts = products.filter((p: any) => !p.isActive);

    // Tag analysis
    const allTags = new Set<string>();
    const tagUsageCount = new Map<string, number>();
    products.forEach((product: any) => {
      product.tags?.forEach((tag: any) => {
        allTags.add(tag.id);
        tagUsageCount.set(tag.id, (tagUsageCount.get(tag.id) || 0) + 1);
      });
    });

    return {
      totalCategories: categories.length,
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      inactiveProducts: inactiveProducts.length,
      tagStatistics: {
        totalUniqueTags: allTags.size,
        averageTagsPerProduct:
          products.length > 0
            ? Math.round(
                (Array.from(tagUsageCount.values()).reduce((a, b) => a + b, 0) /
                  products.length) *
                  100
              ) / 100
            : 0,
        mostUsedTags: Array.from(tagUsageCount.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tagId, count]) => ({ tagId, count })),
      },
    };
  }, [products, categories]);

  return {
    statistics: calculatedStats,
    loading,
    error,
  };
};

// ================== EXPORTED MENU HOOKS ==================
export const MENU_HOOKS = {
  useMenuData,
  useOrganizedMenuData,
  useMenuFilter,
  useMenuSearch,
  useProductsByTags,
  useMenuStatistics,
} as const;
