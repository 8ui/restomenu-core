import { gql } from "@apollo/client";
import {
  PRODUCT_BASE_FRAGMENT,
  PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_FOR_MENU_FRAGMENT,
  PRODUCT_FULL_FRAGMENT,
  PRODUCT_PRICE_SETTINGS_FRAGMENT,
} from "../fragments";

// ====================================================================
// PRODUCT QUERIES - Standardized GraphQL queries for products
// ====================================================================

// ================== BASIC QUERIES ==================

// Get single product by ID with minimal fields
export const GET_PRODUCT_BASE = gql`
  query GetProductBase($input: ProductInput!) {
    product(input: $input) {
      ...ProductBase
    }
  }
  ${PRODUCT_BASE_FRAGMENT}
`;

// Get single product with detailed information
export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($input: ProductInput!) {
    product(input: $input) {
      ...ProductDetail
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// Get single product with all information (admin view)
export const GET_PRODUCT_FULL = gql`
  query GetProductFull($input: ProductInput!) {
    product(input: $input) {
      ...ProductFull
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// Get single product optimized for menu display
export const GET_PRODUCT_FOR_MENU = gql`
  query GetProductForMenu(
    $input: ProductInput!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    product(input: $input) {
      ...ProductForMenu
      pricePoint(input: { pointId: $pointId, orderType: $orderType })
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get products with minimal fields (for lists)
export const GET_PRODUCTS_BASE = gql`
  query GetProductsBase($input: ProductsInput!) {
    products(input: $input) {
      ...ProductBase
    }
  }
  ${PRODUCT_BASE_FRAGMENT}
`;

// Get products with detailed information
export const GET_PRODUCTS_DETAIL = gql`
  query GetProductsDetail($input: ProductsInput!) {
    products(input: $input) {
      ...ProductDetail
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// Get products optimized for menu display
export const GET_PRODUCTS_FOR_MENU = gql`
  query GetProductsForMenu(
    $input: ProductsInput!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    products(input: $input) {
      ...ProductForMenu
      pricePoint(input: { pointId: $pointId, orderType: $orderType })
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;

// Get products with all information (admin view)
export const GET_PRODUCTS_FULL = gql`
  query GetProductsFull($input: ProductsInput!) {
    products(input: $input) {
      ...ProductFull
      ...ProductPriceSettings
    }
  }
  ${PRODUCT_FULL_FRAGMENT}
  ${PRODUCT_PRICE_SETTINGS_FRAGMENT}
`;

// ================== SPECIALIZED QUERIES ==================

// Get products by category with menu optimization
export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory(
    $brandId: Uuid!
    $categoryId: Uuid!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    products(
      input: {
        brandId: $brandId
        filter: {
          isActive: true
          pointBinds: { pointId: $pointId, orderType: $orderType }
          categoriesId: [$categoryId]
        }
      }
    ) {
      ...ProductForMenu
      pricePoint(input: { pointId: $pointId, orderType: $orderType })
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;

// Get available products for a specific point and order type
export const GET_AVAILABLE_PRODUCTS = gql`
  query GetAvailableProducts(
    $brandId: Uuid!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    products(
      input: {
        brandId: $brandId
        filter: {
          isActive: true
          pointBinds: { pointId: $pointId, orderType: $orderType }
        }
      }
    ) {
      ...ProductForMenu
      pricePoint(input: { pointId: $pointId, orderType: $orderType })
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;

// Get filtered products with custom filters
export const GET_FILTERED_PRODUCTS = gql`
  query GetFilteredProducts(
    $input: ProductsInput!
    $pointId: Uuid!
    $orderType: OrderType!
  ) {
    products(input: $input) {
      ...ProductForMenu
      pricePoint(input: { pointId: $pointId, orderType: $orderType })
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;

// Get product tags for a brand
export const GET_PRODUCT_TAGS = gql`
  query GetProductTags($brandId: Uuid!) {
    productTags(input: { brandId: $brandId }) {
      id
      name
    }
  }
`;

// Get product variant properties for a brand
export const GET_PRODUCT_VARIANT_PROPERTIES = gql`
  query GetProductVariantProperties($brandId: Uuid!) {
    productVariantProperties(input: { brandId: $brandId }) {
      id
      name
      isShowName
      displayType
      innerName
      brandId
      values {
        id
        name
        priority
      }
    }
  }
`;

// Get single product variant property
export const GET_PRODUCT_VARIANT_PROPERTY = gql`
  query GetProductVariantProperty($brandId: Uuid!, $id: Uuid!) {
    productVariantProperty(input: { brandId: $brandId, id: $id }) {
      id
      name
      isShowName
      displayType
      innerName
      brandId
      values {
        id
        name
        priority
      }
    }
  }
`;

// Get products count with filters (removed as not supported in schema)
// export const GET_PRODUCTS_COUNT = gql`
//   query GetProductsCount($pointId: Uuid!, $filter: ProductGetCountInput) {
//     productsCount(pointId: $pointId, ProductGetCountInput: $filter)
//   }
// `;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const PRODUCT_QUERIES = {
  // Single product queries
  GET_PRODUCT_BASE,
  GET_PRODUCT_DETAIL,
  GET_PRODUCT_FULL,
  GET_PRODUCT_FOR_MENU,

  // Multiple products queries
  GET_PRODUCTS_BASE,
  GET_PRODUCTS_DETAIL,
  GET_PRODUCTS_FULL,
  GET_PRODUCTS_FOR_MENU,

  // Specialized queries
  GET_PRODUCTS_BY_CATEGORY,
  GET_AVAILABLE_PRODUCTS,
  GET_FILTERED_PRODUCTS,
  GET_PRODUCT_TAGS,
  GET_PRODUCT_VARIANT_PROPERTIES,
  GET_PRODUCT_VARIANT_PROPERTY,
  // GET_PRODUCTS_COUNT, // Removed - not supported in schema
} as const;

// Legacy exports for backward compatibility
export const GET_PRODUCT = GET_PRODUCT_DETAIL;
export const GET_PRODUCTS = GET_PRODUCTS_DETAIL;
