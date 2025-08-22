import { ApolloClient } from "@apollo/client";
import { GET_MENU_DATA } from "../graphql/utils";
import {
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_AVAILABLE_CATEGORIES,
} from "../graphql/queries/category";
import {
  GET_AVAILABLE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
} from "../graphql/queries/product";

// ====================================================================
// MENU MANAGER - High-level business logic for menu operations
// ====================================================================

export interface MenuManagerConfig {
  client: ApolloClient<any>;
  defaultBrandId?: string;
  defaultPointId?: string;
  defaultOrderType?: "DELIVERY" | "PICKUP";
}

export interface MenuFilter {
  searchTerm?: string;
  categoryId?: string;
  categoriesId?: string[];
  tagIds?: string[];
  tagsIdAll?: string[]; // Contains all tags
  tagsIdNotAll?: string[]; // Does not contain all tags
  tagsIdAny?: string[]; // Contains at least one tag
  tagsIdNotAny?: string[]; // Does not contain at least one tag
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: "name" | "price" | "popularity" | "category" | "categoryPriority";
  sortOrder?: "asc" | "desc";
  sortByCategoryId?: string;
  variantsGroupStrategy?: "MAIN" | "PRIORITY_MIN" | "PRIORITY_MAX";
  variantsGroupByPrice?: {
    type: "MIN" | "MAX";
    pointId: string;
    orderType: string;
  };
  isVariantsGroup?: boolean;
}

export interface MenuData {
  categories: any[];
  products: any[];
  organizedCategories: Array<{
    category: any;
    products: any[];
  }>;
  uncategorizedProducts: any[];
  totalProducts: number;
  totalCategories: number;
}

export class MenuManager {
  private client: ApolloClient<any>;
  private config: MenuManagerConfig;

