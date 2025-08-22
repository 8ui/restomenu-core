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
    $categoryId: Uuid!
    $brandId: Uuid!
    $isActive: Boolean!
  ) {
    categoryUpdate(
      input: { categoryId: $categoryId, brandId: $brandId, isActive: $isActive }
    ) {
      id
      isActive
    }
  }
`;

// Update category priority
export const UPDATE_CATEGORY_PRIORITY = gql`
  mutation UpdateCategoryPriority(
    $categoryId: Uuid!
    $brandId: Uuid!
    $priority: Int!
  ) {
    categoryUpdate(
      input: { categoryId: $categoryId, brandId: $brandId, priority: $priority }
    ) {
      id
      priority
    }
  }
`;

// Update category parent
export const UPDATE_CATEGORY_PARENT = gql`
  mutation UpdateCategoryParent(
    $categoryId: Uuid!
    $brandId: Uuid!
    $parentId: Uuid
  ) {
    categoryUpdate(
      input: { categoryId: $categoryId, brandId: $brandId, parentId: $parentId }
    ) {
      id
      parentId
    }
  }
`;

// Update category image
export const UPDATE_CATEGORY_IMAGE = gql`
  mutation UpdateCategoryImage(
    $categoryId: Uuid!
    $brandId: Uuid!
    $imageUrl: String
  ) {
    categoryUpdate(
      input: { categoryId: $categoryId, brandId: $brandId, imageUrl: $imageUrl }
    ) {
      id
      imageUrl
    }
  }
`;

// ================== BATCH MUTATIONS ==================

// Batch update categories (if supported by schema)
export const BATCH_UPDATE_CATEGORIES = gql`
  mutation BatchUpdateCategories($inputs: [CategoryUpdateInput!]!) {
    categoryBatchUpdate(inputs: $inputs) {
      id
      priority
      isActive
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
  UPDATE_CATEGORY_PRIORITY,
  UPDATE_CATEGORY_PARENT,
  UPDATE_CATEGORY_IMAGE,

  // Batch mutations
  BATCH_UPDATE_CATEGORIES,
} as const;
