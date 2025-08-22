// ====================================================================
// TEST CONFIGURATION AND UTILITIES
// ====================================================================

import { MockedProvider } from "@apollo/client/testing";
import { InMemoryCache } from "@apollo/client";
import React from "react";
import { createOptimizedCache } from "../src/managers";
// Note: userEvent would be imported from @testing-library/user-event in actual implementation

// Type for React node
type ReactNode = React.ReactNode;

// ================== MOCK DATA FACTORIES ==================

export const createMockProduct = (overrides: any = {}) => ({
  id: "1",
  name: "Test Product",
  slug: "test-product",
  description: "A test product for testing",
  isActive: true,
  brandId: "brand-1",
  unit: "piece",
  unitValue: 1,
  calories: 100,
  carbohydrates: 10,
  fats: 5,
  protein: 15,
  images: [
    {
      fileId: "file-1",
      priority: 1,
      url: "https://example.com/image.jpg",
    },
  ],
  tags: [
    {
      id: "tag-1",
      name: "Popular",
    },
  ],
  tagBinds: [
    {
      tagId: "tag-1",
      priority: 1,
    },
  ],
  pointBinds: [
    {
      pointId: "point-1",
      orderType: "DELIVERY",
    },
  ],
  categoryBinds: [
    {
      categoryId: "category-1",
      priority: 1,
    },
  ],
  categoryIds: ["category-1"], // Helper field for tests
  pricePoint: 500,
  priceSettings: {
    price: 500,
    priceOrderTypes: [
      {
        orderType: "DELIVERY",
        priceCommon: 500,
        priceCities: [],
        pricePoints: [
          {
            pointId: "point-1",
            price: 500,
          },
        ],
      },
    ],
  },
  __typename: "Product",
  ...overrides,
});

export const createMockCategory = (overrides: any = {}) => ({
  id: "category-1",
  name: "Test Category",
  slug: "test-category",
  imageUrl: "https://example.com/category.jpg",
  priority: 1,
  isActive: true,
  brandId: "brand-1",
  parentId: null,
  pointBinds: [
    {
      pointId: "point-1",
      orderType: "DELIVERY",
    },
  ],
  productsCount: 5,
  __typename: "Category",
  ...overrides,
});

export const createMockOrderItem = (overrides: any = {}) => ({
  id: "item-1",
  productId: "product-1",
  quantity: 1,
  price: 500,
  totalPrice: 500,
  modifiers: [],
  comment: "",
  __typename: "OrderItem",
  ...overrides,
});

export const createMockOrder = (overrides: any = {}) => ({
  id: "order-1",
  number: "ORD-001",
  type: "DELIVERY",
  status: "PENDING",
  comment: "Test order",
  priceTotal: 1000,
  personsNumber: 2,
  pointId: "point-1",
  brandId: "brand-1",
  items: [
    createMockOrderItem({
      id: "item-1",
      productId: "product-1",
      price: 500,
      quantity: 2,
    }),
  ],
  __typename: "Order",
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  id: "user-1",
  login: "testuser",
  name: "Test User",
  email: "test@example.com",
  phone: "+1234567890",
  __typename: "User",
  ...overrides,
});

export const createMockBrand = (overrides: any = {}) => ({
  id: "brand-1",
  name: "Test Brand",
  slug: "test-brand",
  isActive: true,
  accountId: "account-1",
  __typename: "Brand",
  ...overrides,
});

export const createMockPoint = (overrides: any = {}) => ({
  id: "point-1",
  name: "Test Point",
  address: "123 Test Street",
  priority: 1,
  isActive: true,
  brandId: "brand-1",
  cityId: "city-1",
  __typename: "Point",
  ...overrides,
});

export const createMockCity = (overrides: any = {}) => ({
  id: "city-1",
  name: "Test City",
  isActive: true,
  priority: 1,
  __typename: "City",
  ...overrides,
});

export const createMockTag = (overrides: any = {}) => ({
  id: "tag-1",
  name: "Test Tag",
  color: "#FF0000",
  priority: 1,
  isActive: true,
  brandId: "brand-1",
  __typename: "Tag",
  ...overrides,
});

