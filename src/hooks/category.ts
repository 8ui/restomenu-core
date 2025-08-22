import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  GET_CATEGORY_BASE,
  GET_CATEGORY_DETAIL,
  GET_CATEGORY_WITH_CHILDREN,
  GET_CATEGORY_WITH_PARENT,
  GET_CATEGORIES_BASE,
  GET_CATEGORIES_DETAIL,
  GET_CATEGORIES_COUNT,
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_AVAILABLE_CATEGORIES,
  GET_BRAND_CATEGORIES,
  GET_ALL_BRAND_CATEGORIES,
  GET_PARENT_CATEGORIES,
  GET_SUBCATEGORIES,
  GET_CATEGORIES_WITH_CHILDREN,
} from "../graphql/queries/category";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_CATEGORY_ACTIVE,
  UPDATE_CATEGORY_POSITION,
  UPDATE_CATEGORY_PARENT,
  UPDATE_CATEGORY_IMAGE,
  UPDATE_CATEGORY_POINT_BINDS,
} from "../graphql/mutations/category";
import type {
  CategoriesFilterInput,
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryDeleteInput,
  CategoryPointBindInput,
  OrderType,
  NearType,
  EndOfList,
} from "../graphql-types";

// ====================================================================
// CATEGORY HOOKS - React hooks for category operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single category
export const useCategory = ({
  brandId,
  id,
  level = "detail",
  skip = false,
  includeChildren = false,
  includeParent = false,
}: {
  brandId: string;
  id: string;
  level?: "base" | "detail";
  skip?: boolean;
  includeChildren?: boolean;
  includeParent?: boolean;
}) => {
  let query = level === "base" ? GET_CATEGORY_BASE : GET_CATEGORY_DETAIL;

  // Override query based on additional data needs
  if (includeChildren) {
    query = GET_CATEGORY_WITH_CHILDREN;
  } else if (includeParent) {
    query = GET_CATEGORY_WITH_PARENT;
  }

  return useQuery(query, {
    variables: { brandId, id },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting multiple categories
export const useCategories = ({
  brandId,
  filter,
  level = "detail",
  skip = false,
}: {
  brandId: string;
  filter?: CategoriesFilterInput;
  level?: "base" | "detail";
  skip?: boolean;
}) => {
  const query = level === "base" ? GET_CATEGORIES_BASE : GET_CATEGORIES_DETAIL;

  return useQuery(query, {
    variables: { brandId, filter },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting categories count
export const useCategoriesCount = ({
  brandId,
  filter,
  skip = false,
}: {
  brandId: string;
  filter?: CategoriesFilterInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CATEGORIES_COUNT, {
    variables: { brandId, filter },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting categories with products count for menu
export const useCategoriesWithProductsCount = ({
  brandId,
  pointId,
  orderType,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  skip?: boolean;
}) => {
  return useQuery(GET_CATEGORIES_WITH_PRODUCTS_COUNT, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting available categories for a point and order type
export const useAvailableCategories = ({
  brandId,
  pointId,
  orderType,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  skip?: boolean;
}) => {
  return useQuery(GET_AVAILABLE_CATEGORIES, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting all categories for a brand
export const useBrandCategories = ({
  brandId,
  includeInactive = false,
  skip = false,
}: {
  brandId: string;
  includeInactive?: boolean;
  skip?: boolean;
}) => {
  const query = includeInactive
    ? GET_ALL_BRAND_CATEGORIES
    : GET_BRAND_CATEGORIES;

  return useQuery(query, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting parent categories (first level)
export const useParentCategories = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PARENT_CATEGORIES, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting subcategories
export const useSubcategories = ({
  brandId,
  parentId,
  skip = false,
}: {
  brandId: string;
  parentId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_SUBCATEGORIES, {
    variables: { brandId, parentId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting categories with their children
export const useCategoriesWithChildren = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_CATEGORIES_WITH_CHILDREN, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating a category
export const useCreateCategory = () => {
  const client = useApolloClient();

  return useMutation(CREATE_CATEGORY, {
    update: () => {
      client.refetchQueries({
        include: [
          "GetBrandCategories",
          "GetAllBrandCategories",
          "GetCategoriesWithProductsCount",
          "GetParentCategories",
          "GetCategoriesWithChildren",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating a category
export const useUpdateCategory = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_CATEGORY, {
    update: (cache, { data }) => {
      if (data?.categoryUpdate) {
        // Update the cache with the new data
        cache.modify({
          fields: {
            categories(existingCategories = [], { readField }) {
              return existingCategories.map((categoryRef: any) => {
                if (readField("id", categoryRef) === data.categoryUpdate.id) {
                  return data.categoryUpdate;
                }
                return categoryRef;
              });
            },
          },
        });
      }
      client.refetchQueries({
        include: [
          "GetBrandCategories",
          "GetAllBrandCategories",
          "GetCategoriesWithProductsCount",
          "GetParentCategories",
          "GetCategoriesWithChildren",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for deleting a category
export const useDeleteCategory = () => {
  const client = useApolloClient();

  return useMutation(DELETE_CATEGORY, {
    update: (cache, { data }, { variables }) => {
      if (variables?.input?.id) {
        const categoryId = variables.input.id;
        const categoryRef = cache.identify({
          __typename: "Category",
          id: categoryId,
        });

        if (categoryRef) {
          cache.evict({ id: categoryRef });
          cache.gc();
        }
      }

      client.refetchQueries({
        include: [
          "GetBrandCategories",
          "GetAllBrandCategories",
          "GetCategoriesWithProductsCount",
          "GetParentCategories",
          "GetCategoriesWithChildren",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for toggling category active status
export const useToggleCategoryActive = () => {
  const client = useApolloClient();

  return useMutation(TOGGLE_CATEGORY_ACTIVE, {
    optimisticResponse: (variables) => ({
      categoryUpdate: {
        __typename: "Category",
        id: variables.id,
        isActive: variables.isActive,
      },
    }),
    update: (cache, { data }) => {
      if (data?.categoryUpdate) {
        const categoryRef = cache.identify(data.categoryUpdate);
        if (categoryRef) {
          cache.modify({
            id: categoryRef,
            fields: {
              isActive: () => data.categoryUpdate.isActive,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });
};

// Hook for updating category position
export const useUpdateCategoryPosition = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_CATEGORY_POSITION, {
    update: () => {
      client.refetchQueries({
        include: [
          "GetBrandCategories",
          "GetAllBrandCategories",
          "GetCategoriesWithProductsCount",
          "GetParentCategories",
          "GetCategoriesWithChildren",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating category parent
export const useUpdateCategoryParent = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_CATEGORY_PARENT, {
    update: () => {
      client.refetchQueries({
        include: [
          "GetBrandCategories",
          "GetAllBrandCategories",
          "GetParentCategories",
          "GetSubcategories",
          "GetCategoriesWithChildren",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating category image
export const useUpdateCategoryImage = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_CATEGORY_IMAGE, {
    update: (cache, { data }) => {
      if (data?.categoryUpdate) {
        const categoryRef = cache.identify(data.categoryUpdate);
        if (categoryRef) {
          cache.modify({
            id: categoryRef,
            fields: {
              imageUrl: () => data.categoryUpdate.imageUrl,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });
};

// Hook for updating category point binds
export const useUpdateCategoryPointBinds = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_CATEGORY_POINT_BINDS, {
    update: () => {
      client.refetchQueries({
        include: ["GetCategoriesWithProductsCount", "GetAvailableCategories"],
      });
    },
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for menu categories with products count
export const useMenuCategories = ({
  brandId,
  pointId,
  orderType,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: OrderType;
  skip?: boolean;
}) => {
  const query = useCategoriesWithProductsCount({
    brandId,
    pointId,
    orderType,
    skip,
  });

  return {
    categories: query.data?.categories || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Hook for admin categories management
export const useAdminCategories = ({
  brandId,
  includeInactive = false,
  skip = false,
}: {
  brandId: string;
  includeInactive?: boolean;
  skip?: boolean;
}) => {
  const categoriesQuery = useBrandCategories({
    brandId,
    includeInactive,
    skip,
  });

  const countQuery = useCategoriesCount({
    brandId,
    filter: includeInactive ? {} : { isActive: true },
    skip,
  });

  return {
    categories: categoriesQuery.data?.categories || [],
    total: countQuery.data?.categoriesCount || 0,
    loading: categoriesQuery.loading || countQuery.loading,
    error: categoriesQuery.error || countQuery.error,
    refetch: () => {
      categoriesQuery.refetch();
      countQuery.refetch();
    },
  };
};

// Hook for category hierarchy
export const useCategoryHierarchy = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  const parentCategoriesQuery = useParentCategories({ brandId, skip });
  const allCategoriesQuery = useBrandCategories({ brandId, skip });

  const buildHierarchy = (
    categories: any[],
    parentId: string | null = null
  ): any[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((category) => ({
        ...category,
        children: buildHierarchy(categories, category.id),
      }));
  };

  const hierarchy = allCategoriesQuery.data?.categories
    ? buildHierarchy(allCategoriesQuery.data.categories)
    : [];

  return {
    hierarchy,
    parentCategories: parentCategoriesQuery.data?.categories || [],
    allCategories: allCategoriesQuery.data?.categories || [],
    loading: parentCategoriesQuery.loading || allCategoriesQuery.loading,
    error: parentCategoriesQuery.error || allCategoriesQuery.error,
    refetch: () => {
      parentCategoriesQuery.refetch();
      allCategoriesQuery.refetch();
    },
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const CATEGORY_HOOKS = {
  // Query hooks
  useCategory,
  useCategories,
  useCategoriesCount,
  useCategoriesWithProductsCount,
  useAvailableCategories,
  useBrandCategories,
  useParentCategories,
  useSubcategories,
  useCategoriesWithChildren,

  // Mutation hooks
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryActive,
  useUpdateCategoryPosition,
  useUpdateCategoryParent,
  useUpdateCategoryImage,
  useUpdateCategoryPointBinds,

  // Composite hooks
  useMenuCategories,
  useAdminCategories,
  useCategoryHierarchy,
} as const;
