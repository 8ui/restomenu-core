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

  describe("getFullMenuData", () => {
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

      const result = await menuManager.getFullMenuData();

      expect(result.data?.categories).toEqual(mockCategories);
      expect(result.data?.products).toEqual(mockProducts);
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

      const result = await menuManager.getFullMenuData();

      expect(result.data).toBeNull();
      expect(result.loading).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it("should throw error when required parameters are missing", async () => {
      const menuManagerWithoutDefaults = new MenuManager({
        client: mockClient,
      });

      const result = await menuManagerWithoutDefaults.getFullMenuData();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain(
        "brandId, pointId, and orderType are required"
      );
    });
  });

  describe("getFullMenuData with organized data", () => {
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

      const result = await menuManager.getFullMenuData();

      expect(result.data?.organizedCategories).toHaveLength(2);
      expect(result.data?.organizedCategories[0].category).toEqual(
        mockCategories[0]
      );
      expect(result.data?.organizedCategories[0].products).toHaveLength(2);
      expect(result.data?.totalCategories).toBe(2);
      expect(result.data?.totalProducts).toBe(2);
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

      const result = await menuManager.getFullMenuData();

      expect(result.data?.uncategorizedProducts).toHaveLength(1);
      expect(result.data?.uncategorizedProducts[0].id).toBe("product-3");
    });
  });

  describe("searchMenu", () => {
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

      const result = await menuManager.searchMenu({
        searchTerm: "Test",
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.searchTerm).toBe("Test");
      expect(result.productCount).toBeGreaterThan(0);
      expect(result.categoryCount).toBeGreaterThan(0);
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

      const result = await menuManager.searchMenu({
        searchTerm: "Product 2",
      });

      expect(result.searchTerm).toBe("Product 2");
      expect(result.totalResults).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getFilteredMenu", () => {
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

      const result = await menuManager.getFilteredMenu({
        filters: {
          categoryId: "category-1",
        },
      });

      expect(result.appliedFilters.categoryId).toBe("category-1");
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
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

      const result = await menuManager.getFilteredMenu({
        filters: {
          priceRange: {
            min: 400,
            max: 600,
          },
        },
      });

      expect(result.appliedFilters.priceRange?.min).toBe(400);
      expect(result.appliedFilters.priceRange?.max).toBe(600);
    });

    it("should handle search term filter", async () => {
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

      const result = await menuManager.getFilteredMenu({
        filters: {
          searchTerm: "Test",
          sortBy: "name",
          sortOrder: "asc",
        },
      });

      expect(result.appliedFilters.searchTerm).toBe("Test");
      expect(result.appliedFilters.sortBy).toBe("name");
      expect(result.appliedFilters.sortOrder).toBe("asc");
    });
  });

  describe("getFeaturedProducts", () => {
    it("should fetch featured products", async () => {
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

      const result = await menuManager.getFeaturedProducts();

      expect(result.products).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe("getFilteredMenu for specific category", () => {
    it("should fetch products for specific category", async () => {
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

      const result = await menuManager.getFilteredMenu({
        filters: {
          categoryId: "category-1",
        },
      });

      expect(result.appliedFilters.categoryId).toBe("category-1");
      expect(result.products).toBeDefined();
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

      const querySpy = jest.spyOn(mockClient, "query");
      await menuManager.preloadMenu();

      expect(querySpy).toHaveBeenCalledWith({
        query: GET_MENU_DATA,
        variables: {
          brandId: "brand-1",
          pointId: "point-1",
          orderType: "DELIVERY",
        },
        fetchPolicy: "cache-first",
      });
    });
  });

  describe("validateMenu", () => {
    it("should validate menu structure", async () => {
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

      const result = await menuManager.validateMenu();

      expect(result.isValid).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe("getMenuStatistics", () => {
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

      const result = await menuManager.getMenuStatistics();

      expect(result.stats?.totalCategories).toBe(2);
      expect(result.stats?.totalProducts).toBe(2);
      expect(result.stats?.activeProducts).toBe(2);
      expect(result.stats?.averageProductsPerCategory).toBeDefined();
      expect(result.error).toBeNull();
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

  describe("MenuManagerFactory", () => {
    it("should create instance with create method", () => {
      const { MenuManagerFactory } = require("../../src/managers/MenuManager");

      const manager = MenuManagerFactory.create({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      expect(manager).toBeInstanceOf(MenuManager);
    });

    it("should create instance with createWithClient method", () => {
      const { MenuManagerFactory } = require("../../src/managers/MenuManager");

      const manager = MenuManagerFactory.createWithClient(mockClient, {
        brandId: "brand-1",
        pointId: "point-1",
        orderType: "DELIVERY",
      });

      expect(manager).toBeInstanceOf(MenuManager);
    });
  });
});
