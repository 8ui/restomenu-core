import { gql } from "@apollo/client";
import { CITY_BASE_FRAGMENT, CITY_DETAIL_FRAGMENT } from "../fragments";

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
    cities(input: { filter: { isActive: true } }) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// Get all cities (including inactive, for admin)
export const GET_ALL_CITIES = gql`
  query GetAllCities {
    cities(input: {}) {
      ...CityDetail
    }
  }
  ${CITY_DETAIL_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const CITY_QUERIES = {
  // Single city queries
  GET_CITY_BASE,
  GET_CITY_DETAIL,

  // Multiple cities queries
  GET_CITIES_BASE,
  GET_CITIES_DETAIL,

  // Specialized queries
  GET_ACTIVE_CITIES,
  GET_ALL_CITIES,
} as const;

// Legacy exports for backward compatibility
export const GET_CITY = GET_CITY_DETAIL;
export const GET_CITIES = GET_CITIES_DETAIL;
