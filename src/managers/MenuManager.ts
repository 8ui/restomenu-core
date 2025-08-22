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
  tagIds?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: "name" | "price" | "popularity" | "category";
  sortOrder?: "asc" | "desc";
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
   * Get complete menu data with categories and products
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

      // Apply filters if provided
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
   * Search menu items with intelligent ranking
   */
  async searchMenu(options: {
    searchTerm: string;
    brandId?: string;
    pointId?: string;
    orderType?: string;
    limit?: number;
  }) {
    // Only pass defined values
    const menuDataOptions: any = {};
    if (options.brandId !== undefined)
      menuDataOptions.brandId = options.brandId;
    if (options.pointId !== undefined)
      menuDataOptions.pointId = options.pointId;
    if (options.orderType !== undefined)
      menuDataOptions.orderType = options.orderType;

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

    // Search in products with ranking
    const productResults = products
      .map((product: any) => ({
        ...product,
        type: "product",
        relevanceScore: this.calculateRelevanceScore(product, searchTerm),
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

    // Combine and sort by relevance
    const allResults = [...productResults, ...categoryResults]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, options.limit || 20);

    return {
      results: allResults,
      totalResults: allResults.length,
      searchTerm: options.searchTerm,
      productCount: productResults.length,
      categoryCount: categoryResults.length,
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
   * Get menu statistics for analytics
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

    const stats = {
      totalCategories: categories.length,
      totalProducts: products.length,
      activeProducts: products.filter((p: any) => p.isActive).length,
      inactiveProducts: products.filter((p: any) => !p.isActive).length,
      categoriesWithProducts: organizedCategories.filter(
        (cat) => cat.products.length > 0
      ).length,
      uncategorizedProducts: menuResult.data.uncategorizedProducts.length,
      averageProductsPerCategory:
        organizedCategories.length > 0
          ? Math.round((products.length / organizedCategories.length) * 100) /
            100
          : 0,
      priceRange: this.calculatePriceRange(products),
    };

    return {
      stats,
      error: null,
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
   * Apply filters to menu data
   */
  private applyMenuFilters(menuData: MenuData, filters: MenuFilter): MenuData {
    let { organizedCategories, uncategorizedProducts } = menuData;

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();

      organizedCategories = organizedCategories
        .map((cat) => ({
          ...cat,
          products: cat.products.filter(
            (product: any) =>
              product.name.toLowerCase().includes(searchTerm) ||
              product.description?.toLowerCase().includes(searchTerm) ||
              product.tags?.some((tag: any) =>
                tag.name.toLowerCase().includes(searchTerm)
              )
          ),
        }))
        .filter((cat) => cat.products.length > 0);

      uncategorizedProducts = uncategorizedProducts.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      organizedCategories = organizedCategories.filter(
        (cat) => cat.category.id === filters.categoryId
      );
      uncategorizedProducts = []; // Clear if specific category selected
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
   * Calculate relevance score for product search
   */
  private calculateRelevanceScore(product: any, searchTerm: string): number {
    const name = product.name?.toLowerCase() || "";
    const description = product.description?.toLowerCase() || "";
    const tags =
      product.tags?.map((tag: any) => tag.name.toLowerCase()).join(" ") || "";

    let score = 0;

    // Exact name match gets highest score
    if (name === searchTerm) score += 100;
    // Name starts with search term
    else if (name.startsWith(searchTerm)) score += 80;
    // Name contains search term
    else if (name.includes(searchTerm)) score += 60;

    // Description contains search term
    if (description.includes(searchTerm)) score += 30;

    // Tags contain search term
    if (tags.includes(searchTerm)) score += 40;

    return score;
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
