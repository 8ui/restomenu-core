import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
} from "@apollo/client";
import {
  ProductManager,
  ProductManagerFactory,
} from "../../src/managers/ProductManager";
import {
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_DETAIL,
} from "../../src/graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
} from "../../src/graphql/mutations/product";

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
const mockProduct = {
  id: "1",
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
};

const mockProducts = [
  mockProduct,
  { ...mockProduct, id: "2", name: "Test Product 2" },
];

describe("ProductManager", () => {
  let productManager: ProductManager;
  let mockClient: ApolloClient<any>;

  beforeEach(() => {
    mockClient = createMockClient();
    productManager = new ProductManager({
      client: mockClient,
      defaultBrandId: "brand-1",
      defaultPointId: "point-1",
      defaultOrderType: "DELIVERY",
    });
  });

  describe("getForMenu", () => {
    it("should fetch products for menu successfully", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await productManager.getForMenu();

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(2);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Network error");
      mockClient = createMockClient([{ error: mockError }]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await productManager.getForMenu();

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.loading).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it("should throw error when required parameters are missing", async () => {
      const productManagerWithoutDefaults = new ProductManager({
        client: mockClient,
      });

      const result = await productManagerWithoutDefaults.getForMenu();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain(
        "brandId, pointId, and orderType are required"
      );
    });

    it("should filter products by category when categoryId provided", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await productManager.getForMenu({
        categoryId: "category-1",
      });

      expect(result.products).toEqual(mockProducts);
    });
  });

  describe("getForAdmin", () => {
    it("should fetch products for admin interface", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.getForAdmin();

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it("should apply search filter", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.getForAdmin({
        filters: {
          searchTerm: "Test Product 2",
        },
      });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe("Test Product 2");
    });
  });

  describe("search", () => {
    it("should search products by name", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await productManager.search({
        searchTerm: "Test",
      });

      expect(result.products).toEqual(mockProducts);
      if ("searchTerm" in result) {
        expect(result.searchTerm).toBe("Test");
      }
    });

    it("should filter search results by search term", async () => {
      const mockResponse = {
        data: {
          products: mockProducts,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await productManager.search({
        searchTerm: "Product 2",
      });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe("Test Product 2");
    });
  });

  describe("create", () => {
    it("should create product successfully", async () => {
      const newProduct = {
        name: "New Product",
        brandId: "brand-1",
        description: "A new test product",
        priceSettings: {
          price: 1000,
          priceOrderTypes: [
            {
              orderType: "DELIVERY",
              priceCommon: 1000,
            },
          ],
        },
      };

      const mockResponse = {
        data: {
          productCreate: {
            ...mockProduct,
            ...newProduct,
            id: "3",
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.create(newProduct);

      expect(result.success).toBe(true);
      expect(result.product?.name).toBe(newProduct.name);
      expect(result.error).toBeNull();
    });

    it("should handle validation errors", async () => {
      const invalidProduct = {
        brandId: "brand-1",
        // Missing required name field
      };

      const result = await productManager.create(invalidProduct as any);

      expect(result.success).toBe(false);
      expect(result.product).toBeNull();
      expect(result.error?.message).toContain("Name and brandId are required");
    });

    it("should handle server errors", async () => {
      const newProduct = {
        name: "New Product",
        brandId: "brand-1",
        priceSettings: {
          price: 1000,
          priceOrderTypes: [
            {
              orderType: "DELIVERY",
              priceCommon: 1000,
            },
          ],
        },
      };

      const mockError = new Error("Server error");
      mockClient = createMockClient([{ error: mockError }]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.create(newProduct);

      expect(result.success).toBe(false);
      expect(result.product).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe("update", () => {
    it("should update product successfully", async () => {
      const updateData = {
        productId: "1",
        brandId: "brand-1",
        name: "Updated Product Name",
      };

      const mockResponse = {
        data: {
          productUpdate: {
            ...mockProduct,
            name: updateData.name,
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.update(updateData);

      expect(result.success).toBe(true);
      expect(result.product?.name).toBe(updateData.name);
    });
  });

  describe("delete", () => {
    it("should delete product successfully", async () => {
      const mockResponse = {
        data: {
          productDelete: true,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.delete("1");

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should handle errors when brandId is missing", async () => {
      const productManagerWithoutBrandId = new ProductManager({
        client: mockClient,
      });

      const result = await productManagerWithoutBrandId.delete("1");

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("brandId is required");
    });
  });

  describe("toggleActive", () => {
    it("should toggle product active status", async () => {
      // Mock getting current product by ID
      const getCurrentProductResponse = {
        data: {
          product: mockProduct,
        },
      };

      // Mock toggle response
      const toggleResponse = {
        data: {
          productUpdate: {
            ...mockProduct,
            isActive: false,
          },
        },
      };

      mockClient = createMockClient([
        getCurrentProductResponse,
        toggleResponse,
      ]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
        defaultPointId: "point-1",
        defaultOrderType: "DELIVERY",
      });

      const result = await productManager.toggleActive("1");

      expect(result.success).toBe(true);
      expect(result.product?.isActive).toBe(false);
    });
  });

  describe("getById", () => {
    it("should fetch product by ID", async () => {
      const mockResponse = {
        data: {
          product: mockProduct,
        },
      };

      mockClient = createMockClient([mockResponse]);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.getById("1");

      expect(result.product).toEqual(mockProduct);
      expect(result.error).toBeNull();
    });
  });

  describe("batchUpdate", () => {
    it("should perform batch updates", async () => {
      const updates = [
        {
          productId: "1",
          updates: { name: "Updated Product 1" },
        },
        {
          productId: "2",
          updates: { name: "Updated Product 2" },
        },
      ];

      const mockResponses = [
        {
          data: {
            productUpdate: {
              ...mockProduct,
              name: "Updated Product 1",
            },
          },
        },
        {
          data: {
            productUpdate: {
              ...mockProduct,
              id: "2",
              name: "Updated Product 2",
            },
          },
        },
      ];

      mockClient = createMockClient(mockResponses);
      productManager = new ProductManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await productManager.batchUpdate(updates);

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.results).toHaveLength(2);
    });
  });

  describe("static factory methods", () => {
    it("should create instance with create method", () => {
      const manager = ProductManagerFactory.create({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      expect(manager).toBeInstanceOf(ProductManager);
    });

    it("should create instance with createWithClient method", () => {
      const manager = ProductManagerFactory.createWithClient(mockClient, {
        brandId: "brand-1",
        pointId: "point-1",
        orderType: "DELIVERY",
      });

      expect(manager).toBeInstanceOf(ProductManager);
    });
  });
});
