import { ApolloClient } from "@apollo/client";
import {
  GET_POINT_BASE,
  GET_POINT_DETAIL,
  GET_POINTS_BY_BRAND,
  GET_POINTS_BY_CITY,
  GET_ACTIVE_POINTS,
} from "../graphql/queries/point";
import { CREATE_POINT, UPDATE_POINT } from "../graphql/mutations/point";

// ====================================================================
// POINT MANAGER - High-level business logic for point operations
// ====================================================================

export interface PointManagerConfig {
  client: ApolloClient<any>;
  defaultBrandId?: string;
  defaultCityId?: string;
}

export interface PointFilter {
  cityId?: string;
  isActive?: boolean;
  brandIds?: string[];
  ids?: string[];
}

export interface CreatePointInput {
  brandId: string;
  cityId: string;
  address: string;
  name: string;
  priority?: number;
  isActive?: boolean;
}

export interface UpdatePointInput {
  id: string;
  brandId: string;
  address?: string;
  name?: string;
  priority?: number;
  isActive?: boolean;
  cityId?: string;
}

export class PointManager {
  private client: ApolloClient<any>;
  private config: PointManagerConfig;

  constructor(config: PointManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get point by ID with caching
   */
  async getById(pointId: string, level: "base" | "detail" = "detail") {
    try {
      const query = level === "base" ? GET_POINT_BASE : GET_POINT_DETAIL;

      const result = await this.client.query({
        query,
        variables: { input: { id: pointId } },
        fetchPolicy: "cache-first",
      });

      return {
        point: result.data.point,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        point: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get points for a brand with filtering
   */
  async getPointsForBrand(brandId?: string, filters: PointFilter = {}) {
    const targetBrandId = brandId || this.config.defaultBrandId;

    if (!targetBrandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_POINTS_BY_BRAND,
        variables: { brandId: targetBrandId },
        fetchPolicy: "cache-first",
      });

      let points = result.data.points || [];

      // Apply client-side filters
      if (filters.cityId !== undefined) {
        points = points.filter((point: any) => point.cityId === filters.cityId);
      }
      if (filters.isActive !== undefined) {
        points = points.filter(
          (point: any) => point.isActive === filters.isActive
        );
      }
      if (filters.ids) {
        points = points.filter((point: any) => filters.ids!.includes(point.id));
      }

      return {
        points,
        total: points.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        points: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get points for a city
   */
  async getPointsForCity(cityId?: string, brandId?: string) {
    const targetCityId = cityId || this.config.defaultCityId;
    const targetBrandId = brandId || this.config.defaultBrandId;

    if (!targetCityId || !targetBrandId) {
      throw new Error("cityId and brandId are required");
    }

    try {
      const result = await this.client.query({
        query: GET_POINTS_BY_CITY,
        variables: { cityId: targetCityId },
        fetchPolicy: "cache-first",
      });

      let points = result.data.points || [];

      // Apply brand filter if needed
      points = points.filter((point: any) => point.brandId === targetBrandId);

      return {
        points,
        total: points.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        points: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get active points only
   */
  async getActivePoints(brandId?: string) {
    const targetBrandId = brandId || this.config.defaultBrandId;

    if (!targetBrandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_ACTIVE_POINTS,
        variables: { brandId: targetBrandId },
        fetchPolicy: "cache-first",
      });

      return {
        points: result.data.points || [],
        total: result.data.points?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        points: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  // ================== HIGH-LEVEL MUTATION METHODS ==================

  /**
   * Create a new point
   */
  async createPoint(input: CreatePointInput) {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_POINT,
        variables: { input },
      });

      return {
        point: result.data?.pointCreate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        point: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Update an existing point
   */
  async updatePoint(input: UpdatePointInput) {
    try {
      const result = await this.client.mutate({
        mutation: UPDATE_POINT,
        variables: { input },
      });

      return {
        point: result.data?.pointUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        point: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Toggle point active status
   */
  async toggleActiveStatus(pointId: string, isActive: boolean) {
    try {
      const pointResult = await this.getById(pointId);

      if (pointResult.error || !pointResult.point) {
        throw new Error("Point not found");
      }

      const result = await this.updatePoint({
        id: pointId,
        brandId: pointResult.point.brandId,
        isActive,
      });

      return result;
    } catch (error) {
      return {
        point: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Get point summary with statistics
   */
  async getPointSummary(pointId: string) {
    try {
      const pointResult = await this.getById(pointId);

      if (pointResult.error) {
        throw pointResult.error;
      }

      const point = pointResult.point;

      return {
        summary: {
          point,
          stats: {
            isActive: point?.isActive || false,
            cityId: point?.cityId,
            brandId: point?.brandId,
            priority: point?.priority || 0,
          },
        },
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        summary: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Search points by name or address
   */
  async searchPoints(searchTerm: string, brandId?: string, cityId?: string) {
    try {
      const filterToApply: PointFilter = {};
      if (cityId !== undefined) {
        filterToApply.cityId = cityId;
      }
      const result = await this.getPointsForBrand(brandId, filterToApply);

      if (result.error) {
        return result;
      }

      const filteredPoints = result.points.filter(
        (point: any) =>
          point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        points: filteredPoints,
        total: filteredPoints.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        points: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get point selection data for UI components
   */
  async getPointSelectionData(brandId?: string, cityId?: string) {
    try {
      const filterToApply: PointFilter = { isActive: true };
      if (cityId !== undefined) {
        filterToApply.cityId = cityId;
      }
      const result = await this.getPointsForBrand(brandId, filterToApply);

      if (result.error) {
        return { options: [], error: result.error };
      }

      const options = result.points.map((point: any) => ({
        value: point.id,
        label: point.name,
        address: point.address,
        cityId: point.cityId,
        isActive: point.isActive,
      }));

      return {
        options,
        error: null,
      };
    } catch (error) {
      return {
        options: [],
        error: error as Error,
      };
    }
  }

  /**
   * Validate point data before operations
   */
  validatePointData(data: Partial<CreatePointInput | UpdatePointInput>) {
    const errors: string[] = [];

    if ("name" in data && (!data.name || data.name.trim().length < 2)) {
      errors.push("Point name must be at least 2 characters long");
    }

    if (
      "address" in data &&
      (!data.address || data.address.trim().length < 5)
    ) {
      errors.push("Point address must be at least 5 characters long");
    }

    if ("brandId" in data && !data.brandId) {
      errors.push("Brand ID is required");
    }

    if ("cityId" in data && !data.cityId) {
      errors.push("City ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// ================== FACTORY FUNCTION ==================

export class PointManagerFactory {
  static create(config: PointManagerConfig): PointManager {
    return new PointManager(config);
  }

  static createWithDefaults(
    client: ApolloClient<any>,
    defaultBrandId?: string,
    defaultCityId?: string
  ): PointManager {
    const config: PointManagerConfig = { client };
    if (defaultBrandId !== undefined) {
      config.defaultBrandId = defaultBrandId;
    }
    if (defaultCityId !== undefined) {
      config.defaultCityId = defaultCityId;
    }
    return new PointManager(config);
  }
}
