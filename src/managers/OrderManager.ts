import { ApolloClient } from "@apollo/client";
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

// ====================================================================
// ORDER MANAGER - High-level business logic for order operations
// ====================================================================

export interface OrderManagerConfig {
  client: ApolloClient<any>;
  defaultEmployeeId?: string;
  defaultPointId?: string;
  defaultBrandId?: string;
}

export interface OrderFilter {
  pointsId?: string[];
  brandsId?: string[];
  employeeId?: string;
  status?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface CreatePreOrderInput {
  pointId: string;
  brandId: string;
  customerPhone?: string;
  customerName?: string;
  orderType: "DELIVERY" | "PICKUP";
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    note?: string;
  }>;
  totalAmount: number;
  scheduledTime?: string;
  notes?: string;
}

export interface UpdatePreOrderInput {
  id: string;
  pointId: string;
  brandId: string;
  customerPhone?: string;
  customerName?: string;
  orderType?: "DELIVERY" | "PICKUP";
  items?: Array<{
    productId: string;
    quantity: number;
    price: number;
    note?: string;
  }>;
  totalAmount?: number;
  scheduledTime?: string;
  notes?: string;
  status?: string;
}

export class OrderManager {
  private client: ApolloClient<any>;
  private config: OrderManagerConfig;

  constructor(config: OrderManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get order by ID with caching
   */
  async getById(orderId: string) {
    try {
      const result = await this.client.query({
        query: GET_ORDER_DETAIL,
        variables: { input: { id: orderId } },
        fetchPolicy: "cache-first",
      });

      return {
        order: result.data.order,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        order: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get orders for an employee with filtering
   */
  async getOrdersForEmployee(employeeId?: string, filters: OrderFilter = {}) {
    const targetEmployeeId = employeeId || this.config.defaultEmployeeId;

    if (!targetEmployeeId) {
      throw new Error("employeeId is required");
    }

    try {
      const filterInput = {
        employeeId: targetEmployeeId,
        filter: {
          ...(filters.pointsId && { pointsId: filters.pointsId }),
          ...(filters.brandsId && { brandsId: filters.brandsId }),
          ...(filters.status && { status: filters.status }),
          ...(filters.dateRange && { dateRange: filters.dateRange }),
        },
      };

      const result = await this.client.query({
        query: GET_ORDERS_FOR_EMPLOYEE,
        variables: { input: filterInput },
        fetchPolicy: "cache-first",
      });

      return {
        orders: result.data.orders || [],
        total: result.data.orders?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        orders: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get orders for a point
   */
  async getOrdersForPoint(pointId?: string, filters: OrderFilter = {}) {
    const targetPointId = pointId || this.config.defaultPointId;

    if (!targetPointId) {
      throw new Error("pointId is required");
    }

    try {
      const filterInput = {
        pointId: targetPointId,
        filter: {
          ...(filters.brandsId && { brandsId: filters.brandsId }),
          ...(filters.employeeId && { employeeId: filters.employeeId }),
          ...(filters.status && { status: filters.status }),
          ...(filters.dateRange && { dateRange: filters.dateRange }),
        },
      };

      const result = await this.client.query({
        query: GET_ORDERS_FOR_POINT,
        variables: { input: filterInput },
        fetchPolicy: "cache-first",
      });

      return {
        orders: result.data.orders || [],
        total: result.data.orders?.length || 0,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        orders: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get order history with pagination
   */
  async getOrderHistory(
    filters: OrderFilter & { limit?: number; offset?: number } = {}
  ) {
    try {
      const filterInput = {
        filter: {
          ...(filters.pointsId && { pointsId: filters.pointsId }),
          ...(filters.brandsId && { brandsId: filters.brandsId }),
          ...(filters.employeeId && { employeeId: filters.employeeId }),
          ...(filters.status && { status: filters.status }),
          ...(filters.dateRange && { dateRange: filters.dateRange }),
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      };

      const result = await this.client.query({
        query: GET_ORDER_HISTORY,
        variables: { input: filterInput },
        fetchPolicy: "cache-first",
      });

      return {
        orders: result.data.orders || [],
        total: result.data.total || 0,
        hasMore: result.data.orders?.length === (filters.limit || 50),
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        orders: [],
        total: 0,
        hasMore: false,
        loading: false,
        error: error as Error,
      };
    }
  }

  // ================== HIGH-LEVEL MUTATION METHODS ==================

  /**
   * Create a preorder by employee
   */
  async createPreOrder(input: CreatePreOrderInput) {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_ORDER_PREORDER_BY_EMPLOYEE,
        variables: { input },
      });

      return {
        order: result.data?.orderPreOrderByEmployeeCreate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        order: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Update a preorder by employee
   */
  async updatePreOrder(input: UpdatePreOrderInput) {
    try {
      const result = await this.client.mutate({
        mutation: UPDATE_ORDER_PREORDER_BY_EMPLOYEE,
        variables: { input },
      });

      return {
        order: result.data?.orderPreOrderByEmployeeUpdate,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        order: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const orderResult = await this.getById(orderId);

      if (orderResult.error || !orderResult.order) {
        throw new Error("Order not found");
      }

      const order = orderResult.order;

      const result = await this.updatePreOrder({
        id: orderId,
        pointId: order.pointId,
        brandId: order.brandId,
        status,
      });

      return result;
    } catch (error) {
      return {
        order: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Get order summary with statistics
   */
  async getOrderSummary(orderId: string) {
    try {
      const orderResult = await this.getById(orderId);

      if (orderResult.error) {
        throw orderResult.error;
      }

      const order = orderResult.order;

      return {
        summary: {
          order,
          stats: {
            itemsCount: order?.items?.length || 0,
            totalAmount: order?.totalAmount || 0,
            status: order?.status,
            orderType: order?.orderType,
            createdAt: order?.createdAt,
          },
        },
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        summary: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Calculate order totals
   */
  calculateOrderTotals(items: Array<{ quantity: number; price: number }>) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    return {
      subtotal,
      tax: subtotal * 0.1, // 10% tax (adjust as needed)
      total: subtotal * 1.1,
      itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  /**
   * Validate order data before operations
   */
  validateOrderData(data: Partial<CreatePreOrderInput | UpdatePreOrderInput>) {
    const errors: string[] = [];

    if ("pointId" in data && !data.pointId) {
      errors.push("Point ID is required");
    }

    if ("brandId" in data && !data.brandId) {
      errors.push("Brand ID is required");
    }

    if ("items" in data && data.items) {
      if (data.items.length === 0) {
        errors.push("At least one item is required");
      } else {
        data.items.forEach((item, index) => {
          if (!item.productId) {
            errors.push(`Item ${index + 1}: Product ID is required`);
          }
          if (item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
          }
          if (item.price <= 0) {
            errors.push(`Item ${index + 1}: Price must be greater than 0`);
          }
        });
      }
    }

    if (
      "totalAmount" in data &&
      data.totalAmount !== undefined &&
      data.totalAmount <= 0
    ) {
      errors.push("Total amount must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get order status flow
   */
  getOrderStatusFlow() {
    return {
      statuses: [
        { value: "PENDING", label: "Pending", color: "orange" },
        { value: "CONFIRMED", label: "Confirmed", color: "blue" },
        { value: "PREPARING", label: "Preparing", color: "yellow" },
        { value: "READY", label: "Ready", color: "green" },
        { value: "DELIVERED", label: "Delivered", color: "green" },
        { value: "CANCELLED", label: "Cancelled", color: "red" },
      ],
      transitions: {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PREPARING", "CANCELLED"],
        PREPARING: ["READY", "CANCELLED"],
        READY: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: [],
      },
    };
  }
}

// ================== FACTORY FUNCTION ==================

export class OrderManagerFactory {
  static create(config: OrderManagerConfig): OrderManager {
    return new OrderManager(config);
  }

  static createWithDefaults(
    client: ApolloClient<any>,
    defaultEmployeeId?: string,
    defaultPointId?: string,
    defaultBrandId?: string
  ): OrderManager {
    return new OrderManager({
      client,
      defaultEmployeeId,
      defaultPointId,
      defaultBrandId,
    });
  }
}
