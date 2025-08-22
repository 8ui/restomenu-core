import { renderHook, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";
import {
  useCategory,
  useCategories,
  useCategoriesWithProductsCount,
  useBrandCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryActive,
  useMenuCategories,
} from "../../src/hooks/category";
import {
  GET_CATEGORY_DETAIL,
  GET_CATEGORIES_DETAIL,
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_BRAND_CATEGORIES,
} from "../../src/graphql/queries/category";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_CATEGORY_ACTIVE,
} from "../../src/graphql/mutations/category";

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
  { ...mockCategory, id: "category-2", name: "Test Category 2" },
];

// Test wrapper component
const createWrapper = (mocks: any[]) => {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      MockedProvider,
      { mocks, addTypename: false },
      children
    );
};

describe("Category Hooks", () => {
  describe("useCategory", () => {
    it("should fetch category data successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_CATEGORY_DETAIL,
            variables: {
              input: { brandId: "brand-1", id: "category-1" },
            },
          },
          result: {
            data: {
              category: mockCategory,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useCategory({
            input: { brandId: "brand-1", id: "category-1" },
            level: "detail",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.category).toEqual(mockCategory);
      expect(result.current.error).toBeUndefined();
    });

    it("should handle errors gracefully", async () => {
      const mocks = [
        {
          request: {
            query: GET_CATEGORY_DETAIL,
            variables: {
              input: { brandId: "brand-1", id: "category-1" },
            },
          },
          error: new Error("Category not found"),
        },
      ];

      const { result } = renderHook(
        () =>
          useCategory({
            input: { brandId: "brand-1", id: "category-1" },
            level: "detail",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("Category not found");
    });

    it("should skip query when skip is true", () => {
      const mocks: any[] = [];

      const { result } = renderHook(
        () =>
          useCategory({
            input: { brandId: "brand-1", id: "category-1" },
            skip: true,
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useCategories", () => {
    it("should fetch categories list successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_CATEGORIES_DETAIL,
            variables: {
              input: { brandId: "brand-1" },
            },
          },
          result: {
            data: {
              categories: mockCategories,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useCategories({ input: { brandId: "brand-1" }, level: "detail" }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.categories).toEqual(mockCategories);
      expect(result.current.data.categories).toHaveLength(2);
    });
  });

  describe("useCategoriesWithProductsCount", () => {
    it("should fetch categories with products count", async () => {
      const mocks = [
        {
          request: {
            query: GET_CATEGORIES_WITH_PRODUCTS_COUNT,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useCategoriesWithProductsCount({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.categories).toEqual(mockCategories);
    });
  });

  describe("useBrandCategories", () => {
    it("should fetch all categories for a brand", async () => {
      const mocks = [
        {
          request: {
            query: GET_BRAND_CATEGORIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: {
            data: {
              categories: mockCategories,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useBrandCategories({ brandId: "brand-1" }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.categories).toEqual(mockCategories);
    });
  });

  describe("useCreateCategory", () => {
    it("should create category successfully", async () => {
      const newCategory = {
        name: "New Category",
        brandId: "brand-1",
        priority: 1,
      };

      const mocks = [
        {
          request: {
            query: CREATE_CATEGORY,
            variables: {
              input: newCategory,
            },
          },
          result: {
            data: {
              categoryCreate: {
                ...mockCategory,
                ...newCategory,
                id: "category-3",
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useCreateCategory(), {
        wrapper: createWrapper(mocks),
      });

      const [createCategory] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await createCategory({
          variables: { input: newCategory },
        });
      });

      expect(mutationResult.data.categoryCreate.name).toBe(newCategory.name);
      expect(mutationResult.data.categoryCreate.id).toBe("category-3");
    });
  });

  describe("useUpdateCategory", () => {
    it("should update category successfully", async () => {
      const updateData = {
        categoryId: "category-1",
        brandId: "brand-1",
        name: "Updated Category Name",
      };

      const mocks = [
        {
          request: {
            query: UPDATE_CATEGORY,
            variables: {
              input: updateData,
            },
          },
          result: {
            data: {
              categoryUpdate: {
                ...mockCategory,
                name: updateData.name,
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useUpdateCategory(), {
        wrapper: createWrapper(mocks),
      });

      const [updateCategory] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await updateCategory({
          variables: { input: updateData },
        });
      });

      expect(mutationResult.data.categoryUpdate.name).toBe(updateData.name);
    });
  });

  describe("useDeleteCategory", () => {
    it("should delete category successfully", async () => {
      const mocks = [
        {
          request: {
            query: DELETE_CATEGORY,
            variables: {
              input: {
                categoryId: "category-1",
                brandId: "brand-1",
              },
            },
          },
          result: {
            data: {
              categoryDelete: true,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDeleteCategory(), {
        wrapper: createWrapper(mocks),
      });

      const [deleteCategory] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await deleteCategory({
          variables: {
            input: {
              categoryId: "category-1",
              brandId: "brand-1",
            },
          },
        });
      });

      expect(mutationResult.data.categoryDelete).toBe(true);
    });
  });

  describe("useToggleCategoryActive", () => {
    it("should toggle category active status", async () => {
      const mocks = [
        {
          request: {
            query: TOGGLE_CATEGORY_ACTIVE,
            variables: {
              categoryId: "category-1",
              isActive: false,
            },
          },
          result: {
            data: {
              categoryUpdate: {
                ...mockCategory,
                isActive: false,
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useToggleCategoryActive(), {
        wrapper: createWrapper(mocks),
      });

      const [toggleActive] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await toggleActive({
          variables: {
            categoryId: "category-1",
            isActive: false,
          },
        });
      });

      expect(mutationResult.data.categoryUpdate.isActive).toBe(false);
    });
  });

  describe("useMenuCategories", () => {
    it("should return formatted menu categories data", async () => {
      const mocks = [
        {
          request: {
            query: GET_CATEGORIES_WITH_PRODUCTS_COUNT,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuCategories({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe("function");
    });
  });
});

// Test utilities
export const createMockCategory = (
  overrides: Partial<typeof mockCategory> = {}
) => ({
  ...mockCategory,
  ...overrides,
});

export const createMockCategories = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockCategory({ id: `category-${i + 1}`, name: `Category ${i + 1}` })
  );

export { mockCategory, mockCategories };
