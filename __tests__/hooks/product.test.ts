import { renderHook, waitFor, act } from "@testing-library/react";
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
  useProductFormSubmit,
  useProductVariantWorkflow,
  useVariantPropertyManagement,
  useProductPricing,
  useProductCategories,
  useProductTagsWorkflow,
  useProductForm,
} from "../../src/hooks/product";
import {
  GET_PRODUCT_DETAIL,
  GET_PRODUCTS_DETAIL,
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_TAGS,
  GET_PRODUCT_VARIANT_PROPERTIES,
} from "../../src/graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
  CREATE_PRODUCT_VARIANT_PROPERTY,
  UPDATE_PRODUCT_VARIANT_PROPERTY,
  DELETE_PRODUCT_VARIANT_PROPERTY,
} from "../../src/graphql/mutations/product";
import { GET_BRAND_CATEGORIES } from "../../src/graphql/queries/category";

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
  priceSettings: {
    price: 500,
    priceOrderTypes: [
      {
        orderType: "PRE_ORDER",
        priceCommon: 500,
        priceCities: [],
        pricePoints: [],
      },
    ],
  },
  variants: [],
};

const mockProducts = {
  products: [mockProduct, { ...mockProduct, id: "2", name: "Test Product 2" }],
};

const mockCategories = {
  categories: [
    { id: "cat-1", name: "Category 1", isActive: true },
    { id: "cat-2", name: "Category 2", isActive: true },
  ],
};

const mockTags = {
  productTags: [
    { id: "tag-1", name: "Popular" },
    { id: "tag-2", name: "Spicy" },
  ],
};