  constructor(config: MenuManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== MAIN MENU OPERATIONS ==================

  /**
   * Get complete menu data with categories and products using GraphQL schema capabilities
   */
  async getFullMenuData(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      filters?: MenuFilter;
    } = {}
  ): Promise<{
    data: MenuData | null;
    loading: boolean;
    error: Error | null;
  }> {
    const brandId = options.brandId || this.config.defaultBrandId;
    const pointId = options.pointId || this.config.defaultPointId;
    const orderType = options.orderType || this.config.defaultOrderType;

    if (!brandId || !pointId || !orderType) {
      return {
        data: null,
        loading: false,
        error: new Error("brandId, pointId, and orderType are required"),
      };
    }

    try {
      // Build enhanced query variables with filters - only call if filters exist
      let categoryVariables = null;
      let productVariables = null;

      if (options.filters) {
        categoryVariables = this.buildCategoryQueryVariables({
          brandId,
          pointId,
          orderType,
          filters: options.filters,
        });

        productVariables = this.buildProductQueryVariables({
          brandId,
          pointId,
          orderType,
          filters: options.filters,
        });
      }

      const result = await this.client.query({
        query: GET_MENU_DATA,
        variables: { brandId, pointId, orderType },
        fetchPolicy: "cache-first",
      });

      const categories = result.data?.categories || [];
      const products = result.data?.products || [];

      // Organize products by categories
      const organizedCategories = categories.map((category: any) => ({
        category,
        products: products.filter((product: any) =>
          product.categoryBinds?.some(
            (bind: any) => bind.categoryId === category.id
          )
        ),
      }));

      // Find uncategorized products
      const uncategorizedProducts = products.filter(
        (product: any) =>
          !product.categoryBinds || product.categoryBinds.length === 0
      );

      let menuData: MenuData = {
        categories,
        products,
        organizedCategories,
        uncategorizedProducts,
        totalProducts: products.length,
        totalCategories: categories.length,
      };

      // Apply client-side filters if needed
      if (options.filters) {
        menuData = this.applyMenuFilters(menuData, options.filters);
      }

      return {
        data: menuData,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get menu with advanced filtering and search
   */
  async getFilteredMenu(options: {
    brandId?: string;
    pointId?: string;
    orderType?: string;
    filters: MenuFilter;
  }): Promise<{
    categories: any[];
    products: any[];
    totalResults: number;
    appliedFilters: MenuFilter;
    loading: boolean;
    error: Error | null;
  }> {
    // Ensure we have valid values before passing to getFullMenuData
    const validatedOptions = {
      brandId: options.brandId,
      pointId: options.pointId,
      orderType: options.orderType,
      filters: options.filters,
    };

    // Only pass defined values
    const menuDataOptions: any = { filters: options.filters };
    if (options.brandId !== undefined)
      menuDataOptions.brandId = options.brandId;
    if (options.pointId !== undefined)
      menuDataOptions.pointId = options.pointId;
    if (options.orderType !== undefined)
      menuDataOptions.orderType = options.orderType;

    const menuResult = await this.getFullMenuData(menuDataOptions);

    if (menuResult.error || !menuResult.data) {
      return {
        categories: [],
        products: [],
        totalResults: 0,
        appliedFilters: options.filters,
        loading: false,
        error: menuResult.error,
      };
    }

    const { organizedCategories, uncategorizedProducts } = menuResult.data;

    // Flatten products from organized categories
    const allFilteredProducts = [
      ...organizedCategories.flatMap((cat) => cat.products),
      ...uncategorizedProducts,
    ];

    return {
      categories: organizedCategories.map((cat) => cat.category),
      products: allFilteredProducts,
      totalResults: allFilteredProducts.length,
      appliedFilters: options.filters,
      loading: false,
      error: null,
    };
  }

  /**
   * Search menu items with intelligent ranking and tag-based filtering
   */
  async searchMenu(options: {
    searchTerm: string;
    brandId?: string;
    pointId?: string;
    orderType?: string;
    limit?: number;
    includeInactive?: boolean;
    categoryFilter?: string;
    tagFilters?: {
      tagsIdAll?: string[];
      tagsIdAny?: string[];
      tagsIdNotAll?: string[];
      tagsIdNotAny?: string[];
    };
    sortBy?: "relevance" | "name" | "price" | "category";
  }) {
    // Build search filters
    const filters: MenuFilter = {
      searchTerm: options.searchTerm,
      ...options.tagFilters,
    };

    if (options.categoryFilter) {
      filters.categoryId = options.categoryFilter;
    }

    // Only pass defined values to avoid exactOptionalPropertyTypes issues
    const menuDataOptions: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      filters: MenuFilter;
    } = { filters };

    if (options.brandId) menuDataOptions.brandId = options.brandId;
    if (options.pointId) menuDataOptions.pointId = options.pointId;
    if (options.orderType) menuDataOptions.orderType = options.orderType;

    const menuResult = await this.getFullMenuData(menuDataOptions);

    if (menuResult.error || !menuResult.data) {
      return {
        results: [],
        totalResults: 0,
        searchTerm: options.searchTerm,
        error: menuResult.error,
      };
    }

    const searchTerm = options.searchTerm.toLowerCase();
    const { products, categories } = menuResult.data;

    // Search in products with enhanced ranking
    const productResults = products
      .map((product: any) => ({
        ...product,
        type: "product",
        relevanceScore: this.calculateAdvancedRelevanceScore(
          product,
          searchTerm
        ),
      }))
      .filter((item: any) => item.relevanceScore > 0);

    // Search in categories
    const categoryResults = categories
      .map((category: any) => ({
        ...category,
        type: "category",
        relevanceScore: this.calculateCategoryRelevanceScore(
          category,
          searchTerm
        ),
      }))
      .filter((item: any) => item.relevanceScore > 0);

    // Combine and sort by relevance or specified criteria
    let allResults = [...productResults, ...categoryResults];

    if (options.sortBy === "relevance" || !options.sortBy) {
      allResults = allResults.sort(
        (a, b) => b.relevanceScore - a.relevanceScore
      );
    } else if (options.sortBy === "name") {
      allResults = allResults.sort((a, b) => a.name.localeCompare(b.name));
    } else if (options.sortBy === "price") {
      allResults = allResults.sort((a, b) => {
        const aPrice = a.pricePoint || 0;
        const bPrice = b.pricePoint || 0;
        return aPrice - bPrice;
      });
    }

    // Apply limit
    if (options.limit) {
      allResults = allResults.slice(0, options.limit);
    }

    return {
      results: allResults,
      totalResults: allResults.length,
      searchTerm: options.searchTerm,
      productCount: productResults.length,
      categoryCount: categoryResults.length,
      appliedFilters: filters,
      error: null,
    };
  }

  // ================== MENU RECOMMENDATIONS ==================

  /**
   * Get featured products for menu highlight
   */
  async getFeaturedProducts(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      limit?: number;
    } = {}
  ) {
    const menuResult = await this.getFullMenuData(options);

    if (menuResult.error || !menuResult.data) {
      return {
        products: [],
        error: menuResult.error,
      };
    }

    // For now, return products with highest priority or most popular
    // This could be enhanced with analytics data
    const featuredProducts = menuResult.data.products
      .filter((product: any) => product.featured || product.isActive)
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
      .slice(0, options.limit || 6);

    return {
      products: featuredProducts,
      error: null,
    };
  }

  /**
   * Get menu statistics for analytics with enhanced insights
   */
  async getMenuStatistics(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
    } = {}
  ) {
    const menuResult = await this.getFullMenuData(options);

    if (menuResult.error || !menuResult.data) {
      return {
        stats: null,
        error: menuResult.error,
      };
    }

    const { categories, products, organizedCategories } = menuResult.data;

    // Enhanced statistics calculation
    const activeProducts = products.filter((p: any) => p.isActive);
    const inactiveProducts = products.filter((p: any) => !p.isActive);
    const categoriesWithProducts = organizedCategories.filter(
      (cat) => cat.products.length > 0
    );

    // Tag analysis
    const allTags = new Set<string>();
    const tagUsageCount = new Map<string, number>();
    products.forEach((product: any) => {
      product.tags?.forEach((tag: any) => {
        allTags.add(tag.id);
        tagUsageCount.set(tag.id, (tagUsageCount.get(tag.id) || 0) + 1);
      });
    });

    // Price analysis
    const priceRange = this.calculatePriceRange(products);
    const priceStats = this.calculatePriceStatistics(products);

    // Category distribution
    const categoryDistribution = organizedCategories.map((cat) => ({
      categoryId: cat.category.id,
      categoryName: cat.category.name,
      productCount: cat.products.length,
      activeProductCount: cat.products.filter((p) => p.isActive).length,
      averagePrice: this.calculateAveragePrice(cat.products),
    }));

    const stats = {
      totalCategories: categories.length,
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      inactiveProducts: inactiveProducts.length,
      categoriesWithProducts: categoriesWithProducts.length,
      emptyCategoriesCount: categories.length - categoriesWithProducts.length,
      uncategorizedProducts: menuResult.data.uncategorizedProducts.length,
      averageProductsPerCategory:
        categoriesWithProducts.length > 0
          ? Math.round(
              (activeProducts.length / categoriesWithProducts.length) * 100
            ) / 100
          : 0,
      priceRange,
      priceStatistics: priceStats,
      tagStatistics: {
        totalUniqueTags: allTags.size,
        averageTagsPerProduct:
          products.length > 0
            ? Math.round(
                (Array.from(tagUsageCount.values()).reduce((a, b) => a + b, 0) /
                  products.length) *
                  100
              ) / 100
            : 0,
        mostUsedTags: Array.from(tagUsageCount.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tagId, count]) => ({ tagId, count })),
      },
      categoryDistribution,
      healthMetrics: this.calculateHealthMetrics(products),
    };

    return {
      stats,
      error: null,
    };
  }

  /**
   * Calculate price statistics
   */
  private calculatePriceStatistics(products: any[]) {
    const prices = products
      .map((p) => p.pricePoint)
      .filter((price) => typeof price === "number" && price > 0);

    if (prices.length === 0) return null;

    const sortedPrices = prices.sort((a, b) => a - b);
    const sum = prices.reduce((a, b) => a + b, 0);
    const average = sum / prices.length;
    const median =
      sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] +
            sortedPrices[sortedPrices.length / 2]) /
          2
        : sortedPrices[Math.floor(sortedPrices.length / 2)];

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(average * 100) / 100,
      median: Math.round(median * 100) / 100,
      total: prices.length,
    };
  }

  /**
   * Calculate average price for a set of products
   */
  private calculateAveragePrice(products: any[]): number {
    const prices = products
      .map((p) => p.pricePoint)
      .filter((price) => typeof price === "number" && price > 0);

    if (prices.length === 0) return 0;

    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Calculate health metrics for products
   */
  private calculateHealthMetrics(products: any[]) {
    const productsWithNutrition = products.filter(
      (p) => p.calories || p.protein || p.fats || p.carbohydrates
    );

    if (productsWithNutrition.length === 0) {
      return {
        productsWithNutritionInfo: 0,
        averageCalories: 0,
        averageProtein: 0,
        averageFats: 0,
        averageCarbs: 0,
      };
    }

    const totalCalories = productsWithNutrition
      .map((p) => p.calories || 0)
      .reduce((a, b) => a + b, 0);
    const totalProtein = productsWithNutrition
      .map((p) => p.protein || 0)
      .reduce((a, b) => a + b, 0);
    const totalFats = productsWithNutrition
      .map((p) => p.fats || 0)
      .reduce((a, b) => a + b, 0);
    const totalCarbs = productsWithNutrition
      .map((p) => p.carbohydrates || 0)
      .reduce((a, b) => a + b, 0);

    return {
      productsWithNutritionInfo: productsWithNutrition.length,
      averageCalories: Math.round(totalCalories / productsWithNutrition.length),
      averageProtein: Math.round(totalProtein / productsWithNutrition.length),
      averageFats: Math.round(totalFats / productsWithNutrition.length),
      averageCarbs: Math.round(totalCarbs / productsWithNutrition.length),
    };
  }

  // ================== MENU MANAGEMENT ==================

  /**
   * Validate menu structure and data integrity
   */
  async validateMenu(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
    } = {}
  ) {
    const menuResult = await this.getFullMenuData(options);

    if (menuResult.error || !menuResult.data) {
      return {
        isValid: false,
        issues: ["Failed to load menu data"],
        error: menuResult.error,
      };
    }

    const issues: string[] = [];
    const { categories, products, uncategorizedProducts } = menuResult.data;

    // Check for empty categories
    const emptyCategoriesCount = categories.filter((cat: any) => {
      const categoryProducts = products.filter((p: any) =>
        p.categoryBinds?.some((bind: any) => bind.categoryId === cat.id)
      );
      return categoryProducts.length === 0;
    }).length;

    if (emptyCategoriesCount > 0) {
      issues.push(`${emptyCategoriesCount} categories have no products`);
    }

    // Check for uncategorized products
    if (uncategorizedProducts.length > 0) {
      issues.push(
        `${uncategorizedProducts.length} products are not categorized`
      );
    }

    // Check for products without prices
    const productsWithoutPrices = products.filter(
      (p: any) => !p.pricePoint && !p.priceSettings?.price
    ).length;

    if (productsWithoutPrices > 0) {
      issues.push(
        `${productsWithoutPrices} products are missing price information`
      );
    }

    // Check for products without images
    const productsWithoutImages = products.filter(
      (p: any) => !p.images || p.images.length === 0
    ).length;

    if (productsWithoutImages > 0) {
      issues.push(`${productsWithoutImages} products are missing images`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations: this.generateMenuRecommendations(issues),
      error: null,
    };
  }

  // ================== UTILITY METHODS ==================

  /**
   * Build category query variables based on filters
   */
  private buildCategoryQueryVariables({
    brandId,
    pointId,
    orderType,
    filters,
  }: {
    brandId: string;
    pointId: string;
    orderType: string;
    filters?: MenuFilter;
  }) {
    const input: any = {
      brandId,
      filter: {
        isActive: true,
        pointBinds: { pointId, orderType },
        productExists: {
          isActive: true,
          pointBinds: { pointId, orderType },
        },
      },
    };

    if (filters) {
      // Category-specific filters
      if (filters.categoryId) {
        input.filter.ids = [filters.categoryId];
      }
      if (filters.categoriesId) {
        input.filter.ids = filters.categoriesId;
      }

      // Product existence filters for categories
      if (filters.tagIds || filters.tagsIdAll || filters.tagsIdAny) {
        const productExists = input.filter.productExists;
        if (filters.tagIds) productExists.tagsIdAny = filters.tagIds;
        if (filters.tagsIdAll) productExists.tagsIdAll = filters.tagsIdAll;
        if (filters.tagsIdAny) productExists.tagsIdAny = filters.tagsIdAny;
        if (filters.tagsIdNotAll)
          productExists.tagsIdNotAll = filters.tagsIdNotAll;
        if (filters.tagsIdNotAny)
          productExists.tagsIdNotAny = filters.tagsIdNotAny;
      }
    }

    return input;
  }

  /**
   * Build product query variables based on filters
   */
  private buildProductQueryVariables({
    brandId,
    pointId,
    orderType,
    filters,
  }: {
    brandId: string;
    pointId: string;
    orderType: string;
    filters?: MenuFilter;
  }) {
    const input: any = {
      brandId,
      filter: {
        isActive: true,
        pointBinds: { pointId, orderType },
      },
    };

    if (filters) {
      // Category filters
      if (filters.categoryId) {
        input.filter.categoriesId = [filters.categoryId];
      }
      if (filters.categoriesId) {
        input.filter.categoriesId = filters.categoriesId;
      }

      // Tag filters with GraphQL schema support
      if (filters.tagIds) input.filter.tagsIdAny = filters.tagIds;
      if (filters.tagsIdAll) input.filter.tagsIdAll = filters.tagsIdAll;
      if (filters.tagsIdAny) input.filter.tagsIdAny = filters.tagsIdAny;
      if (filters.tagsIdNotAll)
        input.filter.tagsIdNotAll = filters.tagsIdNotAll;
      if (filters.tagsIdNotAny)
        input.filter.tagsIdNotAny = filters.tagsIdNotAny;

      // Variants grouping
      if (filters.variantsGroupStrategy) {
        input.variantsGroupSimpleStrategy = filters.variantsGroupStrategy;
      }
      if (filters.variantsGroupByPrice) {
        input.variantsGroupByPrice = {
          type: filters.variantsGroupByPrice.type,
          pointBind: {
            pointId: filters.variantsGroupByPrice.pointId,
            orderType: filters.variantsGroupByPrice.orderType,
          },
        };
      }
      if (filters.isVariantsGroup !== undefined) {
        input.isVariantsGroup = filters.isVariantsGroup;
      }

      // Sorting
      if (filters.sortBy === "categoryPriority" && filters.sortByCategoryId) {
        input.sortByCategoryPriority = {
          sort: filters.sortOrder?.toUpperCase() || "ASC",
          categoryId: filters.sortByCategoryId,
        };
      }
      if (filters.sortBy === "price") {
        input.sortByPrice = {
          sort: filters.sortOrder?.toUpperCase() || "ASC",
          pointBind: { pointId, orderType },
        };
      }
      if (filters.sortByCategoryId) {
        input.sortByCategoryId = filters.sortByCategoryId;
      }
    }

    return input;
  }

  /**
   * Get products by category with enhanced filtering
   */
  async getProductsByCategory(
    categoryId: string,
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      filters?: Omit<MenuFilter, "categoryId">;
      limit?: number;
    } = {}
  ) {
    const brandId = options.brandId || this.config.defaultBrandId;
    const pointId = options.pointId || this.config.defaultPointId;
    const orderType = options.orderType || this.config.defaultOrderType;

    if (!brandId || !pointId || !orderType) {
      return {
        products: [],
        error: new Error("brandId, pointId, and orderType are required"),
      };
    }

    try {
      const { GET_PRODUCTS_BY_CATEGORY } = await import(
        "../graphql/queries/product"
      );

      const variables = this.buildProductQueryVariables({
        brandId,
        pointId,
        orderType,
        filters: { ...options.filters, categoryId },
      });

      const result = await this.client.query({
        query: GET_PRODUCTS_BY_CATEGORY,
        variables,
        fetchPolicy: "cache-first",
      });

      let products = result.data?.products || [];

      // Apply limit if specified
      if (options.limit) {
        products = products.slice(0, options.limit);
      }

      return {
        products,
        error: null,
      };
    } catch (error) {
      return {
        products: [],
        error: error as Error,
      };
    }
  }

  /**
   * Get products with advanced tagging filters
   */
  async getProductsByTags(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      tagsIdAll?: string[];
      tagsIdAny?: string[];
      tagsIdNotAll?: string[];
      tagsIdNotAny?: string[];
      categoryId?: string;
      sortBy?: "name" | "price" | "categoryPriority";
      sortOrder?: "asc" | "desc";
      limit?: number;
    } = {}
  ) {
    const filters: MenuFilter = {};

    // Only add properties that are defined
    if (options.tagsIdAll) filters.tagsIdAll = options.tagsIdAll;
    if (options.tagsIdAny) filters.tagsIdAny = options.tagsIdAny;
    if (options.tagsIdNotAll) filters.tagsIdNotAll = options.tagsIdNotAll;
    if (options.tagsIdNotAny) filters.tagsIdNotAny = options.tagsIdNotAny;
    if (options.categoryId) filters.categoryId = options.categoryId;
    if (options.sortBy) filters.sortBy = options.sortBy;
    if (options.sortOrder) filters.sortOrder = options.sortOrder;

    // Only pass defined values to avoid exactOptionalPropertyTypes issues
    const menuDataOptions: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
      filters: MenuFilter;
    } = { filters };

    if (options.brandId) menuDataOptions.brandId = options.brandId;
    if (options.pointId) menuDataOptions.pointId = options.pointId;
    if (options.orderType) menuDataOptions.orderType = options.orderType;

    const menuResult = await this.getFullMenuData(menuDataOptions);

    if (menuResult.error || !menuResult.data) {
      return {
        products: [],
        error: menuResult.error,
      };
    }

    let products = menuResult.data.products;

    // Apply limit if specified
    if (options.limit) {
      products = products.slice(0, options.limit);
    }

    return {
      products,
      error: null,
    };
  }

  /**
   * Apply filters to menu data with enhanced GraphQL schema support
   */
  private applyMenuFilters(menuData: MenuData, filters: MenuFilter): MenuData {
    let { organizedCategories, uncategorizedProducts } = menuData;

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();

      organizedCategories = organizedCategories
        .map((cat) => ({
          ...cat,
          products: cat.products.filter((product: any) =>
            this.matchesSearchTerm(product, searchTerm)
          ),
        }))
        .filter((cat) => cat.products.length > 0);

      uncategorizedProducts = uncategorizedProducts.filter((product: any) =>
        this.matchesSearchTerm(product, searchTerm)
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      organizedCategories = organizedCategories.filter(
        (cat) => cat.category.id === filters.categoryId
      );
      uncategorizedProducts = []; // Clear if specific category selected
    }

    // Apply multiple categories filter
    if (filters.categoriesId && filters.categoriesId.length > 0) {
      organizedCategories = organizedCategories.filter((cat) =>
        filters.categoriesId!.includes(cat.category.id)
      );
    }

    // Apply tag filters with GraphQL schema support
    if (
      filters.tagIds ||
      filters.tagsIdAll ||
      filters.tagsIdAny ||
      filters.tagsIdNotAll ||
      filters.tagsIdNotAny
    ) {
      const filterByTags = (product: any) => {
        const productTagIds = product.tags?.map((tag: any) => tag.id) || [];

        // Legacy tagIds support (treated as tagsIdAny)
        if (filters.tagIds && filters.tagIds.length > 0) {
          if (!filters.tagIds.some((tagId) => productTagIds.includes(tagId))) {
            return false;
          }
        }

        // Contains all tags
        if (filters.tagsIdAll && filters.tagsIdAll.length > 0) {
          if (
            !filters.tagsIdAll.every((tagId) => productTagIds.includes(tagId))
          ) {
            return false;
          }
        }

        // Contains at least one tag
        if (filters.tagsIdAny && filters.tagsIdAny.length > 0) {
          if (
            !filters.tagsIdAny.some((tagId) => productTagIds.includes(tagId))
          ) {
            return false;
          }
        }

        // Does not contain all tags
        if (filters.tagsIdNotAll && filters.tagsIdNotAll.length > 0) {
          if (
            filters.tagsIdNotAll.every((tagId) => productTagIds.includes(tagId))
          ) {
            return false;
          }
        }

        // Does not contain any of these tags
        if (filters.tagsIdNotAny && filters.tagsIdNotAny.length > 0) {
          if (
            filters.tagsIdNotAny.some((tagId) => productTagIds.includes(tagId))
          ) {
            return false;
          }
        }

        return true;
      };

      organizedCategories = organizedCategories.map((cat) => ({
        ...cat,
        products: cat.products.filter(filterByTags),
      }));

      uncategorizedProducts = uncategorizedProducts.filter(filterByTags);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const filterByPrice = (product: any) => {
        const price = product.pricePoint;
        if (typeof price !== "number") return true;

        const { min, max } = filters.priceRange!;
        if (min !== undefined && price < min) return false;
        if (max !== undefined && price > max) return false;
        return true;
      };

      organizedCategories = organizedCategories.map((cat) => ({
        ...cat,
        products: cat.products.filter(filterByPrice),
      }));

      uncategorizedProducts = uncategorizedProducts.filter(filterByPrice);
    }

    // Apply sorting (client-side for complex cases)
    if (filters.sortBy && filters.sortBy !== "categoryPriority") {
      const sortProducts = (products: any[]) => {
        return products.sort((a, b) => {
          let comparison = 0;

          switch (filters.sortBy) {
            case "name":
              comparison = a.name.localeCompare(b.name);
              break;
            case "price":
              const aPrice = a.pricePoint || 0;
              const bPrice = b.pricePoint || 0;
              comparison = aPrice - bPrice;
              break;
            case "popularity":
              // You could implement popularity scoring here
              comparison = (b.priority || 0) - (a.priority || 0);
              break;
          }

          return filters.sortOrder === "desc" ? -comparison : comparison;
        });
      };

      organizedCategories = organizedCategories.map((cat) => ({
        ...cat,
        products: sortProducts([...cat.products]),
      }));

      uncategorizedProducts = sortProducts([...uncategorizedProducts]);
    }

    // Calculate new totals
    const allProducts = [
      ...organizedCategories.flatMap((cat) => cat.products),
      ...uncategorizedProducts,
    ];

    return {
      ...menuData,
      organizedCategories,
      uncategorizedProducts,
      totalProducts: allProducts.length,
      totalCategories: organizedCategories.length,
      products: allProducts,
      categories: organizedCategories.map((cat) => cat.category),
    };
  }

  /**
   * Check if product matches search term
   */
  private matchesSearchTerm(product: any, searchTerm: string): boolean {
    const name = product.name?.toLowerCase() || "";
    const description = product.description?.toLowerCase() || "";
    const tags = product.tags?.map((tag: any) => tag.name.toLowerCase()) || [];
    const slug = product.slug?.toLowerCase() || "";

    return (
      name.includes(searchTerm) ||
      description.includes(searchTerm) ||
      slug.includes(searchTerm) ||
      tags.some((tag: string) => tag.includes(searchTerm))
    );
  }

  /**
   * Calculate enhanced relevance score for product search including tags
   */
  private calculateAdvancedRelevanceScore(
    product: any,
    searchTerm: string
  ): number {
    const name = product.name?.toLowerCase() || "";
    const description = product.description?.toLowerCase() || "";
    const tags =
      product.tags?.map((tag: any) => tag.name.toLowerCase()).join(" ") || "";
    const slug = product.slug?.toLowerCase() || "";

    let score = 0;

    // Exact name match gets highest score
    if (name === searchTerm) score += 100;
    // Name starts with search term
    else if (name.startsWith(searchTerm)) score += 80;
    // Name contains search term
    else if (name.includes(searchTerm)) score += 60;

    // Slug matching (important for SEO)
    if (slug === searchTerm) score += 90;
    else if (slug.includes(searchTerm)) score += 50;

    // Description contains search term
    if (description.includes(searchTerm)) score += 30;

    // Tag matching with higher priority
    const tagNames =
      product.tags?.map((tag: any) => tag.name.toLowerCase()) || [];
    const exactTagMatch = tagNames.some(
      (tagName: string) => tagName === searchTerm
    );
    const partialTagMatch = tagNames.some((tagName: string) =>
      tagName.includes(searchTerm)
    );

    if (exactTagMatch) score += 70;
    else if (partialTagMatch) score += 40;
    else if (tags.includes(searchTerm)) score += 35;

    // Boost score for active products
    if (product.isActive) score += 10;

    // Nutritional information matching (for health-conscious searches)
    if (searchTerm.includes("калори") || searchTerm.includes("calories")) {
      if (product.calories) score += 20;
    }
    if (searchTerm.includes("белок") || searchTerm.includes("protein")) {
      if (product.protein) score += 20;
    }
    if (searchTerm.includes("жир") || searchTerm.includes("fat")) {
      if (product.fats) score += 20;
    }
    if (searchTerm.includes("углевод") || searchTerm.includes("carb")) {
      if (product.carbohydrates) score += 20;
    }

    return score;
  }

  /**
   * Calculate relevance score for product search (legacy method)
   */
  private calculateRelevanceScore(product: any, searchTerm: string): number {
    return this.calculateAdvancedRelevanceScore(product, searchTerm);
  }

  /**
   * Calculate relevance score for category search
   */
  private calculateCategoryRelevanceScore(
    category: any,
    searchTerm: string
  ): number {
    const name = category.name?.toLowerCase() || "";

    if (name === searchTerm) return 90;
    if (name.startsWith(searchTerm)) return 70;
    if (name.includes(searchTerm)) return 50;

    return 0;
  }

  /**
   * Calculate price range from products
   */
  private calculatePriceRange(
    products: any[]
  ): { min: number; max: number } | null {
    const prices = products
      .map((p) => p.pricePoint)
      .filter((price) => typeof price === "number" && price > 0);

    if (prices.length === 0) return null;

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Generate recommendations based on menu issues
   */
  private generateMenuRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];

    issues.forEach((issue) => {
      if (issue.includes("categories have no products")) {
        recommendations.push(
          "Consider removing empty categories or adding products to them"
        );
      }
      if (issue.includes("products are not categorized")) {
        recommendations.push(
          "Assign uncategorized products to appropriate categories"
        );
      }
      if (issue.includes("missing price information")) {
        recommendations.push("Add pricing information to all products");
      }
      if (issue.includes("missing images")) {
        recommendations.push(
          "Add high-quality images to improve product presentation"
        );
      }
    });

    return recommendations;
  }

  // ================== CACHE MANAGEMENT ==================

  /**
   * Preload menu data for better performance
   */
  async preloadMenu(
    options: {
      brandId?: string;
      pointId?: string;
      orderType?: string;
    } = {}
  ) {
    const brandId = options.brandId || this.config.defaultBrandId;
    const pointId = options.pointId || this.config.defaultPointId;
    const orderType = options.orderType || this.config.defaultOrderType;

    if (!brandId || !pointId || !orderType) {
      return;
    }

    // Preload in background
    this.client.query({
      query: GET_MENU_DATA,
      variables: { brandId, pointId, orderType },
      fetchPolicy: "cache-first",
    });
  }

  /**
   * Invalidate menu cache
   */
  invalidateCache() {
    this.client.refetchQueries({
      include: [
        "GetMenuData",
        "GetCategoriesWithProductsCount",
        "GetAvailableProducts",
      ],
    });
  }
}

// ================== STATIC FACTORY METHODS ==================

export const MenuManagerFactory = {
  /**
   * Create a new MenuManager instance
   */
  create: (config: MenuManagerConfig): MenuManager => new MenuManager(config),

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
  ): MenuManager => {
    const config: MenuManagerConfig = { client };
    if (defaults?.brandId) config.defaultBrandId = defaults.brandId;
    if (defaults?.pointId) config.defaultPointId = defaults.pointId;
    if (defaults?.orderType) config.defaultOrderType = defaults.orderType;
    return new MenuManager(config);
  },
};

export default MenuManager;
