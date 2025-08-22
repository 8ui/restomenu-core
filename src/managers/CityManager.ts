import { ApolloClient, type FetchPolicy } from "@apollo/client";
import {
  GET_CITIES,
  GET_CITY_DETAIL,
  GET_CITIES_FOR_BRAND,
  GET_CITIES_WITH_BRANDS,
  GET_CITY_WITH_BRANDS,
  GET_CITY_COMPREHENSIVE,
  GET_CITIES_COMPREHENSIVE,
} from "../graphql/queries/city";
import type { CitiesFilterInput, PointsForCityInput } from "../graphql-types";

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

export interface CityQueryOptions {
  includeBrands?: boolean;
  includePoints?: boolean;
  pointsInput?: PointsForCityInput;
  fetchPolicy?: FetchPolicy;
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
   * Get city by ID with caching and optional relationship data
   */
  async getById(cityId: string, options: CityQueryOptions = {}) {
    try {
      let query = GET_CITY_DETAIL;
      let variables: any = { input: { id: cityId } };

      // Choose appropriate query based on options
      if (options.includeBrands) {
        query = GET_CITY_WITH_BRANDS;
      } else if (options.includePoints && options.pointsInput) {
        query = GET_CITY_COMPREHENSIVE; // This will need to be updated to handle points
        variables.pointsInput = options.pointsInput;
      }

      const result = await this.client.query({
        query,
        variables,
        fetchPolicy: options.fetchPolicy || "cache-first",
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
   * Get cities with filtering and optional relationship data
   */
  async getCities(filters: CityFilter = {}, options: CityQueryOptions = {}) {
    try {
      const filterInput = {
        filter: {
          ...(filters.brandsId && { brandsId: filters.brandsId }),
          ...(filters.ids && { ids: filters.ids }),
        },
      };

      // Choose appropriate query based on options
      let query = GET_CITIES;
      if (options.includeBrands) {
        query = GET_CITIES_WITH_BRANDS;
      }

      const result = await this.client.query({
        query,
        variables: { input: filterInput },
        fetchPolicy: options.fetchPolicy || "cache-first",
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
   * Get cities for a specific brand (optimized query)
   */
  async getCitiesForBrand(brandId?: string, options: CityQueryOptions = {}) {
    const targetBrandId = brandId || this.config.defaultBrandId;

    if (!targetBrandId) {
      throw new Error("brandId is required");
    }

    try {
      // Use optimized query for single brand
      let query = GET_CITIES_FOR_BRAND;
      if (options.includeBrands) {
        query = GET_CITIES_WITH_BRANDS;
      }

      const variables = options.includeBrands
        ? { input: { filter: { brandsId: [targetBrandId] } } }
        : { brandId: targetBrandId };

      const result = await this.client.query({
        query,
        variables,
        fetchPolicy: options.fetchPolicy || "cache-first",
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
   * Get cities for a brand with full relationship data
   */
  async getCitiesForBrandWithBrands(brandId?: string) {
    return this.getCitiesForBrand(brandId, { includeBrands: true });
  }

  /**
   * Get cities with points for brand
   */
  async getCitiesWithPoints(brandId?: string) {
    const result = await this.getCitiesForBrand(brandId);

    if (result.error) {
      return result;
    }

    // Filter cities that have points (Note: points require separate query per city)
    // For now, return all cities - points would need to be fetched separately
    // due to GraphQL schema requiring brandId parameter for points

    return {
      cities: result.cities,
      total: result.cities.length,
      loading: false,
      error: null,
    };
  }

  /**
   * Get comprehensive city data with relationships
   */
  async getCityComprehensive(cityId: string) {
    try {
      const result = await this.client.query({
        query: GET_CITY_COMPREHENSIVE,
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
   * Get cities with comprehensive data
   */
  async getCitiesComprehensive(filters: CityFilter = {}) {
    try {
      const filterInput = {
        filter: {
          ...(filters.brandsId && { brandsId: filters.brandsId }),
          ...(filters.ids && { ids: filters.ids }),
        },
      };

      const result = await this.client.query({
        query: GET_CITIES_COMPREHENSIVE,
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

  // ================== UTILITY METHODS ==================

  /**
   * Get city summary with comprehensive stats
   */
  async getCitySummary(cityId: string) {
    try {
      const cityResult = await this.getCityComprehensive(cityId);

      if (cityResult.error) {
        throw cityResult.error;
      }

      const city = cityResult.city;

      return {
        summary: {
          city,
          stats: {
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
  async searchCitiesByName(
    searchTerm: string,
    brandId?: string,
    options: CityQueryOptions = {}
  ) {
    try {
      const result = await this.getCitiesForBrand(brandId, options);

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
  async getCitySelectionData(brandId?: string, includeBrands = false) {
    try {
      const result = await this.getCitiesForBrand(brandId, { includeBrands });

      if (result.error) {
        return { options: [], error: result.error };
      }

      const options = result.cities.map((city: any) => ({
        value: city.id,
        label: city.name,
        city: city,
        brands: city.brands || [],
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
   * Validate city exists and is accessible for brand
   */
  async validateCityForBrand(cityId: string, brandId?: string) {
    try {
      const targetBrandId = brandId || this.config.defaultBrandId;

      if (!targetBrandId) {
        throw new Error("brandId is required");
      }

      const result = await this.getCities({
        ids: [cityId],
        brandsId: [targetBrandId],
      });

      const cityExists = result.cities.length > 0;

      return {
        isValid: cityExists,
        city: cityExists ? result.cities[0] : null,
        error: result.error,
      };
    } catch (error) {
      return {
        isValid: false,
        city: null,
        error: error as Error,
      };
    }
  }

  /**
   * Get cities grouped by first letter (for alphabetical lists)
   */
  async getCitiesGroupedAlphabetically(brandId?: string) {
    try {
      const result = await this.getCitiesForBrand(brandId);

      if (result.error) {
        return { groups: {}, error: result.error };
      }

      const groups = result.cities.reduce((acc: any, city: any) => {
        const firstLetter = city.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(city);
        return acc;
      }, {});

      // Sort each group alphabetically
      Object.keys(groups).forEach((letter) => {
        groups[letter].sort((a: any, b: any) => a.name.localeCompare(b.name));
      });

      return {
        groups,
        error: null,
      };
    } catch (error) {
      return {
        groups: {},
        error: error as Error,
      };
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
    const config: CityManagerConfig = { client };
    if (defaultBrandId !== undefined) {
      config.defaultBrandId = defaultBrandId;
    }
    return new CityManager(config);
  }
}
