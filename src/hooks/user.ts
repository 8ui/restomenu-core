import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  GET_USER_PROFILE,
  GET_USER_DETAIL,
  GET_EMPLOYEES,
  GET_EMPLOYEE_DETAIL,
} from "../graphql/queries/user";
import {
  AUTHENTICATE_USER,
  AUTHENTICATE_ANONYMOUS,
  LOGOUT_USER,
  RESTOPLACE_AUTHENTICATION,
  RESTOPLACE_ADDRESS_INTEGRATION,
} from "../graphql/mutations/user";
import type {
  UserInput,
  EmployeeInput,
  EmployeesInput,
  AuthenticationInput,
  RestoplaceAuthenticationInput,
} from "../graphql-types";

// ====================================================================
// USER HOOKS - React hooks for user and authentication operations
// ====================================================================

// ================== QUERY HOOKS ==================

// Hook for getting user profile
export const useUserProfile = ({
  skip = false,
}: {
  skip?: boolean;
} = {}) => {
  return useQuery(GET_USER_PROFILE, {
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting user details
export const useUserDetail = ({
  input,
  skip = false,
}: {
  input: UserInput;
  skip?: boolean;
}) => {
  return useQuery(GET_USER_DETAIL, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting employees
export const useEmployees = ({
  input,
  skip = false,
}: {
  input: EmployeesInput;
  skip?: boolean;
}) => {
  return useQuery(GET_EMPLOYEES, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// Hook for getting employee details
export const useEmployeeDetail = ({
  input,
  skip = false,
}: {
  input: EmployeeInput;
  skip?: boolean;
}) => {
  return useQuery(GET_EMPLOYEE_DETAIL, {
    variables: { input },
    skip,
    errorPolicy: "all",
  });
};

// ================== MUTATION HOOKS ==================

// Hook for user authentication
export const useAuthentication = () => {
  const client = useApolloClient();

  return useMutation(AUTHENTICATE_USER, {
    update: (cache, { data }) => {
      if (data?.authentication) {
        // Update the cache with user data
        cache.writeQuery({
          query: GET_USER_PROFILE,
          data: {
            user: data.authentication,
          },
        });
      }
    },
    errorPolicy: "all",
  });
};

// Hook for anonymous authentication
export const useAnonymousAuthentication = () => {
  const client = useApolloClient();

  return useMutation(AUTHENTICATE_ANONYMOUS, {
    update: (cache, { data }) => {
      if (data?.authenticationAnonymous) {
        // Update the cache with anonymous user data
        cache.writeQuery({
          query: GET_USER_PROFILE,
          data: {
            user: data.authenticationAnonymous,
          },
        });
      }
    },
    errorPolicy: "all",
  });
};

// Hook for user logout
export const useLogout = () => {
  const client = useApolloClient();

  return useMutation(LOGOUT_USER, {
    update: () => {
      // Clear the Apollo cache on logout
      client.clearStore();
    },
    errorPolicy: "all",
  });
};

// Hook for Restoplace authentication
export const useRestoplaceAuthentication = () => {
  const client = useApolloClient();

  return useMutation(RESTOPLACE_AUTHENTICATION, {
    update: (cache, { data }) => {
      if (data?.restoplaceAuthentication) {
        // Update the cache with user data
        cache.writeQuery({
          query: GET_USER_PROFILE,
          data: {
            user: data.restoplaceAuthentication,
          },
        });
      }
    },
    errorPolicy: "all",
  });
};

// Hook for Restoplace address integration
export const useRestoplaceAddressIntegration = () => {
  return useMutation(RESTOPLACE_ADDRESS_INTEGRATION, {
    errorPolicy: "all",
  });
};

// ================== COMPOSITE HOOKS ==================

// Hook for authentication flow management
export const useAuthenticationFlow = () => {
  const { data: userProfile, loading: profileLoading } = useUserProfile();
  const [authenticate, { loading: authLoading }] = useAuthentication();
  const [logout, { loading: logoutLoading }] = useLogout();

  const isAuthenticated = Boolean(userProfile?.user);
  const isLoading = profileLoading || authLoading || logoutLoading;

  const handleLogin = async (credentials: AuthenticationInput) => {
    try {
      const result = await authenticate({ variables: { input: credentials } });
      return result.data?.authentication;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      return true;
    } catch (error) {
      throw error;
    }
  };

  return {
    user: userProfile?.user || null,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };
};

// Hook for employee management with filtering
export const useEmployeeManagement = ({
  accountId,
  brandId,
  pointId,
}: {
  accountId?: string;
  brandId?: string;
  pointId?: string;
}) => {
  const {
    data: employeesData,
    loading,
    error,
  } = useEmployees({
    input: {
      filter: {
        ...(accountId && { accountsId: [accountId] }),
        ...(brandId && { brandsId: [brandId] }),
        ...(pointId && { pointsId: [pointId] }),
        isActive: true,
      },
    },
    skip: !accountId && !brandId && !pointId,
  });

  return {
    employees: employeesData?.employees || [],
    loading,
    error,
  };
};

// ================== EXPORTED HOOK COLLECTIONS ==================
export const USER_HOOKS = {
  // Profile hooks
  useUserProfile,
  useUserDetail,

  // Employee hooks
  useEmployees,
  useEmployeeDetail,

  // Authentication hooks
  useAuthentication,
  useAnonymousAuthentication,
  useLogout,
  useRestoplaceAuthentication,
  useRestoplaceAddressIntegration,

  // Composite hooks
  useAuthenticationFlow,
  useEmployeeManagement,
} as const;
