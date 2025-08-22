import { gql } from "@apollo/client";
import { BRAND_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// BRAND MUTATIONS - GraphQL mutations for brand operations
// ====================================================================

// ================== CORE MUTATIONS ==================

// Create electronic menu (brand + point creation)
export const CREATE_ELECTRONIC_MENU = gql`
  mutation CreateElectronicMenu($input: ElectronicMenuCreateInput!) {
    electronicMenuCreate(input: $input) {
      ...BrandDetail
    }
  }
  ${BRAND_DETAIL_FRAGMENT}
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const BRAND_MUTATIONS = {
  CREATE_ELECTRONIC_MENU,
} as const;

// Legacy exports for backward compatibility
export const CREATE_BRAND = CREATE_ELECTRONIC_MENU;
