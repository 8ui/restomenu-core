import { ApolloClient } from "@apollo/client";
import {
  GET_PRODUCTS_FOR_MENU,
  GET_PRODUCTS_DETAIL,
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_TAGS,
} from "../graphql/queries/product";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_ACTIVE,
  PRODUCT_MUTATIONS,
} from "../graphql/mutations/product";
import { QUERY_UTILS } from "../graphql/utils";

// ====================================================================
// PRODUCT MANAGER - High-level business logic for product operations
// ====================================================================

export interface ProductManagerConfig {
  client: ApolloClient<any>;
  defaultBrandId?: string;
  defaultPointId?: string;
  defaultOrderType?: "DELIVERY" | "PICKUP";
}

export interface ProductFilter {
  categoryId?: string;
  tagIds?: string[];
  isActive?: boolean;
  searchTerm?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface CreateProductInput {
  name: string;
  description?: string;
  brandId: string;
  unit?: string;
  unitValue?: number;
  calories?: number;
  carbohydrates?: number;
  fats?: number;
  protein?: number;
  categoryIds?: string[];
  tagIds?: string[];
  images?: Array<{
    fileId: string;
    priority: number;
  }>;
  priceSettings?: any;
  pointBinds?: Array<{
    pointId: string;
    orderType: string;
  }>;
}

export class ProductManager {
  private client: ApolloClient<any>;
  private config: ProductManagerConfig;

