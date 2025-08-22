import { ApolloClient, InMemoryCache } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import {
  RestomenuManagers,
  createOptimizedCache,
  PerformanceMonitor,
} from "../../src/managers";
import {
  createMockProducts,
  createMockCategories,
  createMockOrders,
  createPerformanceHelpers,
  createBenchmark,
} from "../test-utils";

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  CACHE_WRITE: 50, // ms
  CACHE_READ: 10, // ms
  QUERY_EXECUTION: 100, // ms
  MANAGER_OPERATION: 200, // ms
  BULK_OPERATION: 500, // ms
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
};

const LARGE_DATASET_SIZES = {
  SMALL: 100,
  MEDIUM: 1000,
  LARGE: 5000,
};

describe("SDK Performance Tests", () => {
  let client: ApolloClient<any>;
  let managers: RestomenuManagers;
  let performanceMonitor: PerformanceMonitor;
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = createOptimizedCache();
    client = new ApolloClient({
      link: new MockLink([]),
      cache,
    });

    managers = new RestomenuManagers(client, {
      brandId: "brand-1",
      pointId: "point-1",
      orderType: "DELIVERY",
    });

    performanceMonitor = new PerformanceMonitor();
  });

  afterEach(() => {
    // Clean up memory after each test
    cache.evict({ id: "ROOT_QUERY" });
    cache.gc();
  });

  describe("Cache Performance", () => {
    it("should write to cache within performance threshold", async () => {
      const products = createMockProducts(LARGE_DATASET_SIZES.MEDIUM);
      const { measureAsyncOperation } = createPerformanceHelpers;

      const { duration } = await measureAsyncOperation(async () => {
        products.forEach((product, index) => {
          cache.writeQuery({
            query: {} as any,
            variables: { input: { id: product.id } },
            data: { product },
          });
        });
      });

      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS.CACHE_WRITE * products.length
      );
    });

    it("should read from cache within performance threshold", async () => {
      const products = createMockProducts(LARGE_DATASET_SIZES.SMALL);
      const { measureAsyncOperation } = createPerformanceHelpers;

      // Pre-populate cache
      products.forEach((product) => {
        cache.writeQuery({
          query: {} as any,
          variables: { input: { id: product.id } },
          data: { product },
        });
      });

      const { duration } = await measureAsyncOperation(async () => {
        products.forEach((product) => {
          cache.readQuery({
            query: {} as any,
            variables: { input: { id: product.id } },
          });
        });
      });

      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS.CACHE_READ * products.length
      );
    });

    it("should handle cache normalization efficiently", () => {
      const products = createMockProducts(LARGE_DATASET_SIZES.LARGE);
      const startMemory = getMemoryUsage();
      const startTime = performance.now();

      products.forEach((product) => {
        cache.writeQuery({
          query: {} as any,
          variables: { input: { id: product.id } },
          data: { product },
        });
      });

      const endTime = performance.now();
      const endMemory = getMemoryUsage();

      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_OPERATION);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE);
    });

    it("should efficiently garbage collect unused data", () => {
      const products = createMockProducts(LARGE_DATASET_SIZES.MEDIUM);

      // Fill cache
      products.forEach((product) => {
        cache.writeQuery({
          query: {} as any,
          variables: { input: { id: product.id } },
          data: { product },
        });
      });

      const beforeGC = getMemoryUsage();

      // Evict half the data
      products.slice(0, products.length / 2).forEach((product) => {
        cache.evict({ id: cache.identify(product) });
      });

      cache.gc();

      const afterGC = getMemoryUsage();
      const memoryFreed = beforeGC - afterGC;

      // Should free some memory
      expect(memoryFreed).toBeGreaterThan(0);
    });
  });

  describe("Manager Performance", () => {
    it("should execute product operations within threshold", async () => {
      const benchmark = createBenchmark("ProductManager Operations", 100);

      for (let i = 0; i < 10; i++) {
        await benchmark.run(async () => {
          await managers.product.getForMenu();
        });
      }

      const stats = benchmark.getStats();
      expect(stats?.average).toBeLessThan(
        PERFORMANCE_THRESHOLDS.MANAGER_OPERATION
      );
      expect(stats?.p95).toBeLessThan(
        PERFORMANCE_THRESHOLDS.MANAGER_OPERATION * 2
      );
    });

    it("should handle batch operations efficiently", async () => {
      const products = Array.from({ length: 50 }, (_, i) => ({
        productId: `product-${i}`,
        updates: { name: `Updated Product ${i}` },
      }));

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          await managers.product.batchUpdate(products);
        }
      );

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_OPERATION);
    });

    it("should optimize category hierarchy building", async () => {
      const categories = createMockCategories(LARGE_DATASET_SIZES.MEDIUM);

      // Create nested hierarchy
      categories.forEach((category, index) => {
        if (index > 0 && index % 5 === 0) {
          category.parentId = categories[Math.floor(index / 5) - 1].id;
        }
      });

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          await managers.category.getHierarchy();
        }
      );

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MANAGER_OPERATION);
    });

    it("should efficiently organize menu data", async () => {
      const categories = createMockCategories(20);
      const products = createMockProducts(200);

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          await managers.menu.getOrganizedMenuData();
        }
      );

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MANAGER_OPERATION);
    });
  });

  describe("Query Performance", () => {
    it("should execute complex queries within threshold", async () => {
      const complexQueries = [
        () => managers.product.getForMenu({ categoryId: "category-1" }),
        () =>
          managers.category.getWithProductsCount({
            pointId: "point-1",
            orderType: "DELIVERY",
          }),
        () => managers.menu.search({ searchTerm: "pizza" }),
        () =>
          managers.menu.filterMenu({
            categoryId: "category-1",
            priceRange: { min: 500, max: 1500 },
            sortBy: "name",
            sortOrder: "asc",
          }),
      ];

      for (const queryFn of complexQueries) {
        const { duration } =
          await createPerformanceHelpers.measureAsyncOperation(queryFn);
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.QUERY_EXECUTION);
      }
    });

    it("should handle concurrent queries efficiently", async () => {
      const concurrentQueries = Array.from({ length: 10 }, () =>
        managers.product.getForMenu()
      );

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          await Promise.all(concurrentQueries);
        }
      );

      // Concurrent queries should not take much longer than sequential
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.QUERY_EXECUTION * 2);
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory during operations", async () => {
      const initialMemory = getMemoryUsage();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await managers.product.getForMenu();
        await managers.category.getForBrand();

        // Periodically clean up
        if (i % 10 === 0) {
          cache.gc();
        }
      }

      const finalMemory = getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE);
    });

    it("should efficiently handle large datasets", () => {
      const largeProducts = createMockProducts(LARGE_DATASET_SIZES.LARGE);
      const largeCategories = createMockCategories(LARGE_DATASET_SIZES.MEDIUM);
      const largeOrders = createMockOrders(LARGE_DATASET_SIZES.MEDIUM);

      const beforeMemory = getMemoryUsage();

      // Store large datasets in cache
      largeProducts.forEach((product) => {
        cache.writeQuery({
          query: {} as any,
          variables: { input: { id: product.id } },
          data: { product },
        });
      });

      largeCategories.forEach((category) => {
        cache.writeQuery({
          query: {} as any,
          variables: { input: { categoryId: category.id } },
          data: { category },
        });
      });

      const afterMemory = getMemoryUsage();
      const memoryUsed = afterMemory - beforeMemory;

      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE * 2);
    });
  });

  describe("Real-world Performance Scenarios", () => {
    it("should handle menu loading performance", async () => {
      // Simulate realistic menu with 50 categories and 500 products
      const categories = createMockCategories(50);
      const products = createMockProducts(500);

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          await managers.menu.getMenuData();
          await managers.menu.getOrganizedMenuData();
        }
      );

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_OPERATION);
    });

    it("should handle admin dashboard loading performance", async () => {
      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          await Promise.all([
            managers.product.getForAdmin(),
            managers.category.getForBrand(),
            managers.menu.getMenuStats(),
          ]);
        }
      );

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_OPERATION);
    });

    it("should handle search performance", async () => {
      const searchTerms = ["pizza", "burger", "salad", "drink", "dessert"];

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          for (const term of searchTerms) {
            await managers.product.search({ searchTerm: term });
          }
        }
      );

      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS.MANAGER_OPERATION * searchTerms.length
      );
    });

    it("should handle filter performance", async () => {
      const filters = [
        { categoryId: "category-1" },
        { priceRange: { min: 500, max: 1000 } },
        { tagIds: ["tag-1", "tag-2"] },
        { searchTerm: "test", sortBy: "price", sortOrder: "desc" },
      ];

      const { duration } = await createPerformanceHelpers.measureAsyncOperation(
        async () => {
          for (const filter of filters) {
            await managers.menu.filterMenu(filter as any);
          }
        }
      );

      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS.MANAGER_OPERATION * filters.length
      );
    });
  });

  describe("Performance Monitoring", () => {
    it("should track operation performance", () => {
      performanceMonitor.markStart("test-operation");

      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait 10ms
      }

      performanceMonitor.markEnd("test-operation");

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveProperty("test-operation");
      expect(metrics["test-operation"]).toBeGreaterThan(0);
    });

    it("should provide performance insights", () => {
      const insights = performanceMonitor.getInsights();
      expect(insights).toBeDefined();
      expect(Array.isArray(insights.slowOperations)).toBe(true);
      expect(Array.isArray(insights.memoryLeaks)).toBe(true);
    });
  });
});

// Helper function to get memory usage (simplified for testing)
function getMemoryUsage(): number {
  if (typeof process !== "undefined" && process.memoryUsage) {
    return process.memoryUsage().heapUsed;
  }

  // Fallback for browser environment
  if (typeof performance !== "undefined" && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }

  // Fallback to timestamp as proxy
  return Date.now() % 1000000;
}
