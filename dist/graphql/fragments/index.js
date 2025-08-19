// Common fragments used across multiple queries
export const BRAND_FRAGMENT = `
  fragment BrandFragment on Brand {
    id
    name
    slug
    isActive
    accountId
  }
`;
export const CATEGORY_FRAGMENT = `
  fragment CategoryFragment on Category {
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
export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
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
export const PRODUCT_PRICE_FRAGMENT = `
  fragment ProductPriceFragment on ProductPriceSettings {
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
`;
export const PRODUCT_IMAGE_FRAGMENT = `
  fragment ProductImageFragment on ProductImage {
    fileId
    priority
    url
  }
`;
export const POINT_FRAGMENT = `
  fragment PointFragment on Point {
    id
    name
    address
    priority
    isActive
    brandId
    cityId
  }
`;
export const CITY_FRAGMENT = `
  fragment CityFragment on City {
    id
    name
  }
`;
export const USER_FRAGMENT = `
  fragment UserFragment on User {
    id
    login
    name
    email
    phone
  }
`;
export const ORDER_FRAGMENT = `
  fragment OrderFragment on Order {
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
export const ORDER_ITEM_FRAGMENT = `
  fragment OrderItemFragment on OrderItem {
    id
    productId
    price
    quantity
    name
    imageUrl
  }
`;
//# sourceMappingURL=index.js.map