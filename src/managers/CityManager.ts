import { ApolloClient } from "@apollo/client";
import {
  GET_CITIES,
  GET_CITY_DETAIL,
  GET_CITIES_FOR_BRAND,
} from "../graphql/queries/city";

// ====================================================================
// CITY MANAGER - High-level business logic for city operations
// ====================================================================

export interface CityManagerConfig {
  client: ApolloClient<any>;
  defaultBrandId?: string;
}

export interface CityFilter {
  brandsId?: string[];
  ids?: string[];
}

export class CityManager {
  private client: ApolloClient<any>;
  private config: CityManagerConfig;

  constructor(config: CityManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get city by ID with caching
   */
  async getById(cityId: string) {
    try {
      const result = await this.client.query({
        query: GET_CITY_DETAIL,
        variables: { input: { id: cityId } },
        fetchPolicy: "cache-first",
      });

      return {
        city: result.data.city,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        city: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get cities with filtering
   */
  async getCities(filters: CityFilter = {}) {
    try {
      const filterInput = {
        filter: {
          ...(filters.brandsId && { brandsId: filters.brandsId }),
          ...(filters.ids && { ids: filters.ids }),
        },
      };

      const result = await this.client.query({
        query: GET_CITIES,
        variables: { input: filterInput },
        fetchPolicy: "cache-first",
      });

      return {
        cities: result.data.cities || [],
        total: result.data.cities?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        cities: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get cities for a specific brand
   */
  async getCitiesForBrand(brandId?: string) {
    const targetBrandId = brandId || this.config.defaultBrandId;

    if (!targetBrandId) {
      throw new Error("brandId is required");
    }

    try {
      const result = await this.client.query({
        query: GET_CITIES_FOR_BRAND,
        variables: { brandId: targetBrandId },
        fetchPolicy: "cache-first",
      });

      return {
        cities: result.data.cities || [],
        total: result.data.cities?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        cities: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get cities with points for brand
   */
  async getCitiesWithPoints(brandId?: string) {
    const result = await this.getCitiesForBrand(brandId);

    if (result.error) {
      return result;
    }

    // Filter cities that have points
    const citiesWithPoints = result.cities.filter(
      (city: any) => city.points && city.points.length > 0
    );

    return {
      cities: citiesWithPoints,
      total: citiesWithPoints.length,
      loading: false,
      error: null,
    };
  }

  // ================== UTILITY METHODS ==================

  /**
   * Get city summary with points count
   */
  async getCitySummary(cityId: string) {
    try {
      const cityResult = await this.getById(cityId);

      if (cityResult.error) {
        throw cityResult.error;
      }

      const city = cityResult.city;

      return {
        summary: {
          city,
          stats: {
            pointsCount: city?.points?.length || 0,
            brandsCount: city?.brands?.length || 0,
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
   * Search cities by name
   */
  async searchCitiesByName(searchTerm: string, brandId?: string) {
    try {
      const result = await this.getCitiesForBrand(brandId);

      if (result.error) {
        return result;
      }

      const filteredCities = result.cities.filter((city: any) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        cities: filteredCities,
        total: filteredCities.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        cities: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get city selection data for UI components
   */
  async getCitySelectionData(brandId?: string) {
    try {
      const result = await this.getCitiesForBrand(brandId);

      if (result.error) {
        return { options: [], error: result.error };
      }

      const options = result.cities.map((city: any) => ({
        value: city.id,
        label: city.name,
        pointsCount: city.points?.length || 0,
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
   * Check if city is available for brand
   */
  async checkCityAvailability(cityId: string, brandId?: string) {
    try {
      const targetBrandId = brandId || this.config.defaultBrandId;

      if (!targetBrandId) {
        return { isAvailable: false, error: "No brand context" };
      }

      const result = await this.getCitiesForBrand(targetBrandId);

      if (result.error) {
        return { isAvailable: false, error: result.error.message };
      }

      const isAvailable = result.cities.some((city: any) => city.id === cityId);

      return { isAvailable, error: null };
    } catch (error) {
      return { isAvailable: false, error: (error as Error).message };
    }
  }
}

// ================== FACTORY FUNCTION ==================

export class CityManagerFactory {
  static create(config: CityManagerConfig): CityManager {
    return new CityManager(config);
  }

  static createWithDefaults(
    client: ApolloClient<any>,
    defaultBrandId?: string
  ): CityManager {
    return new CityManager({
      client,
      defaultBrandId,
    });
  }
}
