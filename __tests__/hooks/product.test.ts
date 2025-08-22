import { renderHook, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";
import {
  useProduct,
  useProducts,
  useAvailableProducts,
  useCreateProduct,
  useMenuProducts,
  useProductsByCategory,
  useProductTags,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductActive,
  useProductFormData,
} from "../../src/hooks/product";
import {
  GET_PRODUCT_DETAIL,
  GET_PRODUCTS_DETAIL,
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_TAGS,
} from "../../src/graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
} from "../../src/graphql/mutations/product";

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

// Test wrapper component
const createWrapper = (mocks: any[]) => {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      MockedProvider,
      { mocks, addTypename: false },
      children
    );
};

describe("Product Hooks", () => {
  describe("useProduct", () => {
    it("should fetch product data successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCT_DETAIL,
            variables: {
              input: { brandId: "brand-1", id: "1" },
            },
          },
          result: {
            data: {
              product: mockProduct,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useProduct({
            input: { brandId: "brand-1", id: "1" },
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

      expect(result.current.data.product).toEqual(mockProduct);
      expect(result.current.error).toBeUndefined();
    });

    it("should handle errors gracefully", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCT_DETAIL,
            variables: {
              input: { brandId: "brand-1", id: "1" },
            },
          },
          error: new Error("Product not found"),
        },
      ];

      const { result } = renderHook(
        () =>
          useProduct({
            input: { brandId: "brand-1", id: "1" },
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
      expect(result.current.error?.message).toBe("Product not found");
    });

    it("should skip query when skip is true", () => {
      const mocks: any[] = [];

      const { result } = renderHook(
        () =>
          useProduct({ input: { id: "1", brandId: "brand-1" }, skip: true }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useProducts", () => {
    it("should fetch products list successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCTS_DETAIL,
            variables: {
              input: { brandId: "brand-1" },
            },
          },
          result: {
            data: {
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useProducts({ input: { brandId: "brand-1" }, level: "detail" }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.products).toEqual(mockProducts);
      expect(result.current.data.products).toHaveLength(2);
    });
  });

  describe("useAvailableProducts", () => {
    it("should fetch available products for point and order type", async () => {
      const mocks = [
        {
          request: {
            query: GET_AVAILABLE_PRODUCTS,
            variables: {
              brandId: "brand-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useAvailableProducts({
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

      expect(result.current.data.products).toEqual(mockProducts);
    });
  });

  describe("useCreateProduct", () => {
    it("should create product successfully", async () => {
      const newProduct = {
        name: "New Product",
        brandId: "brand-1",
        description: "A new test product",
      };

      const mocks = [
        {
          request: {
            query: CREATE_PRODUCT,
            variables: {
              input: newProduct,
            },
          },
          result: {
            data: {
              productCreate: {
                ...mockProduct,
                ...newProduct,
                id: "3",
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: createWrapper(mocks),
      });

      const [createProduct] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await createProduct({
          variables: { input: newProduct },
        });
      });

      expect(mutationResult.data.productCreate.name).toBe(newProduct.name);
      expect(mutationResult.data.productCreate.id).toBe("3");
    });

    it("should handle mutation errors", async () => {
      const newProduct = {
        name: "New Product",
        brandId: "brand-1",
      };

      const mocks = [
        {
          request: {
            query: CREATE_PRODUCT,
            variables: {
              input: newProduct,
            },
          },
          error: new Error("Validation failed"),
        },
      ];

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: createWrapper(mocks),
      });

      const [createProduct] = result.current;

      try {
        await createProduct({
          variables: { input: newProduct },
        });
      } catch (error: any) {
        expect(error.message).toBe("Validation failed");
      }
    });
  });

  describe("useProductsByCategory", () => {
    it("should fetch products by category successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCTS_BY_CATEGORY,
            variables: {
              brandId: "brand-1",
              categoryId: "category-1",
              pointId: "point-1",
              orderType: "DELIVERY",
            },
          },
          result: {
            data: {
              products: mockProducts,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useProductsByCategory({
            brandId: "brand-1",
            categoryId: "category-1",
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

      expect(result.current.data.products).toEqual(mockProducts);
    });
  });

  describe("useProductTags", () => {
    it("should fetch product tags successfully", async () => {
      const mockTags = [
        { id: "tag-1", name: "Popular" },
        { id: "tag-2", name: "Spicy" },
      ];

      const mocks = [
        {
          request: {
            query: GET_PRODUCT_TAGS,
            variables: {
              brandId: "brand-1",
            },
          },
          result: {
            data: {
              productTags: mockTags,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useProductTags({ brandId: "brand-1" }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.productTags).toEqual(mockTags);
    });
  });

  describe("useUpdateProduct", () => {
    it("should update product successfully", async () => {
      const updateData = {
        productId: "1",
        brandId: "brand-1",
        name: "Updated Product Name",
      };

      const mocks = [
        {
          request: {
            query: UPDATE_PRODUCT,
            variables: {
              input: updateData,
            },
          },
          result: {
            data: {
              productUpdate: {
                ...mockProduct,
                name: updateData.name,
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useUpdateProduct(), {
        wrapper: createWrapper(mocks),
      });

      const [updateProduct] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await updateProduct({
          variables: { input: updateData },
        });
      });

      expect(mutationResult.data.productUpdate.name).toBe(updateData.name);
    });
  });

  describe("useDeleteProduct", () => {
    it("should delete product successfully", async () => {
      const mocks = [
        {
          request: {
            query: DELETE_PRODUCT,
            variables: {
              input: {
                productId: "1",
                brandId: "brand-1",
              },
            },
          },
          result: {
            data: {
              productDelete: true,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDeleteProduct(), {
        wrapper: createWrapper(mocks),
      });

      const [deleteProduct] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await deleteProduct({
          variables: {
            input: {
              productId: "1",
              brandId: "brand-1",
            },
          },
        });
      });

      expect(mutationResult.data.productDelete).toBe(true);
    });
  });

  describe("useToggleProductActive", () => {
    it("should toggle product active status", async () => {
      const mocks = [
        {
          request: {
            query: TOGGLE_PRODUCT_ACTIVE,
            variables: {
              input: {
                productId: "1",
                brandId: "brand-1",
                isActive: false,
              },
            },
          },
          result: {
            data: {
              productUpdate: {
                ...mockProduct,
                isActive: false,
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useToggleProductActive(), {
        wrapper: createWrapper(mocks),
      });

      const [toggleActive] = result.current;

      let mutationResult: any;
      await waitFor(async () => {
        mutationResult = await toggleActive({
          variables: {
            input: {
              productId: "1",
              brandId: "brand-1",
              isActive: false,
            },
          },
        });
      });

      expect(mutationResult.data.productUpdate.isActive).toBe(false);
    });
  });

  describe("useProductFormData", () => {
    it("should return combined product and tags data", async () => {
      const mockTags = [
        { id: "tag-1", name: "Popular" },
        { id: "tag-2", name: "Spicy" },
      ];

      const mocks = [
        {
          request: {
            query: GET_PRODUCT_DETAIL,
            variables: {
              input: { id: "1", brandId: "brand-1" },
            },
          },
          result: {
            data: {
              product: mockProduct,
            },
          },
        },
        {
          request: {
            query: GET_PRODUCT_TAGS,
            variables: {
              brandId: "brand-1",
            },
          },
          result: {
            data: {
              productTags: mockTags,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useProductFormData({
            brandId: "brand-1",
            productId: "1",
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.product).toEqual(mockProduct);
      expect(result.current.tags).toEqual(mockTags);
      expect(typeof result.current.refetch).toBe("function");
    });
  });
});

// Test utilities
export const createMockProduct = (
  overrides: Partial<typeof mockProduct> = {}
) => ({
  ...mockProduct,
  ...overrides,
});

export const createMockProducts = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockProduct({ id: `${i + 1}`, name: `Product ${i + 1}` })
  );

export { mockProduct, mockProducts };
