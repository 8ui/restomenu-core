import { gql } from "@apollo/client";
import {
  CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT,
  PRODUCT_FOR_MENU_FRAGMENT,
} from "./fragments";

// ====================================================================
// COMPOSITE QUERIES - Complex operations combining multiple domains
// ====================================================================

// Get complete menu data (categories + products) optimized for menu display
export const GET_MENU_DATA = gql`
  query GetMenuData($brandId: Uuid!, $pointId: Uuid!, $orderType: OrderType!) {
    # Get categories with products count
    categories(
      input: {
        brandId: $brandId
        filter: {
          isActive: true
          pointBinds: { pointId: $pointId, orderType: $orderType }
          productExists: {
            isActive: true
            pointBinds: { pointId: $pointId, orderType: $orderType }
          }
        }
      }
    ) {
      ...CategoryWithProductsCount
      productsCount(
        input: {
          filter: {
            isActive: true
            pointBinds: { pointId: $pointId, orderType: $orderType }
          }
        }
      )
    }

    # Get products available for menu
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
  ${CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT}
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

// Helper function to build dynamic query variables for filtering
export const buildProductFilters = ({
  brandId,
  pointId,
  orderType,
  categoryId,
  tagIds,
  isActive = true,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  categoryId?: string;
  tagIds?: string[];
  isActive?: boolean;
}) => {
  const filter: any = {
    isActive,
    pointBinds: { pointId, orderType },
  };

  if (categoryId) {
    filter.categoriesId = categoryId;
  }

  if (tagIds && tagIds.length > 0) {
    filter.tagIds = tagIds;
  }

  return {
    input: {
      brandId,
      filter,
    },
  };
};

// Helper function to build category filters
export const buildCategoryFilters = ({
  brandId,
  pointId,
  orderType,
  parentId,
  isActive = true,
  includeProductsCheck = true,
}: {
  brandId: string;
  pointId: string;
  orderType: string;
  parentId?: string | null;
  isActive?: boolean;
  includeProductsCheck?: boolean;
}) => {
  const filter: any = {
    isActive,
    pointBinds: { pointId, orderType },
  };

  if (parentId !== undefined) {
    filter.parentId = parentId;
  }

  if (includeProductsCheck) {
    filter.productExists = {
      isActive: true,
      pointBinds: { pointId, orderType },
    };
  }

  return {
    input: {
      brandId,
      filter,
    },
  };
};

// Export all composite operations
export const COMPOSITE_OPERATIONS = {
  GET_MENU_DATA,
} as const;

// Export utility functions
export const QUERY_UTILS = {
  buildProductFilters,
  buildCategoryFilters,
} as const;

// Legacy export
export const GRAPHQL_UTILS = {
  ...COMPOSITE_OPERATIONS,
  ...QUERY_UTILS,
} as const;
