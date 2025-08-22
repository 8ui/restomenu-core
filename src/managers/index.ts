// ====================================================================
// MANAGERS INDEX - High-level business logic managers
// ====================================================================

// Import managers and factories
import { ProductManager, ProductManagerFactory } from "./ProductManager";
import { CategoryManager, CategoryManagerFactory } from "./CategoryManager";
import { MenuManager, MenuManagerFactory } from "./MenuManager";
import { BrandManager, BrandManagerFactory } from "./BrandManager";
import { CityManager, CityManagerFactory } from "./CityManager";
import { PointManager, PointManagerFactory } from "./PointManager";
import { OrderManager, OrderManagerFactory } from "./OrderManager";
import { UserManager, UserManagerFactory } from "./UserManager";

// Export individual managers
export { ProductManager, ProductManagerFactory } from "./ProductManager";
export { CategoryManager, CategoryManagerFactory } from "./CategoryManager";
export { MenuManager, MenuManagerFactory } from "./MenuManager";
export { BrandManager, BrandManagerFactory } from "./BrandManager";
export { CityManager, CityManagerFactory } from "./CityManager";
export { PointManager, PointManagerFactory } from "./PointManager";
export { OrderManager, OrderManagerFactory } from "./OrderManager";
export { UserManager, UserManagerFactory } from "./UserManager";

// Export manager types
export type {
  ProductManagerConfig,
  ProductFilter,
  CreateProductInput,
} from "./ProductManager";

export type {
  CategoryManagerConfig,
  CategoryFilter,
  CreateCategoryInput,
  CategoryHierarchy,
} from "./CategoryManager";

export type { MenuManagerConfig, MenuFilter, MenuData } from "./MenuManager";

export type {
  BrandManagerConfig,
  BrandFilter,
  CreateElectronicMenuInput,
} from "./BrandManager";

export type { CityManagerConfig, CityFilter } from "./CityManager";

export type {
  PointManagerConfig,
  PointFilter,
  CreatePointInput,
  UpdatePointInput,
} from "./PointManager";

export type {
  OrderManagerConfig,
  OrderFilter,
  CreatePreOrderInput,
  UpdatePreOrderInput,
} from "./OrderManager";

export type {
  UserManagerConfig,
  EmployeeFilter,
  AuthenticationCredentials,
  RestoplaceCredentials,
} from "./UserManager";

// ====================================================================
// APOLLO CLIENT CACHE OPTIMIZATION
// ====================================================================

import { InMemoryCache, TypePolicies } from "@apollo/client";

/**
 * Optimized cache configuration for Restomenu GraphQL operations
 */
