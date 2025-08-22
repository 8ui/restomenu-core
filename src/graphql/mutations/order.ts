import { gql } from "@apollo/client";
import { ORDER_DETAIL_FRAGMENT, ORDER_WITH_ITEMS_FRAGMENT } from "../fragments";

// ====================================================================
// ORDER MUTATIONS - Standardized GraphQL mutations for orders
// ====================================================================

// ================== CREATE MUTATIONS ==================

// Create order with detailed response
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderCreateInput!) {
    orderCreate(input: $input) {
      ...OrderDetail
    }
  }
  ${ORDER_DETAIL_FRAGMENT}
`;

// Create order with full response including items
export const CREATE_ORDER_WITH_ITEMS = gql`
  mutation CreateOrderWithItems($input: OrderCreateInput!) {
    orderCreate(input: $input) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// ================== UPDATE MUTATIONS ==================

// Update order with detailed response
export const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: OrderUpdateInput!) {
    orderUpdate(input: $input) {
      ...OrderDetail
    }
  }
  ${ORDER_DETAIL_FRAGMENT}
`;

// Update order with full response including items
export const UPDATE_ORDER_WITH_ITEMS = gql`
  mutation UpdateOrderWithItems($input: OrderUpdateInput!) {
    orderUpdate(input: $input) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// ================== DELETE MUTATIONS ==================

// Delete order
export const DELETE_ORDER = gql`
  mutation DeleteOrder($input: OrderDeleteInput!) {
    orderDelete(input: $input)
  }
`;

// Cancel order (set status to CANCELLED)
export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: Uuid!, $reason: String) {
    orderUpdate(
      input: { orderId: $orderId, status: CANCELLED, comment: $reason }
    ) {
      id
      status
      comment
    }
  }
`;

// ================== STATUS MUTATIONS ==================

// Update order status
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: Uuid!, $status: OrderStatus!) {
    orderUpdate(input: { orderId: $orderId, status: $status }) {
      id
      status
    }
  }
`;

// Confirm order (set status to CONFIRMED)
export const CONFIRM_ORDER = gql`
  mutation ConfirmOrder($orderId: Uuid!) {
    orderUpdate(input: { orderId: $orderId, status: CONFIRMED }) {
      id
      status
    }
  }
`;

// Start order preparation (set status to IN_PROGRESS)
export const START_ORDER_PREPARATION = gql`
  mutation StartOrderPreparation($orderId: Uuid!) {
    orderUpdate(input: { orderId: $orderId, status: IN_PROGRESS }) {
      id
      status
    }
  }
`;

// Mark order as ready (set status to READY)
export const MARK_ORDER_READY = gql`
  mutation MarkOrderReady($orderId: Uuid!) {
    orderUpdate(input: { orderId: $orderId, status: READY }) {
      id
      status
    }
  }
`;

// Complete order (set status to COMPLETED)
export const COMPLETE_ORDER = gql`
  mutation CompleteOrder($orderId: Uuid!) {
    orderUpdate(input: { orderId: $orderId, status: COMPLETED }) {
      id
      status
    }
  }
`;

// ================== ORDER ITEM MUTATIONS ==================

// Add item to order
export const ADD_ORDER_ITEM = gql`
  mutation AddOrderItem($input: OrderItemCreateInput!) {
    orderItemCreate(input: $input) {
      id
      productId
      price
      quantity
    }
  }
`;

// Update order item
export const UPDATE_ORDER_ITEM = gql`
  mutation UpdateOrderItem($input: OrderItemUpdateInput!) {
    orderItemUpdate(input: $input) {
      id
      productId
      price
      quantity
    }
  }
`;

// Remove item from order
export const REMOVE_ORDER_ITEM = gql`
  mutation RemoveOrderItem($input: OrderItemDeleteInput!) {
    orderItemDelete(input: $input)
  }
`;

// ================== SPECIALIZED MUTATIONS ==================

// Update order comment
export const UPDATE_ORDER_COMMENT = gql`
  mutation UpdateOrderComment($orderId: Uuid!, $comment: String!) {
    orderUpdate(input: { orderId: $orderId, comment: $comment }) {
      id
      comment
    }
  }
`;

// Update order persons number
export const UPDATE_ORDER_PERSONS_NUMBER = gql`
  mutation UpdateOrderPersonsNumber($orderId: Uuid!, $personsNumber: Int!) {
    orderUpdate(input: { orderId: $orderId, personsNumber: $personsNumber }) {
      id
      personsNumber
    }
  }
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const ORDER_MUTATIONS = {
  // Create mutations
  CREATE_ORDER,
  CREATE_ORDER_WITH_ITEMS,

  // Update mutations
  UPDATE_ORDER,
  UPDATE_ORDER_WITH_ITEMS,

  // Delete mutations
  DELETE_ORDER,
  CANCEL_ORDER,

  // Status mutations
  UPDATE_ORDER_STATUS,
  CONFIRM_ORDER,
  START_ORDER_PREPARATION,
  MARK_ORDER_READY,
  COMPLETE_ORDER,

  // Order item mutations
  ADD_ORDER_ITEM,
  UPDATE_ORDER_ITEM,
  REMOVE_ORDER_ITEM,

  // Specialized mutations
  UPDATE_ORDER_COMMENT,
  UPDATE_ORDER_PERSONS_NUMBER,
} as const;