export const createMockEmployee = (overrides: any = {}) => ({
  id: "employee-1",
  name: "Test Employee",
  email: "employee@test.com",
  role: "ADMIN",
  isActive: true,
  brandId: "brand-1",
  __typename: "Employee",
  ...overrides,
});

// ================== MOCK COLLECTIONS ==================

export const createMockProducts = (count: number = 3) =>
  Array.from({ length: count }, (_, i) =>
    createMockProduct({
      id: `product-${i + 1}`,
      name: `Test Product ${i + 1}`,
      slug: `test-product-${i + 1}`,
    })
  );

export const createMockCategories = (count: number = 3) =>
  Array.from({ length: count }, (_, i) =>
    createMockCategory({
      id: `category-${i + 1}`,
      name: `Test Category ${i + 1}`,
      slug: `test-category-${i + 1}`,
    })
  );

export const createMockOrders = (count: number = 3) =>
  Array.from({ length: count }, (_, i) =>
    createMockOrder({
      id: `order-${i + 1}`,
      number: `ORD-00${i + 1}`,
    })
  );

export const createMockTags = (count: number = 3) =>
  Array.from({ length: count }, (_, i) =>
    createMockTag({
      id: `tag-${i + 1}`,
      name: `Tag ${i + 1}`,
    })
  );

export const createMockEmployees = (count: number = 3) =>
  Array.from({ length: count }, (_, i) =>
    createMockEmployee({
      id: `employee-${i + 1}`,
      name: `Employee ${i + 1}`,
    })
  );

// ================== MOCK APOLLO CLIENT UTILITIES ==================

/**
 * Create optimized test cache with type policies
 */
export const createTestCache = () => {
  return createOptimizedCache({
    typePolicies: {
      Product: {
        fields: {
          categoryBinds: {
            merge: false,
          },
          pointBinds: {
            merge: false,
          },
        },
      },
      Category: {
        fields: {
          pointBinds: {
            merge: false,
          },
        },
      },
    } as any,
  });
};

/**
 * Create test wrapper with MockedProvider and enhanced cache
 */
export const createTestWrapper = (mocks: any[] = [], cache?: InMemoryCache) => {
  const testCache = cache || createTestCache();

  return ({ children }: { children: ReactNode }) => {
    return React.createElement(
      MockedProvider,
      {
        mocks: mocks,
        cache: testCache,
        addTypename: false,
        defaultOptions: {
          watchQuery: { errorPolicy: "all" },
          query: { errorPolicy: "all" },
        },
      },
      children
    );
  };
};

/**
 * Create mock GraphQL response with realistic data
 */
export const createMockResponse = ({
  query,
  variables = {},
  data = {},
  error = null,
  delay = 0,
  networkError = false,
}: {
  query: any;
  variables?: any;
  data?: any;
  error?: Error | null;
  delay?: number;
  networkError?: boolean;
}) => {
  const mockResponse: any = {
    request: {
      query,
      variables,
    },
  };

  if (networkError) {
    mockResponse.networkError = new Error("Network error");
  } else if (error) {
    mockResponse.error = error;
  } else {
    mockResponse.result = { data };
  }

  if (delay > 0) {
    mockResponse.delay = delay;
  }

  return mockResponse;
};

/**
 * Create mock error response with specific error types
 */
export const createMockError = (
  message: string = "GraphQL Error",
  extensions?: any
) => {
  const error = new Error(message);
  if (extensions) {
    (error as any).extensions = extensions;
  }
  return error;
};

/**
 * Create mock network error
 */
export const createMockNetworkError = (
  message: string = "Network request failed"
) => {
  const error = new Error(message);
  (error as any).networkError = true;
  return error;
};

/**
 * Create mock validation error
 */
export const createMockValidationError = (field: string, message: string) => {
  return createMockError(`Validation failed for field '${field}': ${message}`, {
    code: "VALIDATION_ERROR",
    field,
  });
};

// ================== TEST HELPERS ==================

/**
 * Wait for next tick (useful for async operations)
 */
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create a promise that resolves after specified time
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simulate network delay
 */
