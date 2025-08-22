import { gql } from "@apollo/client";

// ====================================================================
// CORE FRAGMENTS - Standardized GraphQL fragments for all domains
// ====================================================================

// ================== BRAND FRAGMENTS ==================
export const BRAND_BASE_FRAGMENT = gql`
  fragment BrandBase on Brand {
    id
    name
    slug
  }
`;

export const BRAND_DETAIL_FRAGMENT = gql`
  fragment BrandDetail on Brand {
    id
    name
    slug
    isActive
    accountId
  }
`;

// ================== CITY FRAGMENTS ==================
export const CITY_BASE_FRAGMENT = gql`
  fragment CityBase on City {
    id
    name
  }
`;

export const CITY_DETAIL_FRAGMENT = gql`
  fragment CityDetail on City {
    id
    name
    isActive
    priority
  }
`;

// ================== POINT FRAGMENTS ==================
export const POINT_BASE_FRAGMENT = gql`
  fragment PointBase on Point {
    id
    name
    address
  }
`;

export const POINT_DETAIL_FRAGMENT = gql`
  fragment PointDetail on Point {
    id
    name
    address
    priority
    isActive
    brandId
    cityId
  }
`;

// ================== CATEGORY FRAGMENTS ==================
export const CATEGORY_BASE_FRAGMENT = gql`
  fragment CategoryBase on Category {
    id
    name
    slug
  }
`;

export const CATEGORY_DETAIL_FRAGMENT = gql`
  fragment CategoryDetail on Category {
    id
    name
    slug
    imageUrl
    priority
    isActive
    brandId
    parentId
  }
`;

export const CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT = gql`
  fragment CategoryWithProductsCount on Category {
    id
    name
    slug
    imageUrl
    priority
    isActive
    brandId
    parentId
    pointBinds {
      pointId
      orderType
    }
  }
`;

// ================== PRODUCT FRAGMENTS ==================
export const PRODUCT_BASE_FRAGMENT = gql`
  fragment ProductBase on Product {
    id
    name
    slug
    isActive
  }
`;

export const PRODUCT_DETAIL_FRAGMENT = gql`
  fragment ProductDetail on Product {
    id
    name
    slug
    description
    isActive
    brandId
    unit
    unitValue
    calories
    carbohydrates
    fats
    protein
  }
`;

export const PRODUCT_PRICE_SETTINGS_FRAGMENT = gql`
  fragment ProductPriceSettings on Product {
    priceSettings {
      price
      priceOrderTypes {
        orderType
        priceCommon
        priceCities {
          cityId
          price
        }
        pricePoints {
          pointId
          price
        }
      }
    }
  }
`;

export const PRODUCT_IMAGES_FRAGMENT = gql`
  fragment ProductImages on Product {
    images {
      fileId
      priority
      url
    }
  }
`;

export const PRODUCT_TAGS_FRAGMENT = gql`
  fragment ProductTags on Product {
    tags {
      id
      name
    }
    tagBinds {
      tagId
      priority
    }
  }
`;

export const PRODUCT_BINDINGS_FRAGMENT = gql`
  fragment ProductBindings on Product {
    pointBinds {
      pointId
      orderType
    }
    categoryBinds {
      categoryId
      priority
    }
  }
`;

export const PRODUCT_FULL_FRAGMENT = gql`
  fragment ProductFull on Product {
    ...ProductDetail
    ...ProductImages
    ...ProductTags
    ...ProductBindings
  }
  ${PRODUCT_DETAIL_FRAGMENT}
  ${PRODUCT_IMAGES_FRAGMENT}
  ${PRODUCT_TAGS_FRAGMENT}
  ${PRODUCT_BINDINGS_FRAGMENT}
`;

export const PRODUCT_FOR_MENU_FRAGMENT = gql`
  fragment ProductForMenu on Product {
    id
    name
    slug
    description
    isActive
    images {
      fileId
      priority
      url
    }
    pointBinds {
      pointId
      orderType
    }
    categoryBinds {
      categoryId
      priority
    }
    tags {
      id
      name
    }
  }
`;

// ================== USER FRAGMENTS ==================
export const USER_BASE_FRAGMENT = gql`
  fragment UserBase on User {
    id
    name
    login
  }
`;

export const USER_DETAIL_FRAGMENT = gql`
  fragment UserDetail on User {
    id
    login
    name
    email
    phone
  }
`;

