import { useQuery } from "@apollo/client";
import {
  GET_CITIES,
  GET_CITY_DETAIL,
  GET_CITIES_FOR_BRAND,
  GET_CITIES_WITH_BRANDS,
  GET_CITY_WITH_BRANDS,
  GET_CITY_COMPREHENSIVE,
  GET_CITIES_COMPREHENSIVE,
} from "../graphql/queries/city";
import type {
  CityInput,
  CitiesInput,
  PointsForCityInput,
} from "../graphql-types";

// ====================================================================
// CITY HOOKS - React hooks for city operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single city
export const useCity = ({
  input,
  skip = false,
}: {
  input: CityInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CITY_DETAIL, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting multiple cities
export const useCities = ({
  input,
  skip = false,
}: {
  input: CitiesInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CITIES, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting cities for a specific brand (optimized query)
export const useCitiesForBrand = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_CITIES_FOR_BRAND, {
    variables: { brandId },
    skip: skip || !brandId,
    errorPolicy: "all",
  });
};

// ================== RELATIONSHIP HOOKS ==================

// Hook for getting a city with related brands
export const useCityWithBrands = ({
  input,
  skip = false,
}: {
  input: CityInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CITY_WITH_BRANDS, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting cities with related brands
export const useCitiesWithBrands = ({
  input,
  skip = false,
}: {
  input: CitiesInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CITIES_WITH_BRANDS, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting cities for a brand with brands data
export const useCitiesForBrandWithBrands = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_CITIES_WITH_BRANDS, {
    variables: { input: { filter: { brandsId: [brandId] } } },
    skip: skip || !brandId,
    errorPolicy: "all",
  });
};

// Hook for getting comprehensive city data
export const useCityComprehensive = ({
  input,
  skip = false,
}: {
  input: CityInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CITY_COMPREHENSIVE, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting comprehensive cities data
export const useCitiesComprehensive = ({
  input,
  skip = false,
}: {
  input: CitiesInput;
  skip?: boolean;
}) => {
  return useQuery(GET_CITIES_COMPREHENSIVE, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for city selection with brand context
export const useCitySelection = ({
  brandId,
  preselectedCityId,
}: {
  brandId?: string;
  preselectedCityId?: string;
}) => {
  const {
    data: citiesData,
    loading,
    error,
  } = useCitiesForBrand({
    brandId: brandId || "",
    skip: !brandId,
  });

  const { data: selectedCityData } = useCity({
    input: { id: preselectedCityId || "" },
    skip: !preselectedCityId,
  });

  return {
    cities: citiesData?.cities || [],
    selectedCity: selectedCityData?.city || null,
    loading,
    error,
  };
};

// Hook for city selection with brand context and brands data
export const useCitySelectionWithBrands = ({
  brandId,
  preselectedCityId,
}: {
  brandId?: string;
  preselectedCityId?: string;
}) => {
  const {
    data: citiesData,
    loading,
    error,
  } = useCitiesForBrandWithBrands({
    brandId: brandId || "",
    skip: !brandId,
  });

  const { data: selectedCityData } = useCityWithBrands({
    input: { id: preselectedCityId || "" },
    skip: !preselectedCityId,
  });

  return {
    cities: citiesData?.cities || [],
    selectedCity: selectedCityData?.city || null,
    loading,
    error,
  };
};

// Hook for comprehensive city data fetching
export const useCityDataForApp = ({
  brandId,
  cityId,
}: {
  brandId?: string;
  cityId?: string;
}) => {
  // Get all cities for the brand
  const {
    data: citiesData,
    loading: citiesLoading,
    error: citiesError,
  } = useCitiesForBrand({
    brandId: brandId || "",
    skip: !brandId,
  });

  // Get detailed city data if cityId is provided
  const {
    data: cityData,
    loading: cityLoading,
    error: cityError,
  } = useCityComprehensive({
    input: { id: cityId || "" },
    skip: !cityId,
  });

  return {
    cities: citiesData?.cities || [],
    selectedCity: cityData?.city || null,
    loading: citiesLoading || cityLoading,
    error: citiesError || cityError,
    hasData: !!(citiesData?.cities?.length || cityData?.city),
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const CITY_HOOKS = {
  // Basic query hooks
  useCity,
  useCities,
  useCitiesForBrand,

  // Relationship hooks
  useCityWithBrands,
  useCitiesWithBrands,
  useCitiesForBrandWithBrands,
  useCityComprehensive,
  useCitiesComprehensive,

  // Composite hooks
  useCitySelection,
  useCitySelectionWithBrands,
  useCityDataForApp,
} as const;
