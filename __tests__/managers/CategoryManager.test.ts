import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
} from "@apollo/client";
import {
  CategoryManager,
  CategoryManagerFactory,
} from "../../src/managers/CategoryManager";
import {
  GET_CATEGORIES_DETAIL,
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_BRAND_CATEGORIES,
  GET_PARENT_CATEGORIES,
  GET_SUBCATEGORIES,
} from "../../src/graphql/queries/category";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_CATEGORY_ACTIVE,
  UPDATE_CATEGORY_PRIORITY,
} from "../../src/graphql/mutations/category";

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
  pointBinds: [
    {
      pointId: "point-1",
      orderType: "DELIVERY",
    },
  ],
  productsCount: 5,
};

const mockCategories = [
  mockCategory,
  {
    ...mockCategory,
    id: "category-2",
    name: "Test Category 2",
    parentId: "category-1",
  },
];

describe("CategoryManager", () => {
  let categoryManager: CategoryManager;
  let mockClient: ApolloClient<any>;

  beforeEach(() => {
    mockClient = createMockClient();
    categoryManager = new CategoryManager({
      client: mockClient,
      defaultBrandId: "brand-1",
    });
  });

  describe("getForAdmin", () => {
    it("should fetch categories for brand successfully", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getForAdmin();

      expect(result.categories).toEqual(mockCategories);
      expect(result.total).toBe(2);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Network error");
      mockClient = createMockClient([{ error: mockError }]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getForAdmin();

      expect(result.categories).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.loading).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it("should throw error when brandId is missing", async () => {
      const categoryManagerWithoutBrandId = new CategoryManager({
        client: mockClient,
      });

      const result = await categoryManagerWithoutBrandId.getForAdmin();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("brandId is required");
    });
  });

  describe("getForMenu", () => {
    it("should fetch categories with products count", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getForMenu({
        pointId: "point-1",
        orderType: "DELIVERY",
      });

      expect(result.categories).toEqual(mockCategories);
      expect(result.total).toBe(2);
    });

    it("should filter empty categories when includeEmpty is false", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getForMenu({
        pointId: "point-1",
        orderType: "DELIVERY",
        includeEmpty: false,
      });

      expect(result.categories).toHaveLength(2);
      expect(result.categories.every((cat: any) => cat.productsCount > 0)).toBe(
        true
      );
    });
  });

  describe("getHierarchy", () => {
    it("should build category hierarchy correctly", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getHierarchy();

      expect(result.hierarchy).toHaveLength(1); // Only root categories
      expect(result.hierarchy[0].children).toHaveLength(1); // One child category
      expect(result.hierarchy[0].children[0].id).toBe("category-2");
    });
  });

  describe("getParentCategories", () => {
    it("should fetch parent categories only", async () => {
      const parentCategories = [mockCategories[0]]; // Only categories without parentId

      const mockResponse = {
        data: {
          categories: parentCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getParentCategories();

      expect(result.categories).toEqual(parentCategories);
      expect(result.categories.every((cat) => cat.parentId === null)).toBe(
        true
      );
    });
  });

  describe("getSubcategories", () => {
    it("should fetch subcategories for a parent", async () => {
      const subcategories = [mockCategories[1]]; // Categories with parentId

      const mockResponse = {
        data: {
          categories: subcategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getSubcategories("category-1");

      expect(result.categories).toEqual(subcategories);
      expect(
        result.categories.every((cat) => cat.parentId === "category-1")
      ).toBe(true);
    });
  });

  describe("create", () => {
    it("should create category successfully", async () => {
      const newCategory = {
        name: "New Category",
        brandId: "brand-1",
        priority: 1,
      };

      const mockResponse = {
        data: {
          categoryCreate: {
            ...mockCategory,
            ...newCategory,
            id: "category-3",
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.create(newCategory);

      expect(result.success).toBe(true);
      expect(result.category?.name).toBe(newCategory.name);
      expect(result.error).toBeNull();
    });

    it("should handle validation errors", async () => {
      const invalidCategory = {
        brandId: "brand-1",
        // Missing required name field
      };

      const result = await categoryManager.create(invalidCategory as any);

      expect(result.success).toBe(false);
      expect(result.category).toBeNull();
      expect(result.error?.message).toContain("Name and brandId are required");
    });

    it("should auto-generate slug if not provided", async () => {
      const newCategory = {
        name: "Test Category With Spaces",
        brandId: "brand-1",
        priority: 1,
      };

      const mockResponse = {
        data: {
          categoryCreate: {
            ...mockCategory,
            ...newCategory,
            id: "category-3",
            slug: "test-category-with-spaces",
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.create(newCategory);

      expect(result.success).toBe(true);
      expect(result.category?.slug).toBe("test-category-with-spaces");
    });
  });

  describe("update", () => {
    it("should update category successfully", async () => {
      const updateData = {
        categoryId: "category-1",
        brandId: "brand-1",
        name: "Updated Category Name",
      };

      const mockResponse = {
        data: {
          categoryUpdate: {
            ...mockCategory,
            name: updateData.name,
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.update(updateData);

      expect(result.success).toBe(true);
      expect(result.category?.name).toBe(updateData.name);
    });
  });

  describe("delete", () => {
    it("should delete category successfully", async () => {
      const mockResponse = {
        data: {
          categoryDelete: true,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.delete("category-1");

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should handle errors when brandId is missing", async () => {
      const categoryManagerWithoutBrandId = new CategoryManager({
        client: mockClient,
      });

      const result = await categoryManagerWithoutBrandId.delete("category-1");

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("brandId is required");
    });
  });

  describe("toggleActive", () => {
    it("should toggle category active status", async () => {
      // Mock getting current category
      const getCurrentCategoryResponse = {
        data: {
          categories: [mockCategory],
        },
      };

      // Mock toggle response
      const toggleResponse = {
        data: {
          categoryUpdate: {
            ...mockCategory,
            isActive: false,
          },
        },
      };

      mockClient = createMockClient([
        getCurrentCategoryResponse,
        toggleResponse,
      ]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.toggleActive("category-1");

      expect(result.success).toBe(true);
      expect(result.category?.isActive).toBe(false);
    });
  });

  describe("reorderCategories", () => {
    it("should reorder categories by updating priorities", async () => {
      const mockResponse = {
        data: {
          categoryUpdate: {
            ...mockCategory,
            priority: 5,
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.reorderCategories([
        { categoryId: "category-1", newPriority: 5 },
      ]);

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(1);
    });
  });

  describe("search", () => {
    it("should search categories by name", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.search("Test");

      expect(result.categories).toEqual(mockCategories);
      expect("searchTerm" in result && result.searchTerm).toBe("Test");
    });

    it("should filter search results by search term", async () => {
      const mockResponse = {
        data: {
          categories: mockCategories,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.search("Category 2");

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe("Test Category 2");
    });
  });

  describe("moveCategory", () => {
    it("should move category to different parent", async () => {
      const mockResponse = {
        data: {
          categoryUpdate: {
            ...mockCategory,
            parentId: "new-parent-id",
          },
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.moveCategory(
        "category-1",
        "new-parent-id"
      );

      expect(result.success).toBe(true);
      expect(result.category?.parentId).toBe("new-parent-id");
    });
  });

  describe("getById", () => {
    it("should fetch category by ID", async () => {
      const mockResponse = {
        data: {
          category: mockCategory,
        },
      };

      mockClient = createMockClient([mockResponse]);
      categoryManager = new CategoryManager({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      const result = await categoryManager.getById("category-1");

      expect(result.category).toEqual(mockCategory);
      expect(result.error).toBeNull();
    });
  });

  describe("static factory methods", () => {
    it("should create instance with factory create method", () => {
      const manager = CategoryManagerFactory.create({
        client: mockClient,
        defaultBrandId: "brand-1",
      });

      expect(manager).toBeInstanceOf(CategoryManager);
    });

    it("should create instance with factory createWithClient method", () => {
      const manager = CategoryManagerFactory.createWithClient(
        mockClient,
        "brand-1"
      );

      expect(manager).toBeInstanceOf(CategoryManager);
    });
  });
});