export const withNetworkDelay = async <T>(
  promise: Promise<T>,
  ms: number = 100
): Promise<T> => {
  await delay(ms);
  return promise;
};

/**
 * Create mock variables for common queries with type safety
 */
export const createMockVariables = {
  menu: {
    brandId: "brand-1",
    pointId: "point-1",
    orderType: "DELIVERY" as const,
  },
  product: {
    input: { id: "product-1", brandId: "brand-1" },
  },
  products: {
    input: { brandId: "brand-1" },
  },
  category: {
    input: { categoryId: "category-1" },
  },
  categories: {
    input: { brandId: "brand-1" },
  },
  order: {
    input: { orderId: "order-1" },
  },
  orders: {
    input: { brandId: "brand-1" },
  },
  user: {
    input: { userId: "user-1" },
  },
  createProduct: {
    input: {
      name: "New Product",
      brandId: "brand-1",
      description: "A new test product",
      priceSettings: {
        price: 1000,
        priceOrderTypes: [
          {
            orderType: "DELIVERY" as const,
            priceCommon: 1000,
          },
        ],
      },
    },
  },
  updateProduct: {
    input: {
      productId: "product-1",
      brandId: "brand-1",
      name: "Updated Product",
    },
  },
  deleteProduct: {
    input: {
      productId: "product-1",
      brandId: "brand-1",
    },
  },
};

// ================== VALIDATION HELPERS ==================

/**
 * Validate GraphQL fragment structure
 */
export const validateFragment = (fragment: any) => {
  expect(fragment).toBeDefined();
  expect(fragment.kind).toBe("Document");
  expect(fragment.definitions).toHaveLength(1);
  expect(fragment.definitions[0].kind).toBe("FragmentDefinition");
};

/**
 * Validate GraphQL query structure
 */
export const validateQuery = (query: any) => {
  expect(query).toBeDefined();
  expect(query.kind).toBe("Document");
  expect(query.definitions.length).toBeGreaterThan(0);
  expect(query.definitions[0].kind).toBe("OperationDefinition");
  expect(query.definitions[0].operation).toBe("query");
};

/**
 * Validate GraphQL mutation structure
 */
export const validateMutation = (mutation: any) => {
  expect(mutation).toBeDefined();
  expect(mutation.kind).toBe("Document");
  expect(mutation.definitions.length).toBeGreaterThan(0);
  expect(mutation.definitions[0].kind).toBe("OperationDefinition");
  expect(mutation.definitions[0].operation).toBe("mutation");
};

/**
 * Validate hook result structure
 */
export const validateHookResult = (
  result: any,
  expectedFields: string[] = ["loading", "data", "error"]
) => {
  expectedFields.forEach((field) => {
    expect(result).toHaveProperty(field);
  });
};

/**
 * Validate manager result structure
 */
export const validateManagerResult = (
  result: any,
  expectedFields: string[] = ["success", "error"]
) => {
  expectedFields.forEach((field) => {
    expect(result).toHaveProperty(field);
  });
};

// ================== PERFORMANCE TESTING ==================

/**
 * Measure execution time of a function
 */
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; time: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  return {
    result,
    time: end - start,
  };
};

/**
 * Create performance benchmark
 */
export const createBenchmark = (name: string, iterations: number = 100) => {
  const times: number[] = [];

  return {
    async run<T>(fn: () => Promise<T>): Promise<T> {
      const { result, time } = await measureExecutionTime(fn);
      times.push(time);
      return result;
    },

    getStats() {
      if (times.length === 0) {
        return null;
      }

      const sorted = [...times].sort((a, b) => a - b);

      return {
        name,
        runs: times.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        average: times.reduce((a, b) => a + b, 0) / times.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    },

    reset() {
      times.length = 0;
    },
  };
};

// ================== ADVANCED UTILITIES ==================

/**
 * Enhanced performance helpers
 */
export const createPerformanceHelpers = {
  measureAsyncOperation: async <T>(fn: () => Promise<T>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start,
    };
  },

  measureSyncOperation: <T>(fn: () => T) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return {
      result,
      duration: end - start,
    };
  },

  createMemoryTracker: () => {
    const startMemory =
      typeof performance !== "undefined" && performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;
    return {
      getUsage: () => {
        if (typeof performance !== "undefined" && performance.memory) {
          return performance.memory.usedJSHeapSize - startMemory;
        }
        return 0;
      },
      reset: () => {
        // Reset tracking if needed
      },
    };
  },
};

