import { useQuery } from "@apollo/client";
import { GET_MENU_DATA } from "../graphql/utils";

// ====================================================================
// MENU HOOKS - Composite hooks for menu operations
// ====================================================================

// Hook for getting complete menu data (categories + products)
export const useMenuData = ({
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
  const query = useQuery(GET_MENU_DATA, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });

  return {
    categories: query.data?.categories || [],
    products: query.data?.products || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Hook for organized menu data with products grouped by categories
export const useOrganizedMenuData = ({
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
  const { categories, products, loading, error, refetch } = useMenuData({
    brandId,
    pointId,
    orderType,
    skip,
  });

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
    loading,
    error,
    refetch,
  };
};

// Hook for menu filtering and search
export const useMenuFilter = ({
  brandId,
  pointId,
  orderType,
  searchTerm = "",
  selectedCategoryId = null,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  searchTerm?: string;
  selectedCategoryId?: string | null;
  skip?: boolean;
}) => {
  const {
    organizedCategories,
    uncategorizedProducts,
    loading,
    error,
    refetch,
  } = useOrganizedMenuData({ brandId, pointId, orderType, skip });

  // Filter data based on search term and selected category
  const filteredData = {
    categories: organizedCategories
      .filter((category: any) => {
        // If category is selected, show only that category
        if (selectedCategoryId && category.id !== selectedCategoryId) {
          return false;
        }

        // Filter by search term in category name or products
        if (searchTerm) {
          const categoryMatches = category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const hasMatchingProducts = category.products.some(
            (product: any) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
          return categoryMatches || hasMatchingProducts;
        }

        return true;
      })
      .map((category: any) => ({
        ...category,
        products: category.products.filter((product: any) => {
          if (!searchTerm) return true;
          return (
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        }),
      })),

    uncategorizedProducts: uncategorizedProducts.filter((product: any) => {
      if (!searchTerm) return true;
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }),
  };

  return {
    ...filteredData,
    loading,
    error,
    refetch,
    totalProducts: filteredData.categories.reduce(
      (total: number, cat: any) => total + cat.products.length,
      filteredData.uncategorizedProducts.length
    ),
  };
};

// ================== EXPORTED MENU HOOKS ==================
export const MENU_HOOKS = {
  useMenuData,
  useOrganizedMenuData,
  useMenuFilter,
} as const;
