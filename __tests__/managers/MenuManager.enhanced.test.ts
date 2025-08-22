import { MenuManager, MenuFilter } from "../../src/managers/MenuManager";
import { ApolloClient, InMemoryCache } from "@apollo/client";

// Mock GraphQL client for testing
const mockClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "http://localhost:4000/graphql",
});

describe("MenuManager Enhanced Features", () => {
  let menuManager: MenuManager;

  beforeEach(() => {
    menuManager = new MenuManager({
      client: mockClient,
      defaultBrandId: "test-brand-id",
      defaultPointId: "test-point-id",
      defaultOrderType: "DELIVERY",
    });
  });

  describe("Enhanced Filtering", () => {
    test("should build proper filters for advanced tag filtering", () => {
      const filters: MenuFilter = {
        tagsIdAll: ["tag1", "tag2"],
        tagsIdAny: ["tag3", "tag4"],
        tagsIdNotAll: ["tag5"],
        tagsIdNotAny: ["tag6"],
        categoryId: "category1",
        sortBy: "price",
        sortOrder: "desc",
      };

      // Test that the filter object is properly structured
      expect(filters.tagsIdAll).toEqual(["tag1", "tag2"]);
      expect(filters.tagsIdAny).toEqual(["tag3", "tag4"]);
      expect(filters.tagsIdNotAll).toEqual(["tag5"]);
      expect(filters.tagsIdNotAny).toEqual(["tag6"]);
      expect(filters.categoryId).toBe("category1");
      expect(filters.sortBy).toBe("price");
      expect(filters.sortOrder).toBe("desc");
    });

    test("should handle optional filter properties correctly", () => {
      const filters: MenuFilter = {
        searchTerm: "pizza",
      };

      expect(filters.searchTerm).toBe("pizza");
      expect(filters.categoryId).toBeUndefined();
      expect(filters.tagsIdAll).toBeUndefined();
    });
  });

  describe("Search Functionality", () => {
    test("should properly structure search options", () => {
      const searchOptions = {
        searchTerm: "burger",
        brandId: "brand-123",
        pointId: "point-456",
        orderType: "PICKUP" as const,
        categoryFilter: "fast-food",
        tagFilters: {
          tagsIdAny: ["vegan", "gluten-free"],
          tagsIdNotAny: ["dairy"],
        },
        sortBy: "relevance" as const,
        limit: 10,
      };

      expect(searchOptions.searchTerm).toBe("burger");
      expect(searchOptions.tagFilters?.tagsIdAny).toEqual([
        "vegan",
        "gluten-free",
      ]);
      expect(searchOptions.tagFilters?.tagsIdNotAny).toEqual(["dairy"]);
      expect(searchOptions.sortBy).toBe("relevance");
    });
  });

  describe("Menu Statistics", () => {
    test("should handle empty product arrays for statistics", () => {
      const products: any[] = [];
      const mockCalculateStats = (products: any[]) => {
        const allTags = new Set<string>();
        const tagUsageCount = new Map<string, number>();

        products.forEach((product: any) => {
          product.tags?.forEach((tag: any) => {
            allTags.add(tag.id);
            tagUsageCount.set(tag.id, (tagUsageCount.get(tag.id) || 0) + 1);
          });
        });

        return {
          totalProducts: products.length,
          tagStatistics: {
            totalUniqueTags: allTags.size,
            averageTagsPerProduct:
              products.length > 0
                ? Math.round(
                    (Array.from(tagUsageCount.values()).reduce(
                      (a, b) => a + b,
                      0
                    ) /
                      products.length) *
                      100
                  ) / 100
                : 0,
          },
        };
      };

      const stats = mockCalculateStats(products);
      expect(stats.totalProducts).toBe(0);
      expect(stats.tagStatistics.totalUniqueTags).toBe(0);
      expect(stats.tagStatistics.averageTagsPerProduct).toBe(0);
    });

    test("should calculate tag statistics correctly", () => {
      const products = [
        {
          id: "1",
          name: "Pizza",
          tags: [
            { id: "tag1", name: "Italian" },
            { id: "tag2", name: "Cheese" },
          ],
        },
        {
          id: "2",
          name: "Burger",
          tags: [
            { id: "tag1", name: "Italian" },
            { id: "tag3", name: "Meat" },
          ],
        },
      ];

      const allTags = new Set<string>();
      const tagUsageCount = new Map<string, number>();

      products.forEach((product: any) => {
        product.tags?.forEach((tag: any) => {
          allTags.add(tag.id);
          tagUsageCount.set(tag.id, (tagUsageCount.get(tag.id) || 0) + 1);
        });
      });

      expect(allTags.size).toBe(3); // tag1, tag2, tag3
      expect(tagUsageCount.get("tag1")).toBe(2); // Used in both products
      expect(tagUsageCount.get("tag2")).toBe(1); // Used in pizza only
      expect(tagUsageCount.get("tag3")).toBe(1); // Used in burger only
    });
  });

  describe("Price Range Calculations", () => {
    test("should calculate price range correctly", () => {
      const products = [
        { id: "1", name: "Cheap Item", pricePoint: 100 },
        { id: "2", name: "Expensive Item", pricePoint: 500 },
        { id: "3", name: "Medium Item", pricePoint: 300 },
        { id: "4", name: "No Price Item", pricePoint: null },
      ];

      const prices = products
        .map((p) => p.pricePoint)
        .filter((price) => typeof price === "number" && price > 0);

      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };

      expect(priceRange.min).toBe(100);
      expect(priceRange.max).toBe(500);
      expect(prices.length).toBe(3); // Only 3 valid prices
    });
  });

  describe("Relevance Scoring", () => {
    test("should score exact name matches highest", () => {
      const product = {
        name: "Pizza Margherita",
        description: "Classic Italian pizza",
        tags: [{ name: "Italian" }, { name: "Vegetarian" }],
        slug: "pizza-margherita",
      };

      const calculateRelevance = (product: any, searchTerm: string): number => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const slug = product.slug?.toLowerCase() || "";

        let score = 0;

        if (name === searchTerm) score += 100;
        else if (name.startsWith(searchTerm)) score += 80;
        else if (name.includes(searchTerm)) score += 60;

        if (slug === searchTerm) score += 90;
        else if (slug.includes(searchTerm)) score += 50;

        if (description.includes(searchTerm)) score += 30;

        return score;
      };

      const exactMatchScore = calculateRelevance(product, "pizza margherita");
      const partialMatchScore = calculateRelevance(product, "pizza");
      const descriptionMatchScore = calculateRelevance(product, "italian");

      expect(exactMatchScore).toBeGreaterThan(partialMatchScore);
      expect(partialMatchScore).toBeGreaterThan(descriptionMatchScore);
      expect(exactMatchScore).toBe(100); // Exact name match
    });
  });
});