const mockVariantProperties = {
  productVariantProperties: [
    {
      id: "prop-1",
      name: "Size",
      values: [
        { id: "val-1", name: "Small" },
        { id: "val-2", name: "Large" },
      ],
    },
    {
      id: "prop-2",
      name: "Color",
      values: [
        { id: "val-3", name: "Red" },
        { id: "val-4", name: "Blue" },
      ],
    },
  ],
};

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
          result: mockProducts,
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

      expect(result.current.data.products).toEqual(mockProducts.products);
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
          result: mockProducts,
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

      expect(result.current.data.products).toEqual(mockProducts.products);
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
          result: mockProducts,
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

      expect(result.current.data.products).toEqual(mockProducts.products);
    });
  });

  describe("useProductTags", () => {
    it("should fetch product tags successfully", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCT_TAGS,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockTags,
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

      expect(result.current.data.productTags).toEqual(mockTags.productTags);
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
            query: GET_BRAND_CATEGORIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockCategories,
        },
        {
          request: {
            query: GET_PRODUCT_TAGS,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockTags,
        },
        {
          request: {
            query: GET_PRODUCT_VARIANT_PROPERTIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockVariantProperties,
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
      expect(result.current.tags).toEqual(mockTags.productTags);
      expect(result.current.categories).toEqual(mockCategories.categories);
      expect(result.current.variantProperties).toEqual(
        mockVariantProperties.productVariantProperties
      );
      expect(typeof result.current.refetch).toBe("function");
    });
  });

  describe("useProductFormSubmit", () => {
    it("should submit product data successfully", async () => {
      const productInput = {
        brandId: "brand-1",
        name: "Test Product",
        slug: "test-product",
      };

      const mocks = [
        {
          request: {
            query: CREATE_PRODUCT,
            variables: {
              input: productInput,
            },
          },
          result: {
            data: {
              productCreate: {
                ...mockProduct,
                ...productInput,
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useProductFormSubmit(), {
        wrapper: createWrapper(mocks),
      });

      const submitResult = await result.current.submit(productInput);

      expect(submitResult).toEqual({
        ...mockProduct,
        ...productInput,
      });
    });
  });

  describe("useProductVariantWorkflow", () => {
    it("should generate variants from properties", async () => {
      const baseProduct = {
        ...mockProduct,
        name: "Test Product",
      };

      const mocks = [
        {
          request: {
            query: GET_PRODUCT_VARIANT_PROPERTIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockVariantProperties,
        },
      ];

      const { result } = renderHook(
        () =>
          useProductVariantWorkflow({
            brandId: "brand-1",
            baseProduct: baseProduct,
          }),
        {
          wrapper: createWrapper(mocks),
        }
      );

      // Wait for the hook to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const propertyIds = ["prop-1", "prop-2"];
      const variants = result.current.generateVariants(propertyIds);

      // Should generate 4 variants (2 sizes * 2 colors)
      expect(variants).toHaveLength(4);
      // Check that at least one variant has the expected name format
      const hasCorrectNameFormat = variants.some(
        (variant) => variant.name && variant.name.includes("Test Product -")
      );
      expect(hasCorrectNameFormat).toBe(true);
    });
  });

  describe("useVariantPropertyManagement", () => {
    it("should manage variant properties", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCT_VARIANT_PROPERTIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockVariantProperties,
        },
      ];

      const { result } = renderHook(
        () => useVariantPropertyManagement("brand-1"),
        {
          wrapper: createWrapper(mocks),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.properties).toEqual(
        mockVariantProperties.productVariantProperties
      );
      expect(typeof result.current.validatePropertyName).toBe("function");
    });
  });

  describe("useProductPricing", () => {
    it("should calculate effective price", () => {
      const { result } = renderHook(() => useProductPricing(), {
        wrapper: createWrapper([]),
      });

      const context = {
        basePrice: 500,
        orderType: "PRE_ORDER",
        priceSettings: {
          priceOrderTypes: [
            {
              orderType: "PRE_ORDER",
              priceCommon: 450,
              priceCities: [],
              pricePoints: [],
            },
          ],
        },
      };

      const effectivePrice = result.current.calculateEffectivePrice(context);
      expect(effectivePrice).toBe(450);
    });

    it("should validate pricing", () => {
      const { result } = renderHook(() => useProductPricing(), {
        wrapper: createWrapper([]),
      });

      const pricing = {
        price: -100, // Invalid negative price
        priceOrderTypes: [
          {
            orderType: "PRE_ORDER",
            priceCommon: 500,
            priceCities: [],
            pricePoints: [],
          },
        ],
      };

      const validation = result.current.validatePricing(pricing);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Базовая цена не может быть отрицательной"
      );
    });
  });

  describe("useProductCategories", () => {
    it("should manage category bindings", async () => {
      const mocks = [
        {
          request: {
            query: GET_BRAND_CATEGORIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockCategories,
        },
      ];

      const { result } = renderHook(() => useProductCategories("brand-1"), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const categoryIds = ["cat-1", "cat-2"];
      const bindings = result.current.bindCategories(categoryIds);

      expect(bindings).toHaveLength(2);
      expect(bindings[0]).toEqual({ categoryId: "cat-1", priority: 1 });
      expect(bindings[1]).toEqual({ categoryId: "cat-2", priority: 2 });
    });
  });

  describe("useProductTagsWorkflow", () => {
    it("should bind tags by name", async () => {
      const mocks = [
        {
          request: {
            query: GET_PRODUCT_TAGS,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockTags,
        },
      ];

      const { result } = renderHook(() => useProductTagsWorkflow("brand-1"), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const tagNames = ["Popular", "New"];
      const bindings = await result.current.bindTagsByName(tagNames);

      expect(bindings).toHaveLength(2);
      expect(bindings[0]).toEqual({ name: "Popular", priority: 1 });
      expect(bindings[1]).toEqual({ name: "New", priority: 2 });
    });
  });

  describe("useProductForm", () => {
    it("should combine all workflow hooks", async () => {
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
            query: GET_BRAND_CATEGORIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockCategories,
        },
        {
          request: {
            query: GET_PRODUCT_TAGS,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockTags,
        },
        {
          request: {
            query: GET_PRODUCT_VARIANT_PROPERTIES,
            variables: {
              brandId: "brand-1",
            },
          },
          result: mockVariantProperties,
        },
        {
          request: {
            query: CREATE_PRODUCT,
            variables: {
              input: {
                brandId: "brand-1",
                name: "Test Product",
              },
            },
          },
          result: {
            data: {
              productCreate: mockProduct,
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useProductForm({
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

      // Check that all data is loaded
      expect(result.current.product).toEqual(mockProduct);
      expect(result.current.categories).toEqual(mockCategories.categories);
      expect(result.current.tags).toEqual(mockTags.productTags);
      expect(result.current.variantProperties).toEqual(
        mockVariantProperties.productVariantProperties
      );

      // Check that all workflow functions are available
      expect(typeof result.current.submitProduct).toBe("function");
      expect(typeof result.current.validateProduct).toBe("function");
      expect(typeof result.current.getInitialValues).toBe("function");
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