// ================== ORDER FRAGMENTS ==================
export const ORDER_BASE_FRAGMENT = gql`
  fragment OrderBase on Order {
    id
    number
    status
    priceTotal
  }
`;

export const ORDER_DETAIL_FRAGMENT = gql`
  fragment OrderDetail on Order {
    id
    number
    type
    status
    comment
    priceTotal
    personsNumber
    pointId
    brandId
  }
`;

export const ORDER_ITEM_BASE_FRAGMENT = gql`
  fragment OrderItemBase on OrderItem {
    id
    productId
    price
    quantity
  }
`;

export const ORDER_ITEM_DETAIL_FRAGMENT = gql`
  fragment OrderItemDetail on OrderItem {
    id
    productId
    price
    quantity
    product {
      id
      name
      slug
      description
      images {
        url
        priority
      }
    }
  }
`;

export const ORDER_WITH_ITEMS_FRAGMENT = gql`
  fragment OrderWithItems on Order {
    ...OrderDetail
    items {
      ...OrderItemDetail
    }
  }
  ${ORDER_DETAIL_FRAGMENT}
  ${ORDER_ITEM_DETAIL_FRAGMENT}
`;

// ================== LEGACY FRAGMENTS (for backward compatibility) ==================
export const BRAND_FRAGMENT = BRAND_DETAIL_FRAGMENT;
export const CATEGORY_FRAGMENT = CATEGORY_DETAIL_FRAGMENT;
export const PRODUCT_FRAGMENT = PRODUCT_DETAIL_FRAGMENT;
export const PRODUCT_PRICE_FRAGMENT = PRODUCT_PRICE_SETTINGS_FRAGMENT;
export const PRODUCT_IMAGE_FRAGMENT = PRODUCT_IMAGES_FRAGMENT;
export const POINT_FRAGMENT = POINT_DETAIL_FRAGMENT;
export const CITY_FRAGMENT = CITY_BASE_FRAGMENT;
export const USER_FRAGMENT = USER_DETAIL_FRAGMENT;
export const ORDER_FRAGMENT = ORDER_DETAIL_FRAGMENT;
export const ORDER_ITEM_FRAGMENT = ORDER_ITEM_BASE_FRAGMENT;

// ================== FRAGMENT COLLECTIONS FOR EASY IMPORT ==================
export const FRAGMENTS = {
  // Brand
  BRAND_BASE: BRAND_BASE_FRAGMENT,
  BRAND_DETAIL: BRAND_DETAIL_FRAGMENT,

  // City
  CITY_BASE: CITY_BASE_FRAGMENT,
  CITY_DETAIL: CITY_DETAIL_FRAGMENT,

  // Point
  POINT_BASE: POINT_BASE_FRAGMENT,
  POINT_DETAIL: POINT_DETAIL_FRAGMENT,

  // Category
  CATEGORY_BASE: CATEGORY_BASE_FRAGMENT,
  CATEGORY_DETAIL: CATEGORY_DETAIL_FRAGMENT,
  CATEGORY_WITH_PRODUCTS_COUNT: CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT,

  // Product
  PRODUCT_BASE: PRODUCT_BASE_FRAGMENT,
  PRODUCT_DETAIL: PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_PRICE_SETTINGS: PRODUCT_PRICE_SETTINGS_FRAGMENT,
  PRODUCT_IMAGES: PRODUCT_IMAGES_FRAGMENT,
  PRODUCT_TAGS: PRODUCT_TAGS_FRAGMENT,
  PRODUCT_BINDINGS: PRODUCT_BINDINGS_FRAGMENT,
  PRODUCT_FULL: PRODUCT_FULL_FRAGMENT,
  PRODUCT_FOR_MENU: PRODUCT_FOR_MENU_FRAGMENT,

  // User
  USER_BASE: USER_BASE_FRAGMENT,
  USER_DETAIL: USER_DETAIL_FRAGMENT,

  // Order
  ORDER_BASE: ORDER_BASE_FRAGMENT,
  ORDER_DETAIL: ORDER_DETAIL_FRAGMENT,
  ORDER_ITEM_BASE: ORDER_ITEM_BASE_FRAGMENT,
  ORDER_ITEM_DETAIL: ORDER_ITEM_DETAIL_FRAGMENT,
  ORDER_WITH_ITEMS: ORDER_WITH_ITEMS_FRAGMENT,
} as const;

// ================== FRAGMENT TYPES FOR TYPESCRIPT ==================
export type FragmentName = keyof typeof FRAGMENTS;