/**
 * Test scenario builders
 */
export const createTestScenarios = {
  productCRUD: () => ({
    create: createMockVariables.createProduct,
    read: createMockVariables.product,
    update: createMockVariables.updateProduct,
    delete: createMockVariables.deleteProduct,
  }),

  menuNavigation: () => ({
    loadCategories: createMockVariables.categories,
    loadProducts: createMockVariables.products,
    filterMenu: { ...createMockVariables.menu, filters: { isActive: true } },
  }),

  orderFlow: () => ({
    addToCart: { productId: "product-1", quantity: 2 },
    updateQuantity: { itemId: "item-1", quantity: 3 },
    checkout: { orderData: createMockOrder() },
  }),
};

/**
 * Enhanced validation helpers
 */
export const createValidationHelpers = {
  validateProductStructure: (product: any) => {
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("brandId");
    expect(product.__typename).toBe("Product");
  },

  validateCategoryStructure: (category: any) => {
    expect(category).toHaveProperty("id");
    expect(category).toHaveProperty("name");
    expect(category).toHaveProperty("brandId");
    expect(category.__typename).toBe("Category");
  },

  validateMenuStructure: (menu: any) => {
    expect(menu).toHaveProperty("categories");
    expect(menu).toHaveProperty("products");
    expect(Array.isArray(menu.categories)).toBe(true);
    expect(Array.isArray(menu.products)).toBe(true);
  },

  validateOrderStructure: (order: any) => {
    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("items");
    expect(order).toHaveProperty("priceTotal");
    expect(order.__typename).toBe("Order");
    expect(Array.isArray(order.items)).toBe(true);
  },
};

/**
 * User interaction helpers
 */
export const createUserInteractions = {
  selectProduct: (productId: string) => ({
    type: "SELECT_PRODUCT",
    payload: { productId },
  }),

  addToCart: (productId: string, quantity: number = 1) => ({
    type: "ADD_TO_CART",
    payload: { productId, quantity },
  }),

  filterByCategory: (categoryId: string) => ({
    type: "FILTER_BY_CATEGORY",
    payload: { categoryId },
  }),

  updateCartItem: (itemId: string, quantity: number) => ({
    type: "UPDATE_CART_ITEM",
    payload: { itemId, quantity },
  }),

  removeFromCart: (itemId: string) => ({
    type: "REMOVE_FROM_CART",
    payload: { itemId },
  }),
};

// ================== MEMORY USAGE HELPER ==================

/**
 * Get current memory usage (for performance testing)
 */
export const getMemoryUsage = (): number => {
  if (typeof performance !== "undefined" && performance.memory) {
    return performance.memory.usedJSHeapSize;
  }
  return 0;
};

// ================== EXPORTS ==================

export default {
  // Mock factories
  createMockProduct,
  createMockCategory,
  createMockOrder,
  createMockUser,
  createMockBrand,
  createMockPoint,
  createMockCity,
  createMockTag,
  createMockEmployee,
  createMockOrderItem,

  // Mock collections
  createMockProducts,
  createMockCategories,
  createMockOrders,
  createMockTags,
  createMockEmployees,

  // Apollo Client utilities
  createTestWrapper,
  createTestCache,
  createMockResponse,
  createMockError,
  createMockNetworkError,
  createMockValidationError,
  createMockVariables,

  // Test scenarios
  createTestScenarios,

  // Validation utilities
  validateFragment,
  validateQuery,
  validateMutation,
  validateHookResult,
  validateManagerResult,
  createValidationHelpers,

  // Performance utilities
  measureExecutionTime,
  createBenchmark,
  createPerformanceHelpers,

  // Integration testing
  createUserInteractions,

  // Utility functions
  waitForNextTick,
  delay,
  withNetworkDelay,
  getMemoryUsage,
};
