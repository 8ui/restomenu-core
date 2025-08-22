import { gql } from "@apollo/client";

// ====================================================================
// ORDER MUTATIONS - Standardized GraphQL mutations for orders (Schema-compliant)
// ====================================================================

// ================== PRE-ORDER MUTATIONS (Employee) ==================

// Create pre-order by employee (matches schema: orderPreOrderByEmployeeCreate)
export const CREATE_ORDER_PREORDER_BY_EMPLOYEE = gql`
  mutation CreateOrderPreOrderByEmployee(
    $input: OrderPreOrderByEmployeeCreateInput!
  ) {
    orderPreOrderByEmployeeCreate(input: $input) {
      id
      pointId
      number
      type
      status
      comment
      priceTotal
      personsNumber
      items {
        id
        productId
        price
        quantity
        name
        productVariantProperties {
          productVariantPropertyId
          productVariantPropertyName
          productVariantPropertyValueId
          productVariantPropertyValueName
        }
        categories {
          categoryId
          categoryName
        }
        imageUrl
      }
      brandId
      creatorType
      creatorId
      dueTime
      createdTime
      restoplaceReserveId
      customerId
      customerName
      customerPhone
    }
  }
`;

// Update pre-order by employee (matches schema: orderPreOrderByEmployeeUpdate)
export const UPDATE_ORDER_PREORDER_BY_EMPLOYEE = gql`
  mutation UpdateOrderPreOrderByEmployee(
    $input: OrderPreOrderByEmployeeUpdateInput!
  ) {
    orderPreOrderByEmployeeUpdate(input: $input) {
      id
      pointId
      number
      type
      status
      comment
      priceTotal
      personsNumber
      items {
        id
        productId
        price
        quantity
        name
        productVariantProperties {
          productVariantPropertyId
          productVariantPropertyName
          productVariantPropertyValueId
          productVariantPropertyValueName
        }
        categories {
          categoryId
          categoryName
        }
        imageUrl
      }
      brandId
      creatorType
      creatorId
      dueTime
      createdTime
      restoplaceReserveId
      customerId
      customerName
      customerPhone
    }
  }
`;

// ================== STATUS UPDATE MUTATIONS ==================

// Update order status to NEW
export const SET_ORDER_STATUS_NEW = gql`
  mutation SetOrderStatusNew($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, status: NEW }
    ) {
      id
      status
    }
  }
`;

// Update order status to ACCEPTED
export const SET_ORDER_STATUS_ACCEPTED = gql`
  mutation SetOrderStatusAccepted($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, status: ACCEPTED }
    ) {
      id
      status
    }
  }
`;

// Update order status to PREPARED
export const SET_ORDER_STATUS_PREPARED = gql`
  mutation SetOrderStatusPrepared($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, status: PREPARED }
    ) {
      id
      status
    }
  }
`;

// Update order status to READY
export const SET_ORDER_STATUS_READY = gql`
  mutation SetOrderStatusReady($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, status: READY }
    ) {
      id
      status
    }
  }
`;

// Update order status to SUBMITTED
export const SET_ORDER_STATUS_SUBMITTED = gql`
  mutation SetOrderStatusSubmitted($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, status: SUBMITTED }
    ) {
      id
      status
    }
  }
`;

// Update order status to COMPLETE
export const SET_ORDER_STATUS_COMPLETE = gql`
  mutation SetOrderStatusComplete($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, status: COMPLETE }
    ) {
      id
      status
    }
  }
`;

// ================== SPECIALIZED UPDATE MUTATIONS ==================

// Update order comment
export const UPDATE_ORDER_COMMENT = gql`
  mutation UpdateOrderComment($brandId: Uuid!, $id: Uuid!, $comment: String!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, comment: $comment }
    ) {
      id
      comment
    }
  }
`;

// Clear order comment
export const CLEAR_ORDER_COMMENT = gql`
  mutation ClearOrderComment($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, isCommentClear: true }
    ) {
      id
      comment
    }
  }
`;

