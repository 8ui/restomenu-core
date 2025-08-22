import { gql } from "@apollo/client";
import {
  ORDER_BASE_FRAGMENT,
  ORDER_DETAIL_FRAGMENT,
  ORDER_WITH_ITEMS_FRAGMENT,
} from "../fragments";

// ====================================================================
// ORDER QUERIES - Standardized GraphQL queries for orders
// ====================================================================

// ================== BASIC QUERIES ==================

// Get single order with minimal fields
export const GET_ORDER_BASE = gql`
  query GetOrderBase($input: OrderInput!) {
    order(input: $input) {
      ...OrderBase
    }
  }
  ${ORDER_BASE_FRAGMENT}
`;

// Get single order with detailed information
export const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($input: OrderInput!) {
    order(input: $input) {
      ...OrderDetail
    }
  }
  ${ORDER_DETAIL_FRAGMENT}
`;

// Get single order with full information including items
export const GET_ORDER_WITH_ITEMS = gql`
  query GetOrderWithItems($input: OrderInput!) {
    order(input: $input) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get orders with minimal fields (for lists)
export const GET_ORDERS_BASE = gql`
  query GetOrdersBase($input: OrdersInput!) {
    orders(input: $input) {
      ...OrderBase
    }
  }
  ${ORDER_BASE_FRAGMENT}
`;

// Get orders with detailed information
export const GET_ORDERS_DETAIL = gql`
  query GetOrdersDetail($input: OrdersInput!) {
    orders(input: $input) {
      ...OrderDetail
    }
  }
  ${ORDER_DETAIL_FRAGMENT}
`;

// Get orders with full information including items
export const GET_ORDERS_WITH_ITEMS = gql`
  query GetOrdersWithItems($input: OrdersInput!) {
    orders(input: $input) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// ================== SPECIALIZED QUERIES ==================

// Get order status only (for polling)
export const GET_ORDER_STATUS = gql`
  query GetOrderStatus($input: OrderInput!) {
    order(input: $input) {
      id
      status
      priceTotal
    }
  }
`;

// Get orders list with minimal data for performance
export const GET_ORDERS_LIST = gql`
  query GetOrdersList($input: OrdersInput!) {
    orders(input: $input) {
      id
      number
      type
      status
      priceTotal
      personsNumber
      items {
        id
        quantity
        product {
          id
          name
        }
      }
    }
  }
`;

// Get user's order history
export const GET_USER_ORDER_HISTORY = gql`
  query GetUserOrderHistory($userId: Uuid!, $limit: Int, $offset: Int) {
    orders(
      input: { filter: { userId: $userId }, limit: $limit, offset: $offset }
    ) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// Get orders by point and date range
export const GET_ORDERS_BY_POINT_AND_DATE = gql`
  query GetOrdersByPointAndDate(
    $pointId: Uuid!
    $startDate: DateTime!
    $endDate: DateTime!
  ) {
    orders(
      input: {
        filter: {
          pointId: $pointId
          createdAt: { gte: $startDate, lte: $endDate }
        }
      }
    ) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// Get active orders for a point
export const GET_ACTIVE_ORDERS = gql`
  query GetActiveOrders($pointId: Uuid!) {
    orders(
      input: {
        filter: { pointId: $pointId, status: [PENDING, IN_PROGRESS, READY] }
      }
    ) {
      ...OrderWithItems
    }
  }
  ${ORDER_WITH_ITEMS_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const ORDER_QUERIES = {
  // Single order queries
  GET_ORDER_BASE,
  GET_ORDER_DETAIL,
  GET_ORDER_WITH_ITEMS,
  GET_ORDER_STATUS,

  // Multiple orders queries
  GET_ORDERS_BASE,
  GET_ORDERS_DETAIL,
  GET_ORDERS_WITH_ITEMS,
  GET_ORDERS_LIST,

  // Specialized queries
  GET_USER_ORDER_HISTORY,
  GET_ORDERS_BY_POINT_AND_DATE,
  GET_ACTIVE_ORDERS,
} as const;

// Legacy exports for backward compatibility
export const GET_ORDER = GET_ORDER_WITH_ITEMS;
export const GET_ORDERS = GET_ORDERS_WITH_ITEMS;
