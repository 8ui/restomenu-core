import { gql } from "@apollo/client";
import {
  CITY_BASE_FRAGMENT,
  CITY_DETAIL_FRAGMENT,
  CITY_WITH_BRANDS_FRAGMENT,
  CITY_WITH_POINTS_FRAGMENT,
  CITY_COMPREHENSIVE_FRAGMENT,
} from "../fragments";

// ====================================================================
// CITY QUERIES - Standardized GraphQL queries for cities
// ====================================================================

// ================== BASIC QUERIES ==================

// Get single city with minimal fields
export const GET_CITY_BASE = gql`
  query GetCityBase($input: CityInput!) {
    city(input: $input) {
      ...CityBase
    }
  }
  ${CITY_BASE_FRAGMENT}
`;

// Get single city with detailed information
export const GET_CITY_DETAIL = gql`
  query GetCityDetail($input: CityInput!) {
    city(input: $input) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get cities with minimal fields (for lists)
export const GET_CITIES_BASE = gql`
  query GetCitiesBase($input: CitiesInput!) {
    cities(input: $input) {
      ...CityBase
    }
  }
  ${CITY_BASE_FRAGMENT}
`;

// Get cities with detailed information
export const GET_CITIES_DETAIL = gql`
  query GetCitiesDetail($input: CitiesInput!) {
    cities(input: $input) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// ================== SPECIALIZED QUERIES ==================

// Get active cities only
export const GET_ACTIVE_CITIES = gql`
  query GetActiveCities {
    cities(input: { filter: {} }) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// Get all cities (including inactive, for admin)
export const GET_ALL_CITIES = gql`
  query GetAllCities {
    cities(input: { filter: {} }) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// ================== RELATIONSHIP QUERIES ==================

// Get city with related brands
export const GET_CITY_WITH_BRANDS = gql`
  query GetCityWithBrands($input: CityInput!) {
    city(input: $input) {
      ...CityWithBrands
    }
  }
  ${CITY_WITH_BRANDS_FRAGMENT}
`;

// Get cities with related brands
export const GET_CITIES_WITH_BRANDS = gql`
  query GetCitiesWithBrands($input: CitiesInput!) {
    cities(input: $input) {
      ...CityWithBrands
    }
  }
  ${CITY_WITH_BRANDS_FRAGMENT}
`;

// Get city with points for specific brand
export const GET_CITY_WITH_POINTS = gql`
  query GetCityWithPoints(
    $input: CityInput!
    $pointsInput: PointsForCityInput!
  ) {
    city(input: $input) {
      ...CityWithPoints
    }
  }
  ${CITY_WITH_POINTS_FRAGMENT}
`;

// Get cities for specific brand (most common use case)
export const GET_CITIES_FOR_BRAND = gql`
  query GetCitiesForBrand($brandId: Uuid!) {
    cities(input: { filter: { brandsId: [$brandId] } }) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// Get cities for specific brand with brands data
export const GET_CITIES_FOR_BRAND_WITH_BRANDS = gql`
  query GetCitiesForBrandWithBrands($brandId: Uuid!) {
    cities(input: { filter: { brandsId: [$brandId] } }) {
      ...CityWithBrands
    }
  }
  ${CITY_WITH_BRANDS_FRAGMENT}
`;

// Get comprehensive city data (with brands)
export const GET_CITY_COMPREHENSIVE = gql`
  query GetCityComprehensive($input: CityInput!) {
    city(input: $input) {
      ...CityComprehensive
    }
  }
  ${CITY_COMPREHENSIVE_FRAGMENT}
`;

// Get comprehensive cities data
export const GET_CITIES_COMPREHENSIVE = gql`
  query GetCitiesComprehensive($input: CitiesInput!) {
    cities(input: $input) {
      ...CityComprehensive
    }
  }
  ${CITY_COMPREHENSIVE_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const CITY_QUERIES = {
  // Single city queries
  GET_CITY_BASE,
  GET_CITY_DETAIL,
  GET_CITY_WITH_BRANDS,
  GET_CITY_WITH_POINTS,
  GET_CITY_COMPREHENSIVE,

  // Multiple cities queries
  GET_CITIES_BASE,
  GET_CITIES_DETAIL,
  GET_CITIES_WITH_BRANDS,
  GET_CITIES_COMPREHENSIVE,

  // Specialized queries
  GET_ACTIVE_CITIES,
  GET_ALL_CITIES,
  GET_CITIES_FOR_BRAND,
  GET_CITIES_FOR_BRAND_WITH_BRANDS,
} as const;

// Legacy exports for backward compatibility
export const GET_CITY = GET_CITY_DETAIL;
export const GET_CITIES = GET_CITIES_DETAIL;
