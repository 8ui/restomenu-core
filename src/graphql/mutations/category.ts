import { gql } from "@apollo/client";
import { CATEGORY_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// CATEGORY MUTATIONS - Standardized GraphQL mutations for categories
// ====================================================================

// ================== CREATE MUTATIONS ==================

// Create category
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryCreateInput!) {
    categoryCreate(input: $input) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// ================== UPDATE MUTATIONS ==================

// Update category
export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: CategoryUpdateInput!) {
    categoryUpdate(input: $input) {
      ...CategoryDetail
    }
  }
  ${CATEGORY_DETAIL_FRAGMENT}
`;

// ================== DELETE MUTATIONS ==================

// Delete category
export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($input: CategoryDeleteInput!) {
    categoryDelete(input: $input)
  }
`;

// ================== SPECIALIZED MUTATIONS ==================

// Toggle category active status
export const TOGGLE_CATEGORY_ACTIVE = gql`
  mutation ToggleCategoryActive(
    $brandId: Uuid!
    $id: Uuid!
    $isActive: Boolean!
  ) {
    categoryUpdate(input: { brandId: $brandId, id: $id, isActive: $isActive }) {
      id
      isActive
    }
  }
`;

// Update category position
export const UPDATE_CATEGORY_POSITION = gql`
  mutation UpdateCategoryPosition(
    $brandId: Uuid!
    $id: Uuid!
    $positionAnchor: Uuid
    $positionAnchorNearType: NearType
    $positionEndOfList: EndOfList
  ) {
    categoryUpdate(
      input: {
        brandId: $brandId
        id: $id
        positionAnchor: $positionAnchor
        positionAnchorNearType: $positionAnchorNearType
        positionEndOfList: $positionEndOfList
      }
    ) {
      id
      priority
    }
  }
`;

// Update category parent
export const UPDATE_CATEGORY_PARENT = gql`
  mutation UpdateCategoryParent(
    $brandId: Uuid!
    $id: Uuid!
    $parentId: Uuid
    $isParentIdRemove: Boolean
  ) {
    categoryUpdate(
      input: {
        brandId: $brandId
        id: $id
        parentId: $parentId
        isParentIdRemove: $isParentIdRemove
      }
    ) {
      id
      parentId
    }
  }
`;

// Update category image
export const UPDATE_CATEGORY_IMAGE = gql`
  mutation UpdateCategoryImage(
    $brandId: Uuid!
    $id: Uuid!
    $imageUpload: Upload
    $isImageRemove: Boolean
  ) {
    categoryUpdate(
      input: {
        brandId: $brandId
        id: $id
        imageUpload: $imageUpload
        isImageRemove: $isImageRemove
      }
    ) {
      id
      imageUrl
    }
  }
`;

// Update category point binds
export const UPDATE_CATEGORY_POINT_BINDS = gql`
  mutation UpdateCategoryPointBinds(
    $brandId: Uuid!
    $id: Uuid!
    $pointBinds: [CategoryPointBindInput!]!
  ) {
    categoryUpdate(
      input: { brandId: $brandId, id: $id, pointBinds: $pointBinds }
    ) {
      id
      pointBinds {
        categoryId
        pointId
        orderType
      }
    }
  }
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const CATEGORY_MUTATIONS = {
  // Create mutations
  CREATE_CATEGORY,

  // Update mutations
  UPDATE_CATEGORY,

  // Delete mutations
  DELETE_CATEGORY,

  // Specialized mutations
  TOGGLE_CATEGORY_ACTIVE,
  UPDATE_CATEGORY_POSITION,
  UPDATE_CATEGORY_PARENT,
  UPDATE_CATEGORY_IMAGE,
  UPDATE_CATEGORY_POINT_BINDS,
} as const;