  constructor(config: ProductManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get products optimized for menu display
   */
  async getForMenu(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      categoryId?: string;
      filters?: ProductFilter;
    } = {}
  ) {
    const brandId = options.brandId || this.config.defaultBrandId;
    const pointId = options.pointId || this.config.defaultPointId;
    const orderType = options.orderType || this.config.defaultOrderType;

    if (!brandId || !pointId || !orderType) {
      throw new Error("brandId, pointId, and orderType are required");
    }

    try {
      const variables = options.categoryId
        ? { brandId, categoryId: options.categoryId, pointId, orderType }
        : { brandId, pointId, orderType };

      const query = options.categoryId
        ? GET_PRODUCTS_BY_CATEGORY
        : GET_AVAILABLE_PRODUCTS;

      const result = await this.client.query({
        query,
        variables,
        fetchPolicy: "cache-first",
      });

      let products = result.data.products || [];

      // Apply additional filters if provided
      if (options.filters) {
        products = this.applyClientSideFilters(products, options.filters);
      }

      return {
        products,
        total: products.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        products: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get products for admin interface with full details
   */
  async getForAdmin(
    options: {
      brandId?: string;
      filters?: ProductFilter;
      pagination?: {
        limit?: number;
        offset?: number;
      };
    } = {}
  ) {
    const brandId = options.brandId || this.config.defaultBrandId;

    if (!brandId) {
      throw new Error("brandId is required");
    }

    try {
      const filterInput = QUERY_UTILS.buildProductFilters({
        brandId,
        pointId: "", // Not needed for admin view
        orderType: "DELIVERY", // Default for filtering
        ...(options.filters?.categoryId && {
          categoryId: options.filters.categoryId,
        }),
        ...(options.filters?.tagIds && { tagIds: options.filters.tagIds }),
        ...(options.filters?.isActive !== undefined && {
          isActive: options.filters.isActive,
        }),
      });

      const result = await this.client.query({
        query: GET_PRODUCTS_DETAIL,
        variables: {
          input: {
            ...filterInput.input,
            limit: options.pagination?.limit || 50,
            offset: options.pagination?.offset || 0,
          },
        },
        fetchPolicy: "cache-first",
      });

      let products = result.data.products || [];

      // Apply search filter if provided
      if (options.filters?.searchTerm) {
        const searchTerm = options.filters.searchTerm.toLowerCase();
        products = products.filter(
          (product: any) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );
      }

      return {
        products,
        total: products.length,
        hasMore: products.length === (options.pagination?.limit || 50),
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        products: [],
        total: 0,
        hasMore: false,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Search products with advanced filtering
   */
  async search(options: {
    searchTerm: string;
    brandId?: string;
    pointId?: string;
    orderType?: string;
    filters?: ProductFilter;
  }) {
    // Only pass defined values
    const menuOptions: any = {};
    if (options.brandId !== undefined) menuOptions.brandId = options.brandId;
    if (options.pointId !== undefined) menuOptions.pointId = options.pointId;
    if (options.orderType !== undefined)
      menuOptions.orderType = options.orderType;

    const menuProducts = await this.getForMenu(menuOptions);

    if (menuProducts.error) {
      return menuProducts;
    }

    const searchTerm = options.searchTerm.toLowerCase();
    const filteredProducts = menuProducts.products.filter(
      (product: any) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.tags?.some((tag: any) =>
          tag.name.toLowerCase().includes(searchTerm)
        )
    );

    // Apply additional filters
    const finalProducts = options.filters
      ? this.applyClientSideFilters(filteredProducts, options.filters)
      : filteredProducts;

    return {
      products: finalProducts,
      total: finalProducts.length,
      searchTerm: options.searchTerm,
      loading: false,
      error: null,
    };
  }

  // ================== MUTATION METHODS ==================

  /**
   * Create a new product with validation and optimization
   */
  async create(input: CreateProductInput) {
    try {
      // Validate required fields
      if (!input.name || !input.brandId) {
        throw new Error("Name and brandId are required");
      }

      const result = await this.client.mutate({
        mutation: CREATE_PRODUCT,
        variables: { input },
        refetchQueries: ["GetProductsForMenu", "GetAvailableProducts"],
        awaitRefetchQueries: true,
      });

      return {
        product: result.data?.productCreate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        product: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Update an existing product
   */
  async update(input: any) {
    try {
      const result = await this.client.mutate({
        mutation: UPDATE_PRODUCT,
        variables: { input },
        refetchQueries: ["GetProductsForMenu", "GetAvailableProducts"],
      });

      return {
        product: result.data?.productUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        product: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Delete a product with confirmation
   */
  async delete(productId: string, brandId?: string) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      const result = await this.client.mutate({
        mutation: DELETE_PRODUCT,
        variables: {
          input: { productId, brandId: finalBrandId },
        },
        refetchQueries: ["GetProductsForMenu", "GetAvailableProducts"],
      });

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Toggle product active status with optimistic update
   */
  async toggleActive(productId: string, brandId?: string) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      // Get current product to determine new state
      const currentProduct = await this.getById(productId, finalBrandId);
      if (currentProduct.error) {
        throw currentProduct.error;
      }

      const newActiveState = !currentProduct.product?.isActive;

      const result = await this.client.mutate({
        mutation: TOGGLE_PRODUCT_ACTIVE,
        variables: {
          productId,
          brandId: finalBrandId,
          isActive: newActiveState,
        },
        optimisticResponse: {
          productUpdate: {
            id: productId,
            isActive: newActiveState,
            __typename: "Product",
          },
        },
      });

      return {
        product: result.data?.productUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        product: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Get product by ID
   */
  async getById(productId: string, brandId?: string) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      const result = await this.client.query({
        query: GET_PRODUCTS_DETAIL,
        variables: {
          input: { productId, brandId: finalBrandId },
        },
        fetchPolicy: "cache-first",
      });

      return {
        product: result.data?.product,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        product: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get product tags for a brand
   */
  async getTags(brandId?: string) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      const result = await this.client.query({
        query: GET_PRODUCT_TAGS,
        variables: { brandId: finalBrandId },
        fetchPolicy: "cache-first",
      });

      return {
        tags: result.data?.productTags || [],
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        tags: [],
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Apply client-side filters to products
   */
  private applyClientSideFilters(
    products: any[],
    filters: ProductFilter
  ): any[] {
    let filtered = [...products];

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter((product: any) => {
        const price = product.pricePoint;
        if (typeof price !== "number") return true;

        const { min, max } = filters.priceRange!;
        if (min !== undefined && price < min) return false;
        if (max !== undefined && price > max) return false;
        return true;
      });
    }

    return filtered;
  }

  /**
   * Batch operations for multiple products
   */
  async batchUpdate(updates: Array<{ productId: string; updates: any }>) {
    const results = [];

    for (const update of updates) {
      const result = await this.update({
        productId: update.productId,
        ...update.updates,
      });
      results.push(result);
    }

    return {
      results,
      successCount: results.filter((r) => r.success).length,
      errorCount: results.filter((r) => !r.success).length,
    };
  }

  // ================== CACHE MANAGEMENT ==================

  /**
   * Invalidate all product-related cache
   */
  invalidateCache() {
    this.client.refetchQueries({
      include: [
        "GetProductsForMenu",
        "GetAvailableProducts",
        "GetProductsDetail",
      ],
    });
  }

  /**
   * Preload products for better performance
   */
  async preloadForMenu(options: {
    brandId?: string;
    pointId?: string;
    orderType?: string;
  }) {
    const brandId = options.brandId || this.config.defaultBrandId;
    const pointId = options.pointId || this.config.defaultPointId;
    const orderType = options.orderType || this.config.defaultOrderType;

    if (!brandId || !pointId || !orderType) {
      return;
    }

    // Preload in background
    this.client.query({
      query: GET_AVAILABLE_PRODUCTS,
      variables: { brandId, pointId, orderType },
      fetchPolicy: "cache-first",
    });
  }
}

// ================== STATIC FACTORY METHODS ==================

export const ProductManagerFactory = {
  /**
   * Create a new ProductManager instance
   */
  create: (config: ProductManagerConfig): ProductManager =>
    new ProductManager(config),

  /**
   * Create with default Apollo client
   */
  createWithClient: (
    client: ApolloClient<any>,
    defaults?: {
      brandId?: string;
      pointId?: string;
      orderType?: "DELIVERY" | "PICKUP";
    }
  ): ProductManager => {
    const config: ProductManagerConfig = { client };
    if (defaults?.brandId) config.defaultBrandId = defaults.brandId;
    if (defaults?.pointId) config.defaultPointId = defaults.pointId;
    if (defaults?.orderType) config.defaultOrderType = defaults.orderType;
    return new ProductManager(config);
  },
};

export default ProductManager;
