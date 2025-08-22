import { gql } from "@apollo/client";
import { POINT_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// POINT MUTATIONS - GraphQL mutations for point operations
// ====================================================================

// ================== CORE MUTATIONS ==================

// Create a new point
export const CREATE_POINT = gql`
  mutation CreatePoint($input: PointCreateInput!) {
    pointCreate(input: $input) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// Update an existing point
export const UPDATE_POINT = gql`
  mutation UpdatePoint($input: PointUpdateInput!) {
    pointUpdate(input: $input) {
      ...PointDetail
    }
  }
  ${POINT_DETAIL_FRAGMENT}
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const POINT_MUTATIONS = {
  CREATE_POINT,
  UPDATE_POINT,
} as const;
