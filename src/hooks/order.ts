import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  GET_ORDER_DETAIL,
  GET_ORDERS_FOR_EMPLOYEE,
  GET_ORDERS_FOR_POINT,
  GET_ORDER_HISTORY,
} from "../graphql/queries/order";
import {
  CREATE_ORDER_PREORDER_BY_EMPLOYEE,
  UPDATE_ORDER_PREORDER_BY_EMPLOYEE,
} from "../graphql/mutations/order";
import type {
  OrderInput,
  OrdersForEmployeeInput,
  OrdersForPointInput,
  OrderHistoryInput,
  OrderPreOrderByEmployeeCreateInput,
  OrderPreOrderByEmployeeUpdateInput,
} from "../graphql-types";

// ====================================================================
// ORDER HOOKS - React hooks for order operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single order
export const useOrder = ({
  input,
  skip = false,
}: {
  input: OrderInput;
  skip?: boolean;
}) => {
  return useQuery(GET_ORDER_DETAIL, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting orders for an employee
export const useOrdersForEmployee = ({
  input,
  skip = false,
}: {
  input: OrdersForEmployeeInput;
  skip?: boolean;
}) => {
  return useQuery(GET_ORDERS_FOR_EMPLOYEE, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting orders for a point
export const useOrdersForPoint = ({
  input,
  skip = false,
}: {
  input: OrdersForPointInput;
  skip?: boolean;
}) => {
  return useQuery(GET_ORDERS_FOR_POINT, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting order history
export const useOrderHistory = ({
  input,
  skip = false,
}: {
  input: OrderHistoryInput;
  skip?: boolean;
}) => {
  return useQuery(GET_ORDER_HISTORY, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for creating a preorder by employee
export const useCreatePreOrderByEmployee = () => {
  const client = useApolloClient();

  return useMutation(CREATE_ORDER_PREORDER_BY_EMPLOYEE, {
    update: () => {
      client.refetchQueries({
        include: ["GetOrdersForEmployee", "GetOrdersForPoint"],
      });
    },
    errorPolicy: "all",
  });
};

// Hook for updating a preorder by employee
export const useUpdatePreOrderByEmployee = () => {
  const client = useApolloClient();

  return useMutation(UPDATE_ORDER_PREORDER_BY_EMPLOYEE, {
    update: (cache, { data }) => {
      if (data?.orderPreOrderByEmployeeUpdate) {
        // Update the cache with the new data
        const updatedOrder = data.orderPreOrderByEmployeeUpdate;
        cache.modify({
          fields: {
            orders(existingOrders = [], { readField }) {
              return existingOrders.map((orderRef: any) => {
                if (readField("id", orderRef) === updatedOrder.id) {
                  return updatedOrder;
                }
                return orderRef;
              });
            },
          },
        });
      }
      client.refetchQueries({
        include: ["GetOrdersForEmployee", "GetOrdersForPoint"],
      });
    },
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for order management with employee context
export const useOrderManagement = ({
  employeeId,
  pointId,
  preselectedOrderId,
}: {
  employeeId?: string;
  pointId?: string;
  preselectedOrderId?: string;
}) => {
  const {
    data: ordersData,
    loading,
    error,
  } = useOrdersForEmployee({
    input: {
      employeeId: employeeId || "",
      filter: pointId ? { pointsId: [pointId] } : {},
    },
    skip: !employeeId,
  });

  const { data: selectedOrderData } = useOrder({
    input: { id: preselectedOrderId || "" },
    skip: !preselectedOrderId,
  });

  return {
    orders: ordersData?.orders || [],
    selectedOrder: selectedOrderData?.order || null,
    loading,
    error,
  };
};

// Hook for order tracking with real-time updates
export const useOrderTracking = ({
  orderId,
  pollInterval = 30000, // 30 seconds
}: {
  orderId: string;
  pollInterval?: number;
}) => {
  return useQuery(GET_ORDER_DETAIL, {
    variables: { input: { id: orderId } },
    pollInterval,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const ORDER_HOOKS = {
  // Single order hooks
  useOrder,

  // Multiple orders hooks
  useOrdersForEmployee,
  useOrdersForPoint,
  useOrderHistory,

  // Mutation hooks
  useCreatePreOrderByEmployee,
  useUpdatePreOrderByEmployee,

  // Composite hooks
  useOrderManagement,
  useOrderTracking,
} as const;
