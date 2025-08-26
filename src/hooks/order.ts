import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useMemo, useCallback } from "react";
import {
  GET_ORDER_DETAIL,
  GET_ORDER_WITH_ITEMS,
  GET_ORDER_STATUS,
  GET_ORDERS_DETAIL,
  GET_ORDERS_LIST,
  GET_USER_ORDER_HISTORY,
  GET_ACTIVE_ORDERS,
} from "../graphql/queries/order";
import {
  CREATE_ORDER_PREORDER_BY_EMPLOYEE,
  UPDATE_ORDER_PREORDER_BY_EMPLOYEE,
  SET_ORDER_STATUS_NEW,
  SET_ORDER_STATUS_ACCEPTED,
  SET_ORDER_STATUS_PREPARED,
  SET_ORDER_STATUS_READY,
  SET_ORDER_STATUS_SUBMITTED,
  SET_ORDER_STATUS_COMPLETE,
  UPDATE_ORDER_COMMENT,
  CLEAR_ORDER_COMMENT,
  UPDATE_ORDER_PERSONS_NUMBER,
  ADD_ORDER_ITEMS,
  UPDATE_ORDER_ITEMS,
  REMOVE_ORDER_ITEMS,
} from "../graphql/mutations/order";
import type {
  OrderInput,
  OrdersInput,
  OrderPreOrderByEmployeeCreateInput,
  OrderPreOrderByEmployeeUpdateInput,
  OrderItemAddInput,
  OrderItemUpdateInput,
  OrdersFilterInput,
} from "../graphql-types";
import { OrderStatus } from "../graphql-types";

// ====================================================================
// ORDER HOOKS - React hooks for order operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting a single order with flexible detail levels
export const useOrder = ({
  input,
  level = "detail",
  skip = false,
  pollInterval,
}: {
  input: OrderInput;
  level?: "detail" | "withItems" | "statusOnly";
  skip?: boolean;
  pollInterval?: number;
}) => {
  const getQuery = () => {
    switch (level) {
      case "withItems":
        return GET_ORDER_WITH_ITEMS;
      case "statusOnly":
        return GET_ORDER_STATUS;
      default:
        return GET_ORDER_DETAIL;
    }
  };

  const queryOptions: any = {
    variables: { input },
    skip,
    errorPolicy: "all",
  };

  if (pollInterval) {
    queryOptions.pollInterval = pollInterval;
    queryOptions.notifyOnNetworkStatusChange = true;
  }

  return useQuery(getQuery(), queryOptions);
};

