import { useQuery, useMutation } from "@apollo/client";
import {
  GET_PRODUCT_BASE,
  GET_PRODUCT_DETAIL,
  GET_PRODUCT_FOR_MENU,
  GET_PRODUCTS_BASE,
  GET_PRODUCTS_DETAIL,
  GET_PRODUCTS_FOR_MENU,
  GET_AVAILABLE_PRODUCTS,
  GET_FILTERED_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_TAGS,
  GET_PRODUCT_VARIANT_PROPERTIES,
  GET_PRODUCT_VARIANT_PROPERTY,
} from "../graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
  CREATE_PRODUCT_VARIANT_PROPERTY,
  UPDATE_PRODUCT_VARIANT_PROPERTY,
  DELETE_PRODUCT_VARIANT_PROPERTY,
} from "../graphql/mutations/product";
import type {
  ProductInput,
  ProductsInput,
  ProductCreateInput,
  ProductUpdateInput,
  ProductDeleteInput,
} from "../graphql-types";

// ====================================================================
// PRODUCT HOOKS - React hooks for product operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single product with different detail levels
export const useProduct = ({
  input,
  level = "detail",
  pointId,
  orderType,
  skip = false,
}: {
  input: ProductInput;
  level?: "base" | "detail" | "menu";
  pointId?: string;
  orderType?: string;
  skip?: boolean;
}) => {
  const getQuery = () => {
    switch (level) {
      case "base":
        return GET_PRODUCT_BASE;
      case "menu":
        return GET_PRODUCT_FOR_MENU;
      default:
        return GET_PRODUCT_DETAIL;
    }
  };

  const variables =
    level === "menu" ? { input, pointId, orderType } : { input };

  return useQuery(getQuery(), {
    variables,
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting multiple products
export const useProducts = ({
  input,
  level = "detail",
  pointId,
  orderType,
  skip = false,
}: {
  input: ProductsInput;
  level?: "base" | "detail" | "menu";
  pointId?: string;
  orderType?: string;
  skip?: boolean;
}) => {
  const getQuery = () => {
    switch (level) {
      case "base":
        return GET_PRODUCTS_BASE;
      case "menu":
        return GET_PRODUCTS_FOR_MENU;
      default:
        return GET_PRODUCTS_DETAIL;
    }
  };

  const variables =
    level === "menu" ? { input, pointId, orderType } : { input };

  return useQuery(getQuery(), {
    variables,
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting available products for a specific point and order type
export const useAvailableProducts = ({
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
  return useQuery(GET_AVAILABLE_PRODUCTS, {
    variables: { brandId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting products by category
export const useProductsByCategory = ({
  brandId,
  categoryId,
  pointId,
  orderType,
  skip = false,
}: {
  brandId: string;
  categoryId: string;
  pointId: string;
  orderType: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { brandId, categoryId, pointId, orderType },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting product tags
export const useProductTags = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCT_TAGS, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting product variant properties
export const useProductVariantProperties = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCT_VARIANT_PROPERTIES, {
    variables: { brandId },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting a single product variant property
export const useProductVariantProperty = ({
  brandId,
  id,
  skip = false,
}: {
  brandId: string;
  id: string;
  skip?: boolean;
}) => {
  return useQuery(GET_PRODUCT_VARIANT_PROPERTY, {
    variables: { brandId, id },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating a product
export const useCreateProduct = () => {
  return useMutation(CREATE_PRODUCT, {
    errorPolicy: "all",
  });
};

// Hook for updating a product
export const useUpdateProduct = () => {
  return useMutation(UPDATE_PRODUCT, {
    errorPolicy: "all",
  });
};

// Hook for deleting a product
export const useDeleteProduct = () => {
  return useMutation(DELETE_PRODUCT, {
    errorPolicy: "all",
  });
};

// Hook for toggling product active status
export const useToggleProductActive = () => {
  return useMutation(TOGGLE_PRODUCT_ACTIVE, {
    errorPolicy: "all",
  });
};

// Hook for creating a product variant property
export const useCreateProductVariantProperty = () => {
  return useMutation(CREATE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });
};

// Hook for updating a product variant property
export const useUpdateProductVariantProperty = () => {
  return useMutation(UPDATE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });
};

// Hook for deleting a product variant property
export const useDeleteProductVariantProperty = () => {
  return useMutation(DELETE_PRODUCT_VARIANT_PROPERTY, {
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for menu display with products
export const useMenuProducts = ({
  brandId,
  pointId,
  orderType,
  categoryId,
  skip = false,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  categoryId?: string;
  skip?: boolean;
}) => {
  const query = categoryId
    ? useProductsByCategory({ brandId, categoryId, pointId, orderType, skip })
    : useAvailableProducts({ brandId, pointId, orderType, skip });

  return {
    products: query.data?.products || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Hook that combines product and tag data for admin forms
export const useProductFormData = ({
  brandId,
  productId,
  skip = false,
}: {
  brandId: string;
  productId?: string;
  skip?: boolean;
}) => {
  const shouldSkip = skip || !productId;

  const productQuery = useProduct({
    input: { id: productId || "", brandId },
    level: "detail",
    skip: shouldSkip,
  });

  const tagsQuery = useProductTags({ brandId, skip });

  return {
    product: productQuery.data?.product,
    tags: tagsQuery.data?.productTags || [],
    loading: productQuery.loading || tagsQuery.loading,
    error: productQuery.error || tagsQuery.error,
    refetch: () => {
      productQuery.refetch();
      tagsQuery.refetch();
    },
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const PRODUCT_HOOKS = {
  // Query hooks
  useProduct,
  useProducts,
  useAvailableProducts,
  useProductsByCategory,
  useProductTags,
  useProductVariantProperties,
  useProductVariantProperty,

  // Mutation hooks
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductActive,
  useCreateProductVariantProperty,
  useUpdateProductVariantProperty,
  useDeleteProductVariantProperty,

  // Composite hooks
  useProductFormData,
  useMenuProducts,
} as const;
