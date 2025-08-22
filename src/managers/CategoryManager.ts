import { ApolloClient } from "@apollo/client";
import {
  GET_CATEGORIES_DETAIL,
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,
  GET_BRAND_CATEGORIES,
  GET_PARENT_CATEGORIES,
  GET_SUBCATEGORIES,
} from "../graphql/queries/category";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_CATEGORY_ACTIVE,
  UPDATE_CATEGORY_PRIORITY,
} from "../graphql/mutations/category";

// ====================================================================
// CATEGORY MANAGER - High-level business logic for category operations
// ====================================================================

export interface CategoryManagerConfig {
  client: ApolloClient<any>;
  defaultBrandId?: string;
}

export interface CategoryFilter {
  isActive?: boolean;
  parentId?: string | null;
  hasProducts?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  brandId: string;
  parentId?: string | null;
  imageUrl?: string;
  priority?: number;
  isActive?: boolean;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  priority: number;
  isActive: boolean;
  children: CategoryHierarchy[];
  productCount: number;
  level: number;
}

export class CategoryManager {
  private client: ApolloClient<any>;
  private config: CategoryManagerConfig;

  constructor(config: CategoryManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get categories with product counts for menu display
   */
  async getForMenu(options: {
    brandId?: string;
    pointId: string;
    orderType: string;
    includeEmpty?: boolean;
  }) {
    const brandId = options.brandId || this.config.defaultBrandId;

    if (!brandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_CATEGORIES_WITH_PRODUCTS_COUNT,
        variables: {
          brandId,
          pointId: options.pointId,
          orderType: options.orderType,
        },
        fetchPolicy: "cache-first",
      });

      let categories = result.data?.categories || [];

      // Filter out empty categories if requested
      if (!options.includeEmpty) {
        categories = categories.filter(
          (cat: any) => cat.productsCount && cat.productsCount > 0
        );
      }

      return {
        categories,
        total: categories.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        categories: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get all categories for a brand (admin view)
   */
  async getForAdmin(
    options: {
      brandId?: string;
      filters?: CategoryFilter;
    } = {}
  ) {
    const brandId = options.brandId || this.config.defaultBrandId;

    if (!brandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_BRAND_CATEGORIES,
        variables: { brandId },
        fetchPolicy: "cache-first",
      });

      let categories = result.data?.categories || [];

      // Apply filters if provided
      if (options.filters) {
        categories = this.applyFilters(categories, options.filters);
      }

      return {
        categories,
        total: categories.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        categories: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get category hierarchy with parent-child relationships
   */
  async getHierarchy(
    options: {
      brandId?: string;
      maxDepth?: number;
    } = {}
  ): Promise<{
    hierarchy: CategoryHierarchy[];
    flatList: any[];
    totalLevels: number;
    error: Error | null;
  }> {
    const brandId = options.brandId || this.config.defaultBrandId;

    if (!brandId) {
      return {
        hierarchy: [],
        flatList: [],
        totalLevels: 0,
        error: new Error("brandId is required"),
      };
    }

    try {
      const result = await this.client.query({
        query: GET_BRAND_CATEGORIES,
        variables: { brandId },
        fetchPolicy: "cache-first",
      });

      const allCategories = result.data?.categories || [];

      // Build hierarchy
      const hierarchy = this.buildCategoryHierarchy(
        allCategories,
        options.maxDepth
      );
      const totalLevels = this.calculateMaxDepth(hierarchy);

      return {
        hierarchy,
        flatList: allCategories,
        totalLevels,
        error: null,
      };
    } catch (error) {
      return {
        hierarchy: [],
        flatList: [],
        totalLevels: 0,
        error: error as Error,
      };
    }
  }

  /**
   * Get parent categories only (top-level)
   */
  async getParentCategories(brandId?: string) {
    const finalBrandId = brandId || this.config.defaultBrandId;

    if (!finalBrandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_PARENT_CATEGORIES,
        variables: { brandId: finalBrandId },
        fetchPolicy: "cache-first",
      });

      return {
        categories: result.data?.categories || [],
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        categories: [],
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get subcategories for a parent category
   */
  async getSubcategories(parentId: string, brandId?: string) {
    const finalBrandId = brandId || this.config.defaultBrandId;

    if (!finalBrandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_SUBCATEGORIES,
        variables: { brandId: finalBrandId, parentId },
        fetchPolicy: "cache-first",
      });

      return {
        categories: result.data?.categories || [],
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        categories: [],
        loading: false,
        error: error as Error,
      };
    }
  }

  // ================== MUTATION METHODS ==================

  /**
   * Create a new category with validation
   */
  async create(input: CreateCategoryInput) {
    try {
      // Validate required fields
      if (!input.name || !input.brandId) {
        throw new Error("Name and brandId are required");
      }

      // Generate slug if not provided
      if (!input.slug) {
        input.slug = this.generateSlug(input.name);
      }

      const result = await this.client.mutate({
        mutation: CREATE_CATEGORY,
        variables: { input },
        refetchQueries: [
          "GetBrandCategories",
          "GetCategoriesWithProductsCount",
        ],
        awaitRefetchQueries: true,
      });

      return {
        category: result.data?.categoryCreate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        category: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Update an existing category
   */
  async update(input: any) {
    try {
      const result = await this.client.mutate({
        mutation: UPDATE_CATEGORY,
        variables: { input },
        refetchQueries: [
          "GetBrandCategories",
          "GetCategoriesWithProductsCount",
        ],
      });

      return {
        category: result.data?.categoryUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        category: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Delete a category with safety checks
   */
  async delete(
    categoryId: string,
    brandId?: string,
    options?: {
      moveProductsTo?: string;
      force?: boolean;
    }
  ) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      // Check if category has products (safety check)
      if (!options?.force) {
        const categoryCheck = await this.getById(categoryId, finalBrandId);
        if (categoryCheck.error) {
          throw categoryCheck.error;
        }

        // You could add additional checks here for products in this category
      }

      const result = await this.client.mutate({
        mutation: DELETE_CATEGORY,
        variables: {
          input: { categoryId, brandId: finalBrandId },
        },
        refetchQueries: [
          "GetBrandCategories",
          "GetCategoriesWithProductsCount",
        ],
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
   * Toggle category active status
   */
  async toggleActive(categoryId: string, brandId?: string) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      // Get current category to determine new state
      const currentCategory = await this.getById(categoryId, finalBrandId);
      if (currentCategory.error) {
        throw currentCategory.error;
      }

      const newActiveState = !currentCategory.category?.isActive;

      const result = await this.client.mutate({
        mutation: TOGGLE_CATEGORY_ACTIVE,
        variables: {
          categoryId,
          brandId: finalBrandId,
          isActive: newActiveState,
        },
        optimisticResponse: {
          categoryUpdate: {
            id: categoryId,
            isActive: newActiveState,
            __typename: "Category",
          },
        },
      });

      return {
        category: result.data?.categoryUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        category: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== HIERARCHY MANAGEMENT ==================

  /**
   * Reorder categories by updating priorities
   */
  async reorderCategories(
    reorderData: Array<{
      categoryId: string;
      newPriority: number;
    }>,
    brandId?: string
  ) {
    const finalBrandId = brandId || this.config.defaultBrandId;
    if (!finalBrandId) {
      throw new Error("brandId is required");
    }

    const results = [];

    try {
      for (const item of reorderData) {
        const result = await this.client.mutate({
          mutation: UPDATE_CATEGORY_PRIORITY,
          variables: {
            categoryId: item.categoryId,
            brandId: finalBrandId,
            priority: item.newPriority,
          },
        });
        results.push(result);
      }

      // Refetch categories after all updates
      await this.client.refetchQueries({
        include: ["GetBrandCategories", "GetCategoriesWithProductsCount"],
      });

      return {
        success: true,
        updatedCount: results.length,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        updatedCount: results.filter((r) => r.data).length,
        error: error as Error,
      };
    }
  }

  /**
   * Move category to different parent
   */
  async moveCategory(
    categoryId: string,
    newParentId: string | null,
    brandId?: string
  ) {
    const finalBrandId = brandId || this.config.defaultBrandId;
    if (!finalBrandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.mutate({
        mutation: UPDATE_CATEGORY,
        variables: {
          input: {
            categoryId,
            brandId: finalBrandId,
            parentId: newParentId,
          },
        },
        refetchQueries: ["GetBrandCategories"],
      });

      return {
        category: result.data?.categoryUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        category: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Get category by ID
   */
  async getById(categoryId: string, brandId?: string) {
    try {
      const finalBrandId = brandId || this.config.defaultBrandId;
      if (!finalBrandId) {
        throw new Error("brandId is required");
      }

      const result = await this.client.query({
        query: GET_CATEGORIES_DETAIL,
        variables: {
          input: { categoryId, brandId: finalBrandId },
        },
        fetchPolicy: "cache-first",
      });

      return {
        category: result.data?.category,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        category: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Search categories by name
   */
  async search(searchTerm: string, brandId?: string) {
    const finalBrandId = brandId || this.config.defaultBrandId;
    if (!finalBrandId) {
      return {
        categories: [],
        total: 0,
        searchTerm,
        loading: false,
        error: new Error("brandId is required"),
      };
    }

    const categoriesResult = await this.getForAdmin({ brandId: finalBrandId });

    if (categoriesResult.error) {
      return categoriesResult;
    }

    const filteredCategories = categoriesResult.categories.filter(
      (category: any) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      categories: filteredCategories,
      total: filteredCategories.length,
      searchTerm,
      loading: false,
      error: null,
    };
  }

  /**
   * Generate URL-friendly slug from category name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Apply filters to categories
   */
  private applyFilters(categories: any[], filters: CategoryFilter): any[] {
    let filtered = [...categories];

    if (filters.isActive !== undefined) {
      filtered = filtered.filter((cat) => cat.isActive === filters.isActive);
    }

    if (filters.parentId !== undefined) {
      filtered = filtered.filter((cat) => cat.parentId === filters.parentId);
    }

    return filtered;
  }

  /**
   * Build hierarchical structure from flat category list
   */
  private buildCategoryHierarchy(
    categories: any[],
    maxDepth?: number,
    currentDepth = 0
  ): CategoryHierarchy[] {
    if (maxDepth && currentDepth >= maxDepth) {
      return [];
    }

    // Get root categories (no parent)
    const rootCategories = categories.filter((cat) => !cat.parentId);

    return rootCategories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      priority: category.priority || 0,
      isActive: category.isActive,
      level: currentDepth,
      productCount: category.productsCount || 0,
      children: this.buildCategoryHierarchy(
        categories.filter((cat) => cat.parentId === category.id),
        maxDepth,
        currentDepth + 1
      ),
    }));
  }

  /**
   * Calculate maximum depth of hierarchy
   */
  private calculateMaxDepth(hierarchy: CategoryHierarchy[]): number {
    if (hierarchy.length === 0) return 0;

    return Math.max(
      ...hierarchy.map(
        (cat) =>
          1 +
          (cat.children.length > 0 ? this.calculateMaxDepth(cat.children) : 0)
      )
    );
  }

  // ================== VALIDATION METHODS ==================

  /**
   * Validate category structure
   */
  async validateCategoryStructure(brandId?: string) {
    const finalBrandId = brandId || this.config.defaultBrandId;

    if (!finalBrandId) {
      return {
        isValid: false,
        issues: ["brandId is required"],
        error: new Error("brandId is required"),
      };
    }

    const hierarchyResult = await this.getHierarchy({ brandId: finalBrandId });

    if (hierarchyResult.error) {
      return {
        isValid: false,
        issues: ["Failed to load category structure"],
        error: hierarchyResult.error,
      };
    }

    const issues: string[] = [];
    const { hierarchy, flatList } = hierarchyResult;

    // Check for circular references (simplified check)
    const circularReferences = this.findCircularReferences(flatList);
    if (circularReferences.length > 0) {
      issues.push(
        `Found ${circularReferences.length} circular references in category hierarchy`
      );
    }

    // Check for orphaned categories
    const orphanedCategories = flatList.filter((cat: any) => {
      if (!cat.parentId) return false; // Root categories are not orphaned
      return !flatList.some((parent: any) => parent.id === cat.parentId);
    });

    if (orphanedCategories.length > 0) {
      issues.push(`Found ${orphanedCategories.length} orphaned categories`);
    }

    // Check for excessive nesting
    if (hierarchyResult.totalLevels > 5) {
      issues.push(
        `Category hierarchy is too deep (${hierarchyResult.totalLevels} levels)`
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations: this.generateCategoryRecommendations(issues),
      stats: {
        totalCategories: flatList.length,
        rootCategories: hierarchy.length,
        maxDepth: hierarchyResult.totalLevels,
        orphanedCount: orphanedCategories.length,
      },
      error: null,
    };
  }

  /**
   * Find circular references in category hierarchy (simplified)
   */
  private findCircularReferences(categories: any[]): string[] {
    const circular: string[] = [];

    categories.forEach((category: any) => {
      if (category.parentId === category.id) {
        circular.push(category.id);
      }
    });

    return circular;
  }

  /**
   * Generate recommendations for category structure issues
   */
  private generateCategoryRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];

    issues.forEach((issue) => {
      if (issue.includes("circular references")) {
        recommendations.push(
          "Fix circular references by updating parent category assignments"
        );
      }
      if (issue.includes("orphaned categories")) {
        recommendations.push(
          "Assign orphaned categories to valid parent categories or make them root categories"
        );
      }
      if (issue.includes("too deep")) {
        recommendations.push(
          "Consider flattening the category structure to improve navigation"
        );
      }
    });

    return recommendations;
  }

  // ================== CACHE MANAGEMENT ==================

  /**
   * Invalidate category cache
   */
  invalidateCache() {
    this.client.refetchQueries({
      include: [
        "GetBrandCategories",
        "GetCategoriesWithProductsCount",
        "GetParentCategories",
      ],
    });
  }

  /**
   * Preload categories for better performance
   */
  async preloadCategories(brandId?: string) {
    const finalBrandId = brandId || this.config.defaultBrandId;
    if (!finalBrandId) return;

    // Preload in background
    this.client.query({
      query: GET_BRAND_CATEGORIES,
      variables: { brandId: finalBrandId },
      fetchPolicy: "cache-first",
    });
  }
}

// ================== STATIC FACTORY METHODS ==================

export const CategoryManagerFactory = {
  /**
   * Create a new CategoryManager instance
   */
  create: (config: CategoryManagerConfig): CategoryManager =>
    new CategoryManager(config),

  /**
   * Create with default Apollo client
   */
  createWithClient: (
    client: ApolloClient<any>,
    defaultBrandId?: string
  ): CategoryManager => {
    const config: CategoryManagerConfig = { client };
    if (defaultBrandId) {
      config.defaultBrandId = defaultBrandId;
    }
    return new CategoryManager(config);
  },
};

export default CategoryManager;
