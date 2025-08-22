import { ApolloClient } from "@apollo/client";
import {
  GET_ME_DETAIL,
  GET_USER_DETAIL,
  GET_USERS_DETAIL,
} from "../graphql/queries/user";
import {
  AUTHENTICATE_USER,
  AUTHENTICATE_ANONYMOUS,
  LOGOUT_USER,
  RESTOPLACE_AUTHENTICATION,
  RESTOPLACE_ADDRESS_INTEGRATION,
} from "../graphql/mutations/user";

// ====================================================================
// USER MANAGER - High-level business logic for user operations
// ====================================================================

export interface UserManagerConfig {
  client: ApolloClient<any>;
  defaultAccountId?: string;
}

export interface EmployeeFilter {
  accountsId?: string[];
  brandsId?: string[];
  pointsId?: string[];
  roles?: string[];
  isActive?: boolean;
}

export interface AuthenticationCredentials {
  login: string;
  password: string;
}

export interface RestoplaceCredentials {
  login: string;
  password: string;
}

export class UserManager {
  private client: ApolloClient<any>;
  private config: UserManagerConfig;

  constructor(config: UserManagerConfig) {
    this.client = config.client;
    this.config = config;
  }

  // ================== HIGH-LEVEL QUERY METHODS ==================

  /**
   * Get current user profile
   */
  async getCurrentUserProfile() {
    try {
      const result = await this.client.query({
        query: GET_ME_DETAIL,
        fetchPolicy: "cache-first",
      });

      return {
        user: result.data.me,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const result = await this.client.query({
        query: GET_USER_DETAIL,
        variables: { input: { id: userId } },
        fetchPolicy: "cache-first",
      });

      return {
        user: result.data.user,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get employees with filtering
   */
  async getEmployees(filters: EmployeeFilter = {}) {
    try {
      // Use the general users query to get employees
      const result = await this.client.query({
        query: GET_USERS_DETAIL,
        variables: { input: { filter: {} } },
        fetchPolicy: "cache-first",
      });

      let users = result.data.users || [];

      // Filter users that have employee records
      let employees: any[] = [];
      users.forEach((user: any) => {
        if (user.employees && user.employees.length > 0) {
          employees = employees.concat(user.employees);
        }
      });

      // Apply client-side filters
      if (filters.accountsId) {
        employees = employees.filter((emp: any) =>
          filters.accountsId!.includes(emp.accountId)
        );
      }
      if (filters.brandsId) {
        employees = employees.filter(
          (emp: any) =>
            emp.brandsId &&
            emp.brandsId.some((brandId: string) =>
              filters.brandsId!.includes(brandId)
            )
        );
      }
      if (filters.pointsId) {
        employees = employees.filter(
          (emp: any) =>
            emp.pointsId &&
            emp.pointsId.some((pointId: string) =>
              filters.pointsId!.includes(pointId)
            )
        );
      }
      if (filters.roles) {
        employees = employees.filter((emp: any) =>
          filters.roles!.includes(emp.role)
        );
      }
      if (filters.isActive !== undefined) {
        employees = employees.filter(
          (emp: any) => emp.isActive === filters.isActive
        );
      }

      return {
        employees,
        total: employees.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        employees: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: string) {
    try {
      // Since there's no direct employee query, we need to get all employees
      // and filter by ID
      const allEmployees = await this.getEmployees();

      if (allEmployees.error) {
        throw allEmployees.error;
      }

      const employee = allEmployees.employees.find(
        (emp: any) => emp.id === employeeId
      );

      return {
        employee: employee || null,
        loading: false,
        error: employee ? null : new Error("Employee not found"),
      };
    } catch (error) {
      return {
        employee: null,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get employees for account
   */
  async getEmployeesForAccount(accountId?: string) {
    const targetAccountId = accountId || this.config.defaultAccountId;

    if (!targetAccountId) {
      throw new Error("accountId is required");
    }

    return this.getEmployees({
      accountsId: [targetAccountId],
      isActive: true,
    });
  }

  /**
   * Get employees for brand
   */
  async getEmployeesForBrand(brandId: string) {
    return this.getEmployees({
      brandsId: [brandId],
      isActive: true,
    });
  }

  /**
   * Get employees for point
   */
  async getEmployeesForPoint(pointId: string) {
    return this.getEmployees({
      pointsId: [pointId],
      isActive: true,
    });
  }

  // ================== HIGH-LEVEL AUTHENTICATION METHODS ==================

  /**
   * Authenticate user with credentials
   */
  async authenticateUser(credentials: AuthenticationCredentials) {
    try {
      const result = await this.client.mutate({
        mutation: AUTHENTICATE_USER,
        variables: { input: credentials },
      });

      if (result.data?.authentication) {
        // Update the cache with user data
        this.client.writeQuery({
          query: GET_ME_DETAIL,
          data: {
            me: result.data.authentication,
          },
        });
      }

      return {
        user: result.data?.authentication,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Authenticate as anonymous user
   */
  async authenticateAnonymous() {
    try {
      const result = await this.client.mutate({
        mutation: AUTHENTICATE_ANONYMOUS,
      });

      if (result.data?.authenticationAnonymous) {
        // Update the cache with anonymous user data
        this.client.writeQuery({
          query: GET_ME_DETAIL,
          data: {
            me: result.data.authenticationAnonymous,
          },
        });
      }

      return {
        user: result.data?.authenticationAnonymous,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Logout user and clear cache
   */
  async logoutUser() {
    try {
      const result = await this.client.mutate({
        mutation: LOGOUT_USER,
      });

      // Clear the Apollo cache on logout
      await this.client.clearStore();

      return {
        success: result.data?.logout || false,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Authenticate with Restoplace
   */
  async authenticateRestoplace(credentials: RestoplaceCredentials) {
    try {
      const result = await this.client.mutate({
        mutation: RESTOPLACE_AUTHENTICATION,
        variables: { input: credentials },
      });

      if (result.data?.restoplaceAuthentication) {
        // Update the cache with user data
        this.client.writeQuery({
          query: GET_ME_DETAIL,
          data: {
            me: result.data.restoplaceAuthentication,
          },
        });
      }

      return {
        user: result.data?.restoplaceAuthentication,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Integrate Restoplace address
   */
  async integrateRestoplaceAddress(credentials: RestoplaceCredentials) {
    try {
      const result = await this.client.mutate({
        mutation: RESTOPLACE_ADDRESS_INTEGRATION,
        variables: { input: credentials },
      });

      return {
        user: result.data?.restoplaceAddressIntegration,
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        error: error as Error,
      };
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const result = await this.getCurrentUserProfile();
      return {
        isAuthenticated: Boolean(result.user),
        user: result.user,
        error: result.error,
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        user: null,
        error: error as Error,
      };
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId?: string) {
    try {
      let user;

      if (userId) {
        const result = await this.getUserById(userId);
        user = result.user;
      } else {
        const result = await this.getCurrentUserProfile();
        user = result.user;
      }

      if (!user) {
        return { permissions: [], error: "User not found" };
      }

      // Extract permissions from user data
      const permissions = this.extractPermissionsFromUser(user);

      return {
        permissions,
        error: null,
      };
    } catch (error) {
      return {
        permissions: [],
        error: error as Error,
      };
    }
  }

  /**
   * Get employee summary with access info
   */
  async getEmployeeSummary(employeeId: string) {
    try {
      const employeeResult = await this.getEmployeeById(employeeId);

      if (employeeResult.error) {
        throw employeeResult.error;
      }

      const employee = employeeResult.employee;

      return {
        summary: {
          employee,
          stats: {
            brandsCount: employee?.brandsId?.length || 0,
            pointsCount: employee?.pointsId?.length || 0,
            role: employee?.role,
            isActive: employee?.isActive || false,
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
   * Search employees by name
   */
  async searchEmployeesByName(
    searchTerm: string,
    filters: EmployeeFilter = {}
  ) {
    try {
      const result = await this.getEmployees(filters);

      if (result.error) {
        return result;
      }

      const filteredEmployees = result.employees.filter((employee: any) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        employees: filteredEmployees,
        total: filteredEmployees.length,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        employees: [],
        total: 0,
        loading: false,
        error: error as Error,
      };
    }
  }

  /**
   * Validate credentials before authentication
   */
  validateCredentials(
    credentials: AuthenticationCredentials | RestoplaceCredentials
  ) {
    const errors: string[] = [];

    if (!credentials.login || credentials.login.trim().length < 3) {
      errors.push("Login must be at least 3 characters long");
    }

    if (!credentials.password || credentials.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ================== PRIVATE HELPER METHODS ==================

  private extractPermissionsFromUser(user: any): string[] {
    const permissions: string[] = [];

    // Extract permissions based on user roles and data
    if (user.role === "ADMIN") {
      permissions.push("admin:full_access");
    }

    if (user.employees?.length > 0) {
      permissions.push("employee:manage");
    }

    // Add more permission logic based on your business rules

    return permissions;
  }
}

// ================== FACTORY FUNCTION ==================

export class UserManagerFactory {
  static create(config: UserManagerConfig): UserManager {
    return new UserManager(config);
  }

  static createWithDefaults(
    client: ApolloClient<any>,
    defaultAccountId?: string
  ): UserManager {
    const config: UserManagerConfig = { client };
    if (defaultAccountId !== undefined) {
      config.defaultAccountId = defaultAccountId;
    }
    return new UserManager(config);
  }
}
