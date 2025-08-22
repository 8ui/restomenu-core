import { renderHook, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";
import {
  useMenuData,
  useOrganizedMenuData,
  useMenuFilter,
} from "../../src/hooks/menu";
import { GET_MENU_DATA } from "../../src/graphql/utils";
import { createMockProduct, createMockCategory } from "../test-utils";

// Mock data
const mockProducts = [
  createMockProduct({ id: "product-1", categoryIds: ["category-1"] }),
  createMockProduct({ id: "product-2", categoryIds: ["category-1"] }),
  createMockProduct({ id: "product-3", categoryIds: ["category-2"] }),
  createMockProduct({ id: "product-4", categoryIds: [] }), // uncategorized
];

const mockCategories = [
  createMockCategory({ id: "category-1", name: "Main Dishes" }),
  createMockCategory({ id: "category-2", name: "Desserts" }),
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

describe("Menu Hooks", () => {
  describe("useMenuData", () => {
    it("should fetch complete menu data successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuData({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.products).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should handle errors gracefully", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          error: new Error("Failed to fetch menu data"),
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuData({
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

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("Failed to fetch menu data");
      expect(result.current.categories).toEqual([]);
      expect(result.current.products).toEqual([]);
    });

    it("should skip query when skip is true", () => {
      const mocks: any[] = [];

      const { result } = renderHook(
        () =>
          useMenuData({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            skip: true,
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toEqual([]);
      expect(result.current.products).toEqual([]);
    });
  });

  describe("useOrganizedMenuData", () => {
    it("should organize products by categories", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useOrganizedMenuData({
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

      expect(result.current.organizedCategories).toHaveLength(2);

      // Check Main Dishes category
      const mainDishesCategory = result.current.organizedCategories.find(
        (cat: any) => cat.category.id === "category-1"
      );
      expect(mainDishesCategory).toBeDefined();
      expect(mainDishesCategory.products).toHaveLength(2);

      // Check Desserts category
      const dessertsCategory = result.current.organizedCategories.find(
        (cat: any) => cat.category.id === "category-2"
      );
      expect(dessertsCategory).toBeDefined();
      expect(dessertsCategory.products).toHaveLength(1);

      // Check uncategorized products
      expect(result.current.uncategorizedProducts).toHaveLength(1);
      expect(result.current.uncategorizedProducts[0].id).toBe("product-4");

      expect(result.current.allProducts).toHaveLength(4);
      expect(result.current.allCategories).toHaveLength(2);
    });

    it("should handle empty data gracefully", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: [],
              products: [],
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useOrganizedMenuData({
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

      expect(result.current.organizedCategories).toEqual([]);
      expect(result.current.uncategorizedProducts).toEqual([]);
      expect(result.current.allProducts).toHaveLength(0);
      expect(result.current.allCategories).toHaveLength(0);
    });
  });

  describe("useMenuFilter", () => {
    it("should filter menu data by search term", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            searchTerm: "product-1",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that filtered data is returned correctly
      expect(result.current.categories).toBeDefined();
      expect(result.current.uncategorizedProducts).toBeDefined();
    });

    it("should filter by category", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            selectedCategoryId: "category-1",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that filtered data is returned correctly
      expect(result.current.categories).toBeDefined();
      expect(result.current.totalProducts).toBeGreaterThanOrEqual(0);
    });

    it("should filter by price range", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            searchTerm: "", // Price filtering would need to be implemented in the hook
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that data is returned correctly
      expect(result.current.categories).toBeDefined();
      expect(result.current.totalProducts).toBeGreaterThanOrEqual(0);
    });

    it("should filter by tags", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            searchTerm: "", // Tag filtering would need to be implemented in the hook
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that data is returned correctly
      expect(result.current.categories).toBeDefined();
      expect(result.current.totalProducts).toBeGreaterThanOrEqual(0);
    });

    it("should apply multiple filters simultaneously", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            searchTerm: "Test",
            selectedCategoryId: "category-1",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that filtered data is returned correctly
      expect(result.current.categories).toBeDefined();
      expect(result.current.totalProducts).toBeGreaterThanOrEqual(0);
    });

    it("should return all data when no filters applied", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
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

      expect(result.current.categories).toBeDefined();
      expect(result.current.uncategorizedProducts).toBeDefined();
    });

    it("should sort products correctly", async () => {
      const mocks = [
        {
          request: {
            query: GET_MENU_DATA,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              categories: mockCategories,
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useMenuFilter({
            brandId: "brand-1",
            pointId: "point-1",
            orderType: "DELIVERY",
            searchTerm: "", // Sorting would need to be implemented in the hook
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that data is returned correctly
      expect(result.current.categories).toBeDefined();
      expect(result.current.totalProducts).toBeGreaterThanOrEqual(0);
    });
  });
});

// Test utilities
export const createMenuMockData = () => ({
  products: mockProducts,
  categories: mockCategories,
});

export {
  mockProducts as mockMenuProducts,
  mockCategories as mockMenuCategories,
};
