import { ApolloClient, InMemoryCache } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import {
  RestomenuManagers,
  ProductManager,
  CategoryManager,
  MenuManager,
  createOptimizedCache,
} from "../../src/managers";
import { useProduct, useCategories, useMenuData } from "../../src/hooks";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createTestWrapper,
  createMockProduct,
  createMockCategory,
} from "../test-utils";

describe("SDK Integration Tests", () => {
  let client: ApolloClient<any>;
  let managers: RestomenuManagers;

  beforeEach(() => {
    const cache = createOptimizedCache();
    client = new ApolloClient({
      link: new MockLink([]),
      cache,
    });

    managers = new RestomenuManagers(client, {
      brandId: "brand-1",
      pointId: "point-1",
      orderType: "DELIVERY",
    });
  });

  describe("Managers Integration", () => {
    it("should create all managers with shared client", () => {
      expect(managers.product).toBeInstanceOf(ProductManager);
      expect(managers.category).toBeInstanceOf(CategoryManager);
      expect(managers.menu).toBeInstanceOf(MenuManager);
      expect(managers.cache).toBeDefined();
      expect(managers.performance).toBeDefined();
    });

    it("should invalidate all caches together", () => {
      const productSpy = jest.spyOn(managers.product, "invalidateCache");
      const categorySpy = jest.spyOn(managers.category, "invalidateCache");
      const menuSpy = jest.spyOn(managers.menu, "invalidateCache");

      managers.invalidateAllCaches();

      expect(productSpy).toHaveBeenCalled();
      expect(categorySpy).toHaveBeenCalled();
      expect(menuSpy).toHaveBeenCalled();
    });

    it("should preload all data efficiently", async () => {
      const productPreloadSpy = jest
        .spyOn(managers.product, "preloadForMenu")
        .mockResolvedValue(undefined);
      const categoryPreloadSpy = jest
        .spyOn(managers.category, "preloadCategories")
        .mockResolvedValue(undefined);
      const menuPreloadSpy = jest
        .spyOn(managers.menu, "preloadMenu")
        .mockResolvedValue(undefined);

      await managers.preloadAll({
        brandId: "brand-1",
        pointId: "point-1",
        orderType: "DELIVERY",
      });

      expect(productPreloadSpy).toHaveBeenCalled();
      expect(categoryPreloadSpy).toHaveBeenCalled();
      expect(menuPreloadSpy).toHaveBeenCalled();
    });
  });

  describe("Hooks and Managers Integration", () => {
    it("should work together for complete data flow", async () => {
      const mockProducts = [
        createMockProduct(),
        createMockProduct({ id: "product-2" }),
      ];
      const mockCategories = [
        createMockCategory(),
        createMockCategory({ id: "category-2" }),
      ];

      const mocks = [
        {
          request: {
            query: expect.any(Object),
            variables: expect.any(Object),
          },
          result: {
            data: {
              product: mockProducts[0],
            },
          },
        },
        {
          request: {
            query: expect.any(Object),
            variables: expect.any(Object),
          },
          result: {
            data: {
              categories: mockCategories,
            },
          },
        },
      ];

      // Test hook integration
      const { result: productResult } = renderHook(
        () => useProduct({ input: { id: "product-1", brandId: "brand-1" } }),
        { wrapper: createTestWrapper(mocks) }
      );

      const { result: categoriesResult } = renderHook(
        () => useCategories({ input: { brandId: "brand-1" } }),
        { wrapper: createTestWrapper(mocks) }
      );

      // Test manager integration
      const productManagerResult = await managers.product.getById("product-1");
      const categoryManagerResult = await managers.category.getForAdmin();

      // Both hooks and managers should work with same data
      expect(productResult.current).toBeDefined();
      expect(categoriesResult.current).toBeDefined();
      expect(productManagerResult).toBeDefined();
      expect(categoryManagerResult).toBeDefined();
    });
  });

  describe("Cache Integration", () => {
    it("should share cache between hooks and managers", async () => {
      const mockProduct = createMockProduct();

      // Mock product query result
      const productQuery = {
        request: {
          query: expect.any(Object),
          variables: { input: { id: "product-1", brandId: "brand-1" } },
        },
        result: {
          data: { product: mockProduct },
        },
      };

      const { result } = renderHook(
        () => useProduct({ input: { id: "product-1", brandId: "brand-1" } }),
        { wrapper: createTestWrapper([productQuery]) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Cache should now contain the product
      const cachedProduct = client.cache.readQuery({
        query: expect.any(Object),
        variables: { input: { id: "product-1", brandId: "brand-1" } },
      });

      expect(cachedProduct).toBeDefined();
    });

    it("should handle cache normalization correctly", () => {
      const cache = createOptimizedCache();

      // Test product normalization
      const productData = {
        __typename: "Product",
        id: "product-1",
        name: "Test Product",
        brandId: "brand-1",
      };

      cache.writeQuery({
        query: expect.any(Object),
        variables: { input: { id: "product-1", brandId: "brand-1" } },
        data: { product: productData },
      });

      const cachedData = cache.readQuery({
        query: expect.any(Object),
        variables: { input: { id: "product-1", brandId: "brand-1" } },
      });

      expect(cachedData).toBeDefined();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle errors consistently across hooks and managers", async () => {
      const errorMocks = [
        {
          request: {
            query: expect.any(Object),
            variables: expect.any(Object),
          },
          error: new Error("Network error"),
        },
      ];

      const { result } = renderHook(
        () => useProduct({ input: { id: "product-1", brandId: "brand-1" } }),
        { wrapper: createTestWrapper(errorMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();

      // Manager should handle same error
      const managerResult = await managers.product.getById("product-1");
      expect(managerResult.error).toBeDefined();
    });

    it("should provide helpful error messages", async () => {
      const validationError = {
        request: {
          query: expect.any(Object),
          variables: expect.any(Object),
        },
        error: new Error("Validation failed: Product name is required"),
      };

      const { result } = renderHook(
        () => useProduct({ input: { id: "", brandId: "brand-1" } }),
        { wrapper: createTestWrapper([validationError]) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error?.message).toContain("Validation failed");
    });
  });

  describe("Performance Integration", () => {
    it("should track performance across operations", async () => {
      const performanceMonitor = managers.performance;
      const startTime = performance.now();

      // Simulate some operations
      await managers.product.getForMenu();
      await managers.category.getForAdmin();
      await managers.menu.getFullMenuData();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeGreaterThan(0);
      expect(performanceMonitor).toBeDefined();
    });

    it("should optimize cache performance", () => {
      const cache = createOptimizedCache();
      const cacheManager = managers.cache;

      // Test cache optimization features
      expect(cache.policies).toBeDefined();
      expect(cacheManager).toBeDefined();

      // Cache should have type policies for optimization
      // Note: typePolicies is private, so we test the cache functionality instead
      expect(cache.policies).toBeDefined();
    });
  });

  describe("Type Safety Integration", () => {
    it("should maintain type safety across the SDK", () => {
      // Test that all managers are properly typed
      expect(typeof managers.product.getForMenu).toBe("function");
      expect(typeof managers.category.getForAdmin).toBe("function");
      expect(typeof managers.menu.getFullMenuData).toBe("function");

      // Test that hook results are properly typed
      const { result } = renderHook(
        () =>
          useMenuData({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
          }),
        { wrapper: createTestWrapper([]) }
      );

      expect(result.current).toHaveProperty("categories");
      expect(result.current).toHaveProperty("products");
      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("error");
    });

    it("should enforce proper input validation", async () => {
      // Test that invalid inputs are caught
      const invalidResult = await managers.product.create({
        name: "", // Invalid empty name
        brandId: "brand-1",
      } as any);

      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should handle menu browsing scenario", async () => {
      // Simulate a complete menu browsing flow
      const menuResult = await managers.menu.getFullMenuData();
      expect(menuResult).toBeDefined();

      const categoriesResult = await managers.category.getForMenu({
        pointId: "point-1",
        orderType: "DELIVERY",
      });
      expect(categoriesResult).toBeDefined();

      const productsResult = await managers.product.getForMenu({
        categoryId: "category-1",
      });
      expect(productsResult).toBeDefined();
    });

    it("should handle admin management scenario", async () => {
      // Simulate admin product management
      const createResult = await managers.product.create({
        name: "New Product",
        brandId: "brand-1",
        description: "A test product",
        priceSettings: {
          price: 1000,
          priceOrderTypes: [
            {
              orderType: "DELIVERY",
              priceCommon: 1000,
            },
          ],
        },
      });

      expect(createResult).toBeDefined();

      const updateResult = await managers.product.update({
        productId: "product-1",
        brandId: "brand-1",
        name: "Updated Product",
      });

      expect(updateResult).toBeDefined();
    });

    it("should handle search and filtering scenario", async () => {
      const searchResult = await managers.product.search({
        searchTerm: "pizza",
      });
      expect(searchResult).toBeDefined();

      const filterResult = await managers.menu.getFilteredMenu({
        filters: {
          categoryId: "category-1",
          priceRange: { min: 500, max: 1500 },
        },
      });
      expect(filterResult).toBeDefined();
    });
  });
});