// Hook for getting orders for an employee with enhanced filtering
export const useOrdersForEmployee = ({
  input,
  includeInactive = false,
  skip = false,
}: {
  input: OrdersInput;
  includeInactive?: boolean;
  skip?: boolean;
}) => {
  const enhancedInput = useMemo(() => {
    if (!includeInactive && input.filter) {
      return {
        ...input,
        filter: {
          ...input.filter,
          statuses: input.filter.statuses || [
            OrderStatus.New,
            OrderStatus.Accepted,
            OrderStatus.Prepared,
            OrderStatus.Ready,
          ],
        },
      };
    }
    return input;
  }, [input, includeInactive]);

  return useQuery(GET_ORDERS_DETAIL, {
    variables: { input: enhancedInput },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting orders for a point with performance optimization
export const useOrdersForPoint = ({
  input,
  useListQuery = false,
  skip = false,
}: {
  input: OrdersInput;
  useListQuery?: boolean;
  skip?: boolean;
}) => {
  const query = useListQuery ? GET_ORDERS_LIST : GET_ORDERS_DETAIL;

  return useQuery(query, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting active orders for real-time dashboard
export const useActiveOrders = ({
  pointId,
  brandId,
  pollInterval = 30000,
  skip = false,
}: {
  pointId: string;
  brandId: string;
  pollInterval?: number;
  skip?: boolean;
}) => {
  return useQuery(GET_ACTIVE_ORDERS, {
    variables: { pointId, brandId },
    skip,
    pollInterval,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

// Hook for getting order history
export const useOrderHistory = ({
  brandId,
  creatorEmployeesId,
  limit = 20,
  offset = 0,
  skip = false,
}: {
  brandId: string;
  creatorEmployeesId: string[];
  limit?: number;
  offset?: number;
  skip?: boolean;
}) => {
  return useQuery(GET_USER_ORDER_HISTORY, {
    variables: { brandId, creatorEmployeesId, limit, offset },
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
        include: [
          "GetOrdersForEmployee",
          "GetOrdersForPoint",
          "GetActiveOrders",
        ],
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
        include: [
          "GetOrdersForEmployee",
          "GetOrdersForPoint",
          "GetActiveOrders",
        ],
      });
    },
    errorPolicy: "all",
  });
};

// ================== STATUS MANAGEMENT HOOKS ==================

// Hook for updating order status with optimistic updates
export const useUpdateOrderStatus = () => {
  const client = useApolloClient();

  const updateStatus = useCallback(
    (status: OrderStatus) => {
      const statusMutations = {
        [OrderStatus.New]: SET_ORDER_STATUS_NEW,
        [OrderStatus.Accepted]: SET_ORDER_STATUS_ACCEPTED,
        [OrderStatus.Prepared]: SET_ORDER_STATUS_PREPARED,
        [OrderStatus.Ready]: SET_ORDER_STATUS_READY,
        [OrderStatus.Submitted]: SET_ORDER_STATUS_SUBMITTED,
        [OrderStatus.Complete]: SET_ORDER_STATUS_COMPLETE,
      };

      const mutation = statusMutations[status];
      if (!mutation) {
        throw new Error(`Unsupported order status: ${status}`);
      }

      return client.mutate({
        mutation,
        errorPolicy: "all",
        optimisticResponse: (variables: any) => ({
          orderPreOrderByEmployeeUpdate: {
            __typename: "Order",
            id: variables.id,
            status,
          },
        }),
        update: (cache, { data }) => {
          if (data?.orderPreOrderByEmployeeUpdate) {
            const orderRef = cache.identify(data.orderPreOrderByEmployeeUpdate);
            if (orderRef) {
              cache.modify({
                id: orderRef,
                fields: {
                  status: () => status,
                },
              });
            }
          }
        },
      });
    },
    [client]
  );

  return { updateStatus };
};

// ================== ORDER ITEM MANAGEMENT HOOKS ==================

// Hook for managing order items (add, update, remove)
export const useOrderItemManagement = () => {
  const client = useApolloClient();

  const addItems = useMutation(ADD_ORDER_ITEMS, {
    update: (cache, { data }) => {
      if (data?.orderPreOrderByEmployeeUpdate) {
        const orderRef = cache.identify(data.orderPreOrderByEmployeeUpdate);
        if (orderRef) {
          cache.modify({
            id: orderRef,
            fields: {
              items: () => data.orderPreOrderByEmployeeUpdate.items,
              priceTotal: () => data.orderPreOrderByEmployeeUpdate.priceTotal,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });

  const updateItems = useMutation(UPDATE_ORDER_ITEMS, {
    update: (cache, { data }) => {
      if (data?.orderPreOrderByEmployeeUpdate) {
        const orderRef = cache.identify(data.orderPreOrderByEmployeeUpdate);
        if (orderRef) {
          cache.modify({
            id: orderRef,
            fields: {
              items: () => data.orderPreOrderByEmployeeUpdate.items,
              priceTotal: () => data.orderPreOrderByEmployeeUpdate.priceTotal,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });

  const removeItems = useMutation(REMOVE_ORDER_ITEMS, {
    update: (cache, { data }) => {
      if (data?.orderPreOrderByEmployeeUpdate) {
        const orderRef = cache.identify(data.orderPreOrderByEmployeeUpdate);
        if (orderRef) {
          cache.modify({
            id: orderRef,
            fields: {
              items: () => data.orderPreOrderByEmployeeUpdate.items,
              priceTotal: () => data.orderPreOrderByEmployeeUpdate.priceTotal,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });

  return {
    addItems,
    updateItems,
    removeItems,
  };
};

// ================== ORDER DETAILS MANAGEMENT HOOKS ==================

// Hook for updating order comment
export const useOrderCommentManagement = () => {
  const client = useApolloClient();

  const updateComment = useMutation(UPDATE_ORDER_COMMENT, {
    optimisticResponse: (variables: any) => ({
      orderPreOrderByEmployeeUpdate: {
        __typename: "Order",
        id: variables.id,
        comment: variables.comment,
      },
    }),
    update: (cache, { data }) => {
      if (data?.orderPreOrderByEmployeeUpdate) {
        const orderRef = cache.identify(data.orderPreOrderByEmployeeUpdate);
        if (orderRef) {
          cache.modify({
            id: orderRef,
            fields: {
              comment: () => data.orderPreOrderByEmployeeUpdate.comment,
            },
          });
        }
      }
    },
    errorPolicy: "all",
  });

  const clearComment = useMutation(CLEAR_ORDER_COMMENT, {
    optimisticResponse: (variables: any) => ({
      orderPreOrderByEmployeeUpdate: {
        __typename: "Order",
        id: variables.id,
        comment: null,
      },
    }),
    errorPolicy: "all",
  });

  return {
    updateComment,
    clearComment,
  };
};

// Hook for updating order persons number
export const useOrderPersonsManagement = () => {
  const updatePersonsNumber = useMutation(UPDATE_ORDER_PERSONS_NUMBER, {
    optimisticResponse: (variables: any) => ({
      orderPreOrderByEmployeeUpdate: {
        __typename: "Order",
        id: variables.id,
        personsNumber: variables.personsNumber,
      },
    }),
    errorPolicy: "all",
  });

  return {
    updatePersonsNumber,
  };
};

// ================== COMPOSITE HOOKS ==================

// Enhanced hook for comprehensive order workflow management
export const useOrderWorkflow = ({
  orderId,
  brandId,
  employeeId,
  pointId,
  pollInterval,
}: {
  orderId: string;
  brandId: string;
  employeeId?: string;
  pointId?: string;
  pollInterval?: number;
}) => {
  const orderQuery = useOrder({
    input: { id: orderId, brandId },
    level: "withItems",
    skip: !orderId || !brandId,
    ...(pollInterval && { pollInterval }),
  });

  const { updateStatus } = useUpdateOrderStatus();
  const { addItems, updateItems, removeItems } = useOrderItemManagement();
  const { updateComment, clearComment } = useOrderCommentManagement();
  const { updatePersonsNumber } = useOrderPersonsManagement();

  // Order state analysis
  const orderState = useMemo(() => {
    const order = orderQuery.data?.order;
    if (!order) return null;

    const canEdit = [OrderStatus.New, OrderStatus.Accepted].includes(
      order.status as OrderStatus
    );
    const canCancel = ![OrderStatus.Complete].includes(
      order.status as OrderStatus
    );
    const canPrepare = order.status === OrderStatus.Accepted;
    const canMarkReady = order.status === OrderStatus.Prepared;
    const canComplete = order.status === OrderStatus.Ready;
    const isActive = [
      OrderStatus.New,
      OrderStatus.Accepted,
      OrderStatus.Prepared,
      OrderStatus.Ready,
    ].includes(order.status as OrderStatus);

    return {
      canEdit,
      canCancel,
      canPrepare,
      canMarkReady,
      canComplete,
      isActive,
      hasItems: order.items && order.items.length > 0,
      totalAmount: order.priceTotal || 0,
      itemCount: order.items?.length || 0,
    };
  }, [orderQuery.data]);

  // Workflow actions
  const workflowActions = useMemo(
    () => ({
      acceptOrder: () => updateStatus(OrderStatus.Accepted),
      startPreparation: () => updateStatus(OrderStatus.Prepared),
      markReady: () => updateStatus(OrderStatus.Ready),
      completeOrder: () => updateStatus(OrderStatus.Complete),
      addItems: (items: OrderItemAddInput[]) =>
        addItems[0]({
          variables: {
            brandId,
            id: orderId,
            itemsAdd: items,
          },
        }),
      updateComment: (comment: string) =>
        updateComment[0]({
          variables: {
            brandId,
            id: orderId,
            comment,
          },
        }),
      clearComment: () =>
        clearComment[0]({
          variables: {
            brandId,
            id: orderId,
          },
        }),
    }),
    [updateStatus, addItems, updateComment, clearComment, orderId, brandId]
  );

  return {
    order: orderQuery.data?.order || null,
    orderState,
    workflowActions,
    loading: orderQuery.loading,
    error: orderQuery.error,
    refetch: orderQuery.refetch,
  };
};

// Hook for employee order dashboard with real-time updates
export const useEmployeeOrderDashboard = ({
  employeeId,
  brandId,
  pointId,
  includeHistory = false,
}: {
  employeeId: string;
  brandId: string;
  pointId?: string;
  includeHistory?: boolean;
}) => {
  const activeOrdersQuery = useOrdersForEmployee({
    input: {
      brandId,
      filter: {
        ...(pointId && { pointsId: [pointId] }),
        statuses: [
          OrderStatus.New,
          OrderStatus.Accepted,
          OrderStatus.Prepared,
          OrderStatus.Ready,
        ],
      },
    },
    skip: !employeeId || !brandId,
  });

  const historyQuery = useOrdersForEmployee({
    input: {
      brandId,
      filter: {
        ...(pointId && { pointsId: [pointId] }),
        statuses: [OrderStatus.Complete],
      },
      // limit: 20,
    },
    skip: !employeeId || !includeHistory || !brandId,
  });

  // Organize orders by status
  const organizedOrders = useMemo(() => {
    const orders = activeOrdersQuery.data?.orders || [];
    return {
      pending: orders.filter((order: any) => order.status === OrderStatus.New),
      accepted: orders.filter(
        (order: any) => order.status === OrderStatus.Accepted
      ),
      inPreparation: orders.filter(
        (order: any) => order.status === OrderStatus.Prepared
      ),
      ready: orders.filter((order: any) => order.status === OrderStatus.Ready),
    };
  }, [activeOrdersQuery.data]);

  // Dashboard statistics
  const statistics = useMemo(() => {
    const orders = activeOrdersQuery.data?.orders || [];
    return {
      totalActive: orders.length,
      totalRevenue: orders.reduce(
        (sum: number, order: any) => sum + (order.priceTotal || 0),
        0
      ),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce(
              (sum: number, order: any) => sum + (order.priceTotal || 0),
              0
            ) / orders.length
          : 0,
      pendingCount: organizedOrders.pending.length,
      readyCount: organizedOrders.ready.length,
    };
  }, [activeOrdersQuery.data, organizedOrders]);

  return {
    organizedOrders,
    orderHistory: historyQuery.data?.orders || [],
    statistics,
    loading: activeOrdersQuery.loading || historyQuery.loading,
    error: activeOrdersQuery.error || historyQuery.error,
    refetch: () => {
      activeOrdersQuery.refetch();
      if (includeHistory) historyQuery.refetch();
    },
  };
};

// Hook for point order management with real-time dashboard
export const usePointOrderManagement = ({
  pointId,
  brandId,
  pollInterval = 30000,
}: {
  pointId: string;
  brandId: string;
  pollInterval?: number;
}) => {
  const activeOrdersQuery = useActiveOrders({
    pointId,
    brandId,
    pollInterval,
    skip: !pointId || !brandId,
  });

  // Order analytics
  const analytics = useMemo(() => {
    const orders = activeOrdersQuery.data?.orders || [];
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const todaysOrders = orders.filter(
      (order: any) => new Date(order.createdTime) >= todayStart
    );

    return {
      totalOrders: orders.length,
      todaysOrders: todaysOrders.length,
      totalRevenue: orders.reduce(
        (sum: number, order: any) => sum + (order.priceTotal || 0),
        0
      ),
      averagePreparationTime: 0, // Would need additional data
      statusDistribution: {
        pending: orders.filter((o: any) => o.status === OrderStatus.New).length,
        accepted: orders.filter((o: any) => o.status === OrderStatus.Accepted)
          .length,
        prepared: orders.filter((o: any) => o.status === OrderStatus.Prepared)
          .length,
        ready: orders.filter((o: any) => o.status === OrderStatus.Ready).length,
      },
    };
  }, [activeOrdersQuery.data]);

  return {
    activeOrders: activeOrdersQuery.data?.orders || [],
    analytics,
    loading: activeOrdersQuery.loading,
    error: activeOrdersQuery.error,
    refetch: activeOrdersQuery.refetch,
  };
};

// Hook for order tracking with real-time updates (enhanced version)
export const useOrderTracking = ({
  orderId,
  brandId,
  pollInterval = 30000,
  trackChanges = false,
}: {
  orderId: string;
  brandId: string;
  pollInterval?: number;
  trackChanges?: boolean;
}) => {
  const orderQuery = useOrder({
    input: { id: orderId, brandId },
    level: "statusOnly",
    skip: !orderId || !brandId,
    pollInterval,
  });

  // Track status changes if requested
  const statusHistory = useMemo(() => {
    if (!trackChanges) return [];
    // This would need to be implemented with a subscription or additional data
    return [];
  }, [trackChanges, orderQuery.data]);

  return {
    order: orderQuery.data?.order,
    statusHistory,
    loading: orderQuery.loading,
    error: orderQuery.error,
    networkStatus: orderQuery.networkStatus,
  };
};

// Legacy hook for backward compatibility
export const useOrderManagement = ({
  employeeId,
  brandId,
  pointId,
  preselectedOrderId,
}: {
  employeeId?: string;
  brandId: string;
  pointId?: string;
  preselectedOrderId?: string;
}) => {
  const {
    data: ordersData,
    loading,
    error,
  } = useOrdersForEmployee({
    input: {
      brandId,
      filter: pointId ? { pointsId: [pointId] } : {},
    },
    skip: !employeeId || !brandId,
  });

  const { data: selectedOrderData } = useOrder({
    input: { id: preselectedOrderId || "", brandId },
    skip: !preselectedOrderId || !brandId,
  });

  return {
    orders: ordersData?.orders || [],
    selectedOrder: selectedOrderData?.order || null,
    loading,
    error,
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const ORDER_HOOKS = {
  // Basic query hooks
  useOrder,
  useOrdersForEmployee,
  useOrdersForPoint,
  useActiveOrders,
  useOrderHistory,

  // Basic mutation hooks
  useCreatePreOrderByEmployee,
  useUpdatePreOrderByEmployee,

  // Status management hooks
  useUpdateOrderStatus,

  // Order item management hooks
  useOrderItemManagement,

  // Order details management hooks
  useOrderCommentManagement,
  useOrderPersonsManagement,

  // Advanced composite hooks
  useOrderWorkflow,
  useEmployeeOrderDashboard,
  usePointOrderManagement,
  useOrderTracking,

  // Legacy compatibility
  useOrderManagement,
} as const;

// ================== DOMAIN-SPECIFIC UTILITIES ==================

// Order status validation utility
export const isValidOrderStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.New]: [OrderStatus.Accepted],
    [OrderStatus.Accepted]: [OrderStatus.Prepared],
    [OrderStatus.Prepared]: [OrderStatus.Ready],
    [OrderStatus.Ready]: [OrderStatus.Complete],
    [OrderStatus.Submitted]: [OrderStatus.Complete],
    [OrderStatus.Complete]: [], // Terminal state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Order priority calculation utility
export const calculateOrderPriority = (order: any): number => {
  let priority = 0;

  // Time-based priority (older orders get higher priority)
  const age = Date.now() - new Date(order.createdTime).getTime();
  priority += Math.floor(age / (1000 * 60 * 5)); // +1 per 5 minutes

  // Status-based priority
  const statusPriority = {
    READY: 100,
    PREPARED: 80,
    ACCEPTED: 60,
    PENDING: 40,
    NEW: 20,
  };
  priority += statusPriority[order.status as keyof typeof statusPriority] || 0;

  // Large order priority
  if (order.priceTotal > 1000) priority += 20;
  if (order.personsNumber > 4) priority += 10;

  return priority;
};

// Order summary utility
export const getOrderSummary = (order: any) => {
  if (!order) return null;

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    total: order.priceTotal || 0,
    itemCount: order.items?.length || 0,
    createdAt: order.createdTime,
    customerInfo: {
      name: order.customerName,
      phone: order.customerPhone,
      personsNumber: order.personsNumber,
    },
    isActive: ["PENDING", "ACCEPTED", "PREPARED", "READY"].includes(
      order.status
    ),
    priority: calculateOrderPriority(order),
  };
};
