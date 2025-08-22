import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { MenuManager } from "../../src/managers/MenuManager";
import { GET_MENU_DATA } from "../../src/graphql/utils";
import {
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_AVAILABLE_CATEGORIES,
} from "../../src/graphql/queries/category";
import {
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
} from "../../src/graphql/queries/product";

// Mock Apollo Client
const createMockClient = (mockResponses: any[] = []) => {
  let responseIndex = 0;

  const mockLink = new ApolloLink(() => {
    return new Observable((observer) => {
      const response = mockResponses[responseIndex++] || { data: {} };

      if (response.error) {
        observer.error(response.error);
      } else {
        observer.next(response);
        observer.complete();
      }
    });
  });

  return new ApolloClient({
    link: mockLink,
    cache: new InMemoryCache(),
  });
};

// Mock data
const mockCategory = {
  id: "category-1",
  name: "Test Category",
  slug: "test-category",
  imageUrl: "https://example.com/category.jpg",
  priority: 1,
  isActive: true,
  brandId: "brand-1",
  parentId: null,
  productsCount: 2,
};

const mockProduct = {
  id: "product-1",
  name: "Test Product",
  slug: "test-product",
  description: "A test product",
  isActive: true,
  brandId: "brand-1",
  images: [
    {
      fileId: "file-1",
      priority: 1,
      url: "https://example.com/image.jpg",
    },
  ],
  pricePoint: 500,
  categoryBinds: [
    {
      categoryId: "category-1",
      priority: 1,
    },
  ],
};

const mockCategories = [
  mockCategory,
  { ...mockCategory, id: "category-2", name: "Test Category 2" },
];

const mockProducts = [
  mockProduct,
  { ...mockProduct, id: "product-2", name: "Test Product 2" },
];

const mockMenuData = {
  categories: mockCategories,
  products: mockProducts,
  organizedCategories: [
    {
      category: mockCategory,
      products: mockProducts,
    },
  ],
  uncategorizedProducts: [],
  totalProducts: 2,
  totalCategories: 2,
};

describe("MenuManager", () => {
  let menuManager: MenuManager;
  let mockClient: ApolloClient<any>;

  beforeEach(() => {
    mockClient = createMockClient();
    menuManager = new MenuManager({
      client: mockClient,
      defaultBrandId: "brand-1",
      defaultPointId: "point-1",
      defaultOrderType: "DELIVERY",
    });
  });

  describe("getMenuData", () => {
    it("should fetch complete menu data successfully", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getMenuData();

      expect(result.categories).toEqual(mockCategories);
      expect(result.products).toEqual(mockProducts);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Network error");
      mockClient = createMockClient([{ error: mockError }]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getMenuData();

      expect(result.categories).toEqual([]);
      expect(result.products).toEqual([]);
      expect(result.loading).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it("should throw error when required parameters are missing", async () => {
      const menuManagerWithoutDefaults = new MenuManager({
        client: mockClient,
      });

      const result = await menuManagerWithoutDefaults.getMenuData();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain(
        "brandId, pointId, and orderType are required"
      );
    });
  });

  describe("getOrganizedMenuData", () => {
    it("should organize menu data by categories", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getOrganizedMenuData();

      expect(result.organizedCategories).toHaveLength(2);
      expect(result.organizedCategories[0].category).toEqual(mockCategories[0]);
      expect(result.organizedCategories[0].products).toHaveLength(2);
      expect(result.totalCategories).toBe(2);
      expect(result.totalProducts).toBe(2);
    });

    it("should handle uncategorized products", async () => {
      const uncategorizedProduct = {
        ...mockProduct,
        id: "product-3",
        categoryBinds: [], // No category binds
      };

      const mockResponse = {
        data: {
          categories: mockCategories,
          products: [...mockProducts, uncategorizedProduct],
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getOrganizedMenuData();

      expect(result.uncategorizedProducts).toHaveLength(1);
      expect(result.uncategorizedProducts[0].id).toBe("product-3");
    });
  });

  describe("search", () => {
    it("should search products and categories", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.search({
        searchTerm: "Test",
      });

      expect(result.products).toEqual(mockProducts);
      expect(result.categories).toEqual(mockCategories);
      expect(result.searchTerm).toBe("Test");
    });

    it("should filter results by search term", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.search({
        searchTerm: "Product 2",
      });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe("Test Product 2");
    });
  });

  describe("filterMenu", () => {
    it("should apply filters to menu data", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.filterMenu({
        categoryId: "category-1",
      });

      expect(
        result.products.every((p) =>
          p.categoryBinds?.some((bind: any) => bind.categoryId === "category-1")
        )
      ).toBe(true);
    });

    it("should filter by price range", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.filterMenu({
        priceRange: {
          min: 400,
          max: 600,
        },
      });

      expect(
        result.products.every((p) => p.pricePoint >= 400 && p.pricePoint <= 600)
      ).toBe(true);
    });

    it("should sort results correctly", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.filterMenu({
        sortBy: "name",
        sortOrder: "asc",
      });

      const sortedNames = result.products.map((p) => p.name);
      const expectedSortedNames = [...sortedNames].sort();
      expect(sortedNames).toEqual(expectedSortedNames);
    });
  });

  describe("getAvailableCategories", () => {
    it("should fetch available categories for point", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getAvailableCategories();

      expect(result.categories).toEqual(mockCategories);
      expect(result.total).toBe(2);
    });
  });

  describe("getProductsByCategory", () => {
    it("should fetch products for specific category", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getProductsByCategory("category-1");

      expect(result.products).toEqual(mockProducts);
      expect(result.categoryId).toBe("category-1");
    });
  });

  describe("preloadMenu", () => {
    it("should preload menu data into cache", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.preloadMenu();

      expect(result.success).toBe(true);
      expect(result.preloadedCategories).toBe(2);
      expect(result.preloadedProducts).toBe(2);
    });
  });

  describe("getCategoryProductsCount", () => {
    it("should get products count for each category", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories.map((cat) => ({
            ...cat,
            productsCount: 2,
          })),
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getCategoryProductsCount();

      expect(result.categoryStats).toHaveLength(2);
      expect(result.categoryStats[0].productsCount).toBe(2);
      expect(result.totalProducts).toBe(4);
    });
  });

  describe("getMenuStats", () => {
    it("should calculate menu statistics", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      menuManager = new MenuManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await menuManager.getMenuStats();

      expect(result.stats.totalCategories).toBe(2);
      expect(result.stats.totalProducts).toBe(2);
      expect(result.stats.activeCategories).toBe(2);
      expect(result.stats.activeProducts).toBe(2);
      expect(result.stats.avgProductsPerCategory).toBe(1);
    });
  });

  describe("invalidateCache", () => {
    it("should invalidate menu cache", () => {
      const refetchQueriesSpy = jest.spyOn(mockClient, "refetchQueries");

      menuManager.invalidateCache();

      expect(refetchQueriesSpy).toHaveBeenCalledWith({
        include: [
          "GetMenuData",
          "GetCategoriesWithProductsCount",
          "GetAvailableProducts",
        ],
      });
    });
  });

  describe("static factory methods", () => {
    it("should create instance with create method", () => {
      const manager = MenuManager.create({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      expect(manager).toBeInstanceOf(MenuManager);
    });

    it("should create instance with createWithClient method", () => {
      const manager = MenuManager.createWithClient(mockClient, {
        brandId: "brand-1",
        pointId: "point-1",
        orderType: "DELIVERY",
      });

      expect(manager).toBeInstanceOf(MenuManager);
    });
  });
});
