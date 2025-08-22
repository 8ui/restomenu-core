import { gql } from "@apollo/client";

// ====================================================================
// USER MUTATIONS - Standardized GraphQL mutations for users (Schema-compliant)
// ====================================================================

// ================== AUTHENTICATION MUTATIONS ==================

// User authentication (login) - matches schema: authentication
export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($input: AuthenticationInput!) {
    authentication(input: $input) {
      id
      login
      name
      email
      phone
      employees {
        id
        userId
        accountId
        role
        name
        brandsId
        pointsId
        isActive
      }
    }
  }
`;

// Anonymous authentication - matches schema: authenticationAnonymous
export const AUTHENTICATE_ANONYMOUS = gql`
  mutation AuthenticateAnonymous {
    authenticationAnonymous {
      id
    }
  }
`;

// User logout - matches schema: logout
export const LOGOUT_USER = gql`
  mutation LogoutUser {
    logout
  }
`;

// Restoplace authentication - matches schema: restoplaceAuthentication
export const RESTOPLACE_AUTHENTICATION = gql`
  mutation RestoplaceAuthentication($input: RestoplaceAuthenticationInput!) {
    restoplaceAuthentication(input: $input) {
      id
      login
      name
      email
      phone
      employees {
        id
        userId
        accountId
        role
        name
        brandsId
        pointsId
        isActive
      }
    }
  }
`;

// Restoplace address integration - matches schema: restoplaceAddressIntegration
export const RESTOPLACE_ADDRESS_INTEGRATION = gql`
  mutation RestoplaceAddressIntegration(
    $input: RestoplaceAuthenticationInput!
  ) {
    restoplaceAddressIntegration(input: $input) {
      id
      login
      name
      email
      phone
      employees {
        id
        userId
        accountId
        role
        name
        brandsId
        pointsId
        isActive
      }
    }
  }
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const USER_MUTATIONS = {
  // Authentication mutations (schema-compliant)
  AUTHENTICATE_USER,
  AUTHENTICATE_ANONYMOUS,
  LOGOUT_USER,
  RESTOPLACE_AUTHENTICATION,
  RESTOPLACE_ADDRESS_INTEGRATION,

  // Profile mutations (not supported in current schema)
  // UPDATE_USER_PROFILE,
  // CHANGE_USER_PASSWORD,
  // UPDATE_USER_EMAIL,
  // UPDATE_USER_PHONE,

  // Admin mutations (not supported in current schema)
  // CREATE_USER,
  // UPDATE_USER,
  // DELETE_USER,

  // Password reset mutations (not supported in current schema)
  // REQUEST_PASSWORD_RESET,
  // RESET_PASSWORD,
} as const;

// Legacy exports for backward compatibility
export const LOGIN_USER = AUTHENTICATE_USER;
