import { gql } from "@apollo/client";
import { USER_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// USER MUTATIONS - Standardized GraphQL mutations for users
// ====================================================================

// ================== AUTHENTICATION MUTATIONS ==================

// User authentication (login)
export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($input: AuthenticationInput!) {
    authentication(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// User registration
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// User logout
export const LOGOUT_USER = gql`
  mutation LogoutUser {
    logout
  }
`;

// ================== PROFILE MUTATIONS ==================

// Update user profile
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UserUpdateInput!) {
    userUpdate(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Change user password
export const CHANGE_USER_PASSWORD = gql`
  mutation ChangeUserPassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
    }
  }
`;

// Update user email
export const UPDATE_USER_EMAIL = gql`
  mutation UpdateUserEmail($input: UpdateEmailInput!) {
    updateEmail(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Update user phone
export const UPDATE_USER_PHONE = gql`
  mutation UpdateUserPhone($input: UpdatePhoneInput!) {
    updatePhone(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// ================== ADMIN MUTATIONS ==================

// Create user (admin only)
export const CREATE_USER = gql`
  mutation CreateUser($input: UserCreateInput!) {
    userCreate(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Update user (admin only)
export const UPDATE_USER = gql`
  mutation UpdateUser($input: UserUpdateInput!) {
    userUpdate(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Delete user (admin only)
export const DELETE_USER = gql`
  mutation DeleteUser($input: UserDeleteInput!) {
    userDelete(input: $input)
  }
`;

// ================== PASSWORD RESET MUTATIONS ==================

// Request password reset
export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
    }
  }
`;

// Reset password with token
export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
    }
  }
`;

// ================== EXPORTED MUTATION COLLECTIONS ==================
export const USER_MUTATIONS = {
  // Authentication mutations
  AUTHENTICATE_USER,
  REGISTER_USER,
  LOGOUT_USER,

  // Profile mutations
  UPDATE_USER_PROFILE,
  CHANGE_USER_PASSWORD,
  UPDATE_USER_EMAIL,
  UPDATE_USER_PHONE,

  // Admin mutations
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,

  // Password reset mutations
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
} as const;

// Legacy exports for backward compatibility
export const LOGIN_USER = AUTHENTICATE_USER;