// Update order persons number
export const UPDATE_ORDER_PERSONS_NUMBER = gql`
  mutation UpdateOrderPersonsNumber(
    $brandId: Uuid!
    $id: Uuid!
    $personsNumber: Int!
  ) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, personsNumber: $personsNumber }
    ) {
      id
      personsNumber
    }
  }
`;

// Clear order persons number
export const CLEAR_ORDER_PERSONS_NUMBER = gql`
  mutation ClearOrderPersonsNumber($brandId: Uuid!, $id: Uuid!) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, isPersonsNumberClear: true }
    ) {
      id
      personsNumber
    }
  }
`;

// ================== ORDER ITEM MUTATIONS ==================

// Add items to order
export const ADD_ORDER_ITEMS = gql`
  mutation AddOrderItems(
    $brandId: Uuid!
    $id: Uuid!
    $itemsAdd: [OrderItemAddInput!]!
  ) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, itemsAdd: $itemsAdd }
    ) {
      id
      items {
        id
        productId
        price
        quantity
        name
      }
      priceTotal
    }
  }
`;

// Update order items
export const UPDATE_ORDER_ITEMS = gql`
  mutation UpdateOrderItems(
    $brandId: Uuid!
    $id: Uuid!
    $itemsUpdate: [OrderItemUpdateInput!]!
  ) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, itemsUpdate: $itemsUpdate }
    ) {
      id
      items {
        id
        productId
        price
        quantity
        name
      }
      priceTotal
    }
  }
`;

// Remove order items
export const REMOVE_ORDER_ITEMS = gql`
  mutation RemoveOrderItems(
    $brandId: Uuid!
    $id: Uuid!
    $itemsRemove: [Uuid!]!
  ) {
    orderPreOrderByEmployeeUpdate(
      input: { brandId: $brandId, id: $id, itemsRemove: $itemsRemove }
    ) {
      id
      items {
        id
        productId
        price
        quantity
        name
      }
      priceTotal
    }
  }
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const ORDER_MUTATIONS = {
  // Pre-order mutations (Employee)
  CREATE_ORDER_PREORDER_BY_EMPLOYEE,
  UPDATE_ORDER_PREORDER_BY_EMPLOYEE,

  // Status mutations
  SET_ORDER_STATUS_NEW,
  SET_ORDER_STATUS_ACCEPTED,
  SET_ORDER_STATUS_PREPARED,
  SET_ORDER_STATUS_READY,
  SET_ORDER_STATUS_SUBMITTED,
  SET_ORDER_STATUS_COMPLETE,

  // Specialized update mutations
  UPDATE_ORDER_COMMENT,
  CLEAR_ORDER_COMMENT,
  UPDATE_ORDER_PERSONS_NUMBER,
  CLEAR_ORDER_PERSONS_NUMBER,

  // Order item mutations
  ADD_ORDER_ITEMS,
  UPDATE_ORDER_ITEMS,
  REMOVE_ORDER_ITEMS,
} as const;

// ================== LEGACY ALIASES FOR BACKWARDS COMPATIBILITY ==================

// Aliases for existing code that might use these names
export const CREATE_ORDER = CREATE_ORDER_PREORDER_BY_EMPLOYEE;
export const UPDATE_ORDER = UPDATE_ORDER_PREORDER_BY_EMPLOYEE;
export const CONFIRM_ORDER = SET_ORDER_STATUS_ACCEPTED;
export const START_ORDER_PREPARATION = SET_ORDER_STATUS_PREPARED;
export const MARK_ORDER_READY = SET_ORDER_STATUS_READY;
export const COMPLETE_ORDER = SET_ORDER_STATUS_COMPLETE;
export const ADD_ORDER_ITEM = ADD_ORDER_ITEMS;
export const UPDATE_ORDER_ITEM = UPDATE_ORDER_ITEMS;
export const REMOVE_ORDER_ITEM = REMOVE_ORDER_ITEMS;
