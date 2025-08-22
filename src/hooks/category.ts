import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  GET_CATEGORY_BASE,
  GET_CATEGORY_DETAIL,
  GET_CATEGORIES_BASE,
  GET_CATEGORIES_DETAIL,
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_AVAILABLE_CATEGORIES,
  GET_BRAND_CATEGORIES,
} from "../graphql/queries/category";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_CATEGORY_ACTIVE,
} from "../graphql/mutations/category";
import type {
  CategoryInput,
  CategoriesInput,
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryDeleteInput,
} from "../graphql-types";

// ====================================================================
// CATEGORY HOOKS - React hooks for category operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single category
export const useCategory = ({
  input,
  level = "detail",
  skip = false,
}: {
  input: CategoryInput;
  level?: "base" | "detail";
  skip?: boolean;
}) => {
  const query = level === "base" ? GET_CATEGORY_BASE : GET_CATEGORY_DETAIL;

  return useQuery(query, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting multiple categories
export const useCategories = ({
  input,
  level = "detail",
  skip = false,
}: {
  input: CategoriesInput;
  level?: "base" | "detail";
  skip?: boolean;
}) => {
  const query = level === "base" ? GET_CATEGORIES_BASE : GET_CATEGORIES_DETAIL;

  return useQuery(query, {
    variables: { input },
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
  orderType: string;
  skip?: boolean;
}) => {
  return useQuery(GET_CATEGORIES_WITH_PRODUCTS_COUNT, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting all categories for a brand
export const useBrandCategories = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_BRAND_CATEGORIES, {
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
        include: ["GetBrandCategories", "GetCategoriesWithProductsCount"],
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
        include: ["GetBrandCategories", "GetCategoriesWithProductsCount"],
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
      if (variables?.input?.categoryId) {
        const categoryId = variables.input.categoryId;
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
        include: ["GetBrandCategories", "GetCategoriesWithProductsCount"],
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
        id: variables.categoryId,
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
  orderType: string;
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

// ================== EXPORTED HOOK COLLECTIONS ==================
export const CATEGORY_HOOKS = {
  // Query hooks
  useCategory,
  useCategories,
  useCategoriesWithProductsCount,
  useBrandCategories,

  // Mutation hooks
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryActive,

  // Composite hooks
  useMenuCategories,
} as const;
