import { gql } from "@apollo/client";
import { POINT_BASE_FRAGMENT, POINT_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// POINT QUERIES - Standardized GraphQL queries for points
// ====================================================================

// ================== BASIC QUERIES ==================

// Get single point with minimal fields
export const GET_POINT_BASE = gql`
  query GetPointBase($input: PointInput!) {
    point(input: $input) {
      ...PointBase
    }
  }
  ${POINT_BASE_FRAGMENT}
`;

// Get single point with detailed information
export const GET_POINT_DETAIL = gql`
  query GetPointDetail($input: PointInput!) {
    point(input: $input) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get points with minimal fields (for lists)
export const GET_POINTS_BASE = gql`
  query GetPointsBase($input: PointsInput!) {
    points(input: $input) {
      ...PointBase
    }
  }
  ${POINT_BASE_FRAGMENT}
`;

// Get points with detailed information
export const GET_POINTS_DETAIL = gql`
  query GetPointsDetail($input: PointsInput!) {
    points(input: $input) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// ================== SPECIALIZED QUERIES ==================

// Get active points only
export const GET_ACTIVE_POINTS = gql`
  query GetActivePoints {
    points(input: { filter: { isActive: true } }) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// Get points by brand
export const GET_POINTS_BY_BRAND = gql`
  query GetPointsByBrand($brandId: Uuid!) {
    points(input: { filter: { brandId: $brandId, isActive: true } }) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// Get points by city
export const GET_POINTS_BY_CITY = gql`
  query GetPointsByCity($cityId: Uuid!) {
    points(input: { filter: { cityId: $cityId, isActive: true } }) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// Get points by brand and city
export const GET_POINTS_BY_BRAND_AND_CITY = gql`
  query GetPointsByBrandAndCity($brandId: Uuid!, $cityId: Uuid!) {
    points(
      input: { filter: { brandId: $brandId, cityId: $cityId, isActive: true } }
    ) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const POINT_QUERIES = {
  // Single point queries
  GET_POINT_BASE,
  GET_POINT_DETAIL,

  // Multiple points queries
  GET_POINTS_BASE,
  GET_POINTS_DETAIL,

  // Specialized queries
  GET_ACTIVE_POINTS,
  GET_POINTS_BY_BRAND,
  GET_POINTS_BY_CITY,
  GET_POINTS_BY_BRAND_AND_CITY,
} as const;

// Legacy exports for backward compatibility
export const GET_POINT = GET_POINT_DETAIL;
export const GET_POINTS = GET_POINTS_DETAIL;
