import { useQuery } from "@apollo/client";
import { GET_CITIES, GET_CITY_DETAIL } from "../graphql/queries/city";
import type { CityInput, CitiesInput } from "../graphql-types";

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

// Hook for getting cities for a specific brand
export const useCitiesForBrand = ({
  brandId,
  skip = false,
}: {
  brandId: string;
  skip?: boolean;
}) => {
  return useQuery(GET_CITIES, {
    variables: { input: { filter: { brandsId: [brandId] } } },
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

// ================== EXPORTED HOOK COLLECTIONS ==================
export const CITY_HOOKS = {
  // Single city hooks
  useCity,

  // Multiple cities hooks
  useCities,
  useCitiesForBrand,

  // Composite hooks
  useCitySelection,
} as const;