export const createOptimizedCache = (customTypePolicies: TypePolicies = {}) => {
  const typePolicies: TypePolicies = {
    Query: {
      fields: {
        // Product caching strategies
        products: {
          keyArgs: ["input", ["brandId", "filter"]],
          merge(existing = [], incoming, { args }) {
            // Merge strategy for products lists
            const offset = args?.input?.offset || 0;
            const merged = [...existing];

            for (let i = 0; i < incoming.length; i++) {
              merged[offset + i] = incoming[i];
            }

            return merged;
          },
        },

        // Category caching strategies
        categories: {
          keyArgs: ["input", ["brandId", "filter"]],
          merge(existing = [], incoming) {
            // Simple replacement for categories as they're typically smaller datasets
            return incoming;
          },
        },

        // Menu data caching
        menuData: {
          keyArgs: ["brandId", "pointId", "orderType"],
          merge(existing, incoming) {
            return {
              ...existing,
              ...incoming,
            };
          },
        },
      },
    },

    Product: {
      fields: {
        // Price point caching with point-specific keys
        pricePoint: {
          keyArgs: ["input", ["pointId", "orderType"]],
          read(existing, { args, readField }) {
            // Custom price reading logic
            const pointId = args?.input?.pointId;
            const orderType = args?.input?.orderType;

            if (!pointId || !orderType) {
              return existing;
            }

            // Try to read from price settings if direct price not available
            const priceSettings = readField("priceSettings");
            if (!existing && priceSettings) {
              // Calculate price from settings
              return calculatePriceFromSettings(
                priceSettings,
                pointId,
                orderType
              );
            }

            return existing;
          },
        },

        // Product images optimization
        images: {
          merge(existing = [], incoming) {
            // Sort images by priority
            return [...incoming].sort(
              (a, b) => (a.priority || 0) - (b.priority || 0)
            );
          },
        },

        // Category bindings
        categoryBinds: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },

        // Point bindings
        pointBinds: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },

    Category: {
      fields: {
        // Products count caching
        productsCount: {
          keyArgs: ["input", ["filter"]],
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },

    Order: {
      fields: {
        // Order items
        items: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },

    // Custom type policies
    ...customTypePolicies,
  };

  return new InMemoryCache({
    typePolicies,

    // Additional cache configuration
    addTypename: true,

    // Garbage collection configuration
    possibleTypes: {
      // Add your union/interface types here if needed
    },

    // Cache size limits (optional)
    // maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  });
};

/**
 * Helper function to calculate price from price settings
 */
function calculatePriceFromSettings(
  priceSettings: any,
  pointId: string,
  orderType: string
): number | null {
  if (!priceSettings || !priceSettings.priceOrderTypes) {
    return priceSettings?.price || null;
  }

  // Find price for specific order type
  const orderTypePrice = priceSettings.priceOrderTypes.find(
    (pot: any) => pot.orderType === orderType
  );

  if (!orderTypePrice) {
    return priceSettings.price || null;
  }

  // Check for point-specific price
  const pointPrice = orderTypePrice.pricePoints?.find(
    (pp: any) => pp.pointId === pointId
  );

  if (pointPrice && pointPrice.price) {
    return pointPrice.price;
  }

  // Check for city-specific price (would need city info)
  // For now, fall back to common price
  return orderTypePrice.priceCommon || priceSettings.price || null;
}

// ====================================================================
// CACHE UTILITIES
// ====================================================================

/**
 * Cache utility functions for managers
 */
export class RestomenuCacheManager {
  private client: any;

  constructor(apolloClient: any) {
    this.client = apolloClient;
  }

  /**
   * Evict specific product from cache
   */
  evictProduct(productId: string) {
    this.client.cache.evict({
      id: this.client.cache.identify({ __typename: "Product", id: productId }),
    });
    this.client.cache.gc();
  }

  /**
   * Evict specific category from cache
   */
  evictCategory(categoryId: string) {
    this.client.cache.evict({
      id: this.client.cache.identify({
        __typename: "Category",
        id: categoryId,
      }),
    });
    this.client.cache.gc();
  }

  /**
   * Clear all menu-related cache
   */
  clearMenuCache() {
    this.client.cache.evict({ fieldName: "products" });
    this.client.cache.evict({ fieldName: "categories" });
    this.client.cache.evict({ fieldName: "menuData" });
    this.client.cache.gc();
  }

  /**
   * Update product in cache
   */
  updateProductInCache(productId: string, updates: any) {
    const productRef = this.client.cache.identify({
      __typename: "Product",
      id: productId,
    });

    if (productRef) {
      this.client.cache.modify({
        id: productRef,
        fields: {
          ...updates,
        },
      });
    }
  }

  /**
   * Update category in cache
   */
  updateCategoryInCache(categoryId: string, updates: any) {
    const categoryRef = this.client.cache.identify({
      __typename: "Category",
      id: categoryId,
    });

    if (categoryRef) {
      this.client.cache.modify({
        id: categoryRef,
        fields: {
          ...updates,
        },
      });
    }
  }

  /**
   * Prefetch data for better performance
   */
  async prefetchMenuData(variables: {
    brandId: string;
    pointId: string;
    orderType: string;
  }) {
    // This would be implemented with actual queries
    // For now, just a placeholder
    console.log("Prefetching menu data for:", variables);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cache = this.client.cache;

    return {
      size: cache.data.data.size || 0,
      // Add more stats as needed
      objects: Object.keys(cache.data.data || {}).length,
    };
  }
}

// ====================================================================
// PERFORMANCE UTILITIES
// ====================================================================

/**
 * Performance monitoring utilities
 */
export class RestomenuPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Start timing an operation
   */
  startTiming(operationName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.metrics.has(operationName)) {
        this.metrics.set(operationName, []);
      }

      this.metrics.get(operationName)!.push(duration);
    };
  }

  /**
   * Get performance statistics
   */
  getStats(operationName?: string) {
    if (operationName) {
      const times = this.metrics.get(operationName) || [];
      if (times.length === 0) return null;

      return {
        operation: operationName,
        count: times.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }

    // Return stats for all operations
    const allStats: any = {};
    for (const [name, times] of this.metrics.entries()) {
      allStats[name] = {
        count: times.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }

    return allStats;
  }

  /**
   * Clear metrics
   */
  clear(operationName?: string) {
    if (operationName) {
      this.metrics.delete(operationName);
    } else {
      this.metrics.clear();
    }
  }
}

// ====================================================================
// MANAGER COLLECTION FOR EASY ACCESS
// ====================================================================

/**
 * Collection of all managers for convenient access
 */
export class RestomenuManagers {
  public product: ProductManager;
  public category: CategoryManager;
  public menu: MenuManager;
  public brand: BrandManager;
  public city: CityManager;
  public point: PointManager;
  public order: OrderManager;
  public user: UserManager;
  public cache: RestomenuCacheManager;
  public performance: RestomenuPerformanceMonitor;

  constructor(
    apolloClient: any,
    defaults: {
      brandId?: string;
      pointId?: string;
      orderType?: "DELIVERY" | "PICKUP";
      accountId?: string;
      cityId?: string;
      employeeId?: string;
    } = {}
  ) {
    // Initialize managers with shared config
    this.product = ProductManagerFactory.createWithClient(apolloClient, {
      brandId: defaults.brandId,
      pointId: defaults.pointId,
      orderType: defaults.orderType,
    });

    this.category = CategoryManagerFactory.createWithClient(
      apolloClient,
      defaults.brandId
    );

    this.menu = MenuManagerFactory.createWithClient(apolloClient, {
      brandId: defaults.brandId,
      pointId: defaults.pointId,
      orderType: defaults.orderType,
    });

    this.brand = BrandManagerFactory.createWithDefaults(
      apolloClient,
      defaults.accountId
    );

    this.city = CityManagerFactory.createWithDefaults(
      apolloClient,
      defaults.brandId
    );

    this.point = PointManagerFactory.createWithDefaults(
      apolloClient,
      defaults.brandId,
      defaults.cityId
    );

    this.order = OrderManagerFactory.createWithDefaults(
      apolloClient,
      defaults.employeeId,
      defaults.pointId,
      defaults.brandId
    );

    this.user = UserManagerFactory.createWithDefaults(
      apolloClient,
      defaults.accountId
    );

    // Initialize utilities
    this.cache = new RestomenuCacheManager(apolloClient);
    this.performance = new RestomenuPerformanceMonitor();
  }

  /**
   * Update default context for all managers
   */
  updateDefaults(newDefaults: {
    brandId?: string;
    pointId?: string;
    orderType?: "DELIVERY" | "PICKUP";
    accountId?: string;
    cityId?: string;
    employeeId?: string;
  }) {
    // This would require updating the manager configs
    // For now, suggest creating new managers with new defaults
    console.warn(
      "updateDefaults: Consider creating new RestomenuManagers instance with new defaults"
    );
  }

  /**
   * Get all managers for debugging/inspection
   */
  getAllManagers() {
    return {
      product: this.product,
      category: this.category,
      menu: this.menu,
      brand: this.brand,
      city: this.city,
      point: this.point,
      order: this.order,
      user: this.user,
      cache: this.cache,
      performance: this.performance,
    };
  }
  /**
   * Invalidate all caches
   */
  invalidateAllCaches() {
    this.product?.invalidateCache();
    this.category?.invalidateCache();
    this.menu?.invalidateCache();
  }

  /**
   * Preload all essential data
   */
  async preloadAll(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
    } = {}
  ) {
    await Promise.all([
      this.menu?.preloadMenu(options),
      this.product?.preloadForMenu(options),
      this.category?.preloadCategories(options.brandId),
    ]);
  }
}

// Export utility classes with aliases
export {
  RestomenuCacheManager as CacheManager,
  RestomenuPerformanceMonitor as PerformanceMonitor,
  RestomenuManagers as Managers,
};
