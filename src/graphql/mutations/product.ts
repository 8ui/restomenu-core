import { gql } from "@apollo/client";
import {
  PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_FULL_FRAGMENT,
  PRODUCT_PRICE_SETTINGS_FRAGMENT,
} from "../fragments";

// ====================================================================
// PRODUCT MUTATIONS - Standardized GraphQL mutations for products
// ====================================================================

// ================== CREATE MUTATIONS ==================

// Create product with detailed response
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductCreateInput!) {
    productCreate(input: $input) {
      ...ProductDetail
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// Create product with full response (admin view)
export const CREATE_PRODUCT_FULL = gql`
  mutation CreateProductFull($input: ProductCreateInput!) {
    productCreate(input: $input) {
      ...ProductFull
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// ================== UPDATE MUTATIONS ==================

// Update product with detailed response
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      ...ProductDetail
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// Update product with full response (admin view)
export const UPDATE_PRODUCT_FULL = gql`
  mutation UpdateProductFull($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      ...ProductFull
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// ================== DELETE MUTATIONS ==================

// Delete product
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($input: ProductDeleteInput!) {
    productDelete(input: $input)
  }
`;

// Soft delete product (set isActive to false)
export const SOFT_DELETE_PRODUCT = gql`
  mutation SoftDeleteProduct($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      id
      isActive
    }
  }
`;

// ================== SPECIALIZED MUTATIONS ==================

// Update product price settings only
export const UPDATE_PRODUCT_PRICE_SETTINGS = gql`
  mutation UpdateProductPriceSettings($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      id
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// Update product images only
export const UPDATE_PRODUCT_IMAGES = gql`
  mutation UpdateProductImages($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      id
      images {
        fileId
        priority
        url
      }
    }
  }
`;

// Update product tags only
export const UPDATE_PRODUCT_TAGS = gql`
  mutation UpdateProductTags($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      id
      tags {
        id
        name
      }
      tagBinds {
        tagId
        priority
      }
    }
  }
`;

// Update product category bindings only
export const UPDATE_PRODUCT_CATEGORY_BINDINGS = gql`
  mutation UpdateProductCategoryBindings($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      id
      categoryBinds {
        categoryId
        priority
      }
    }
  }
`;

// Update product point bindings only
export const UPDATE_PRODUCT_POINT_BINDINGS = gql`
  mutation UpdateProductPointBindings($input: ProductUpdateInput!) {
    productUpdate(input: $input) {
      id
      pointBinds {
        pointId
        orderType
      }
    }
  }
`;

// Toggle product active status
export const TOGGLE_PRODUCT_ACTIVE = gql`
  mutation ToggleProductActive(
    $productId: Uuid!
    $brandId: Uuid!
    $isActive: Boolean!
  ) {
    productUpdate(
      input: { productId: $productId, brandId: $brandId, isActive: $isActive }
    ) {
      id
      isActive
    }
  }
`;

// ================== BATCH MUTATIONS ==================

// Batch update products (if supported by schema)
export const BATCH_UPDATE_PRODUCTS = gql`
  mutation BatchUpdateProducts($inputs: [ProductUpdateInput!]!) {
    productBatchUpdate(inputs: $inputs) {
      id
      isActive
    }
  }
`;

// Batch delete products (if supported by schema)
export const BATCH_DELETE_PRODUCTS = gql`
  mutation BatchDeleteProducts($inputs: [ProductDeleteInput!]!) {
    productBatchDelete(inputs: $inputs)
  }
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const PRODUCT_MUTATIONS = {
  // Create mutations
  CREATE_PRODUCT,
  CREATE_PRODUCT_FULL,

  // Update mutations
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_FULL,

  // Delete mutations
  DELETE_PRODUCT,
  SOFT_DELETE_PRODUCT,

  // Specialized mutations
  UPDATE_PRODUCT_PRICE_SETTINGS,
  UPDATE_PRODUCT_IMAGES,
  UPDATE_PRODUCT_TAGS,
  UPDATE_PRODUCT_CATEGORY_BINDINGS,
  UPDATE_PRODUCT_POINT_BINDINGS,
  TOGGLE_PRODUCT_ACTIVE,

  // Batch mutations
  BATCH_UPDATE_PRODUCTS,
  BATCH_DELETE_PRODUCTS,
} as const;
