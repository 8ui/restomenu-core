import { gql } from "@apollo/client";
import { USER_BASE_FRAGMENT, USER_DETAIL_FRAGMENT } from "../fragments";

// ====================================================================
// USER QUERIES - Standardized GraphQL queries for users
// ====================================================================

// ================== BASIC QUERIES ==================

// Get current user (me) with minimal fields
export const GET_ME_BASE = gql`
  query GetMeBase {
    me {
      ...UserBase
    }
  }
  ${USER_BASE_FRAGMENT}
`;

// Get current user (me) with detailed information
export const GET_ME_DETAIL = gql`
  query GetMeDetail {
    me {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Get single user by ID with minimal fields
export const GET_USER_BASE = gql`
  query GetUserBase($input: UserInput!) {
    user(input: $input) {
      ...UserBase
    }
  }
  ${USER_BASE_FRAGMENT}
`;

// Get single user by ID with detailed information
export const GET_USER_DETAIL = gql`
  query GetUserDetail($input: UserInput!) {
    user(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Get single employee by ID with detailed information
export const GET_EMPLOYEE_DETAIL = gql`
  query GetEmployeeDetail($input: EmployeeInput!) {
    employee(input: $input) {
      id
      userId
      accountId
      role
      name
      brandsId
      pointsId
      isActive
      user {
        ...UserDetail
      }
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// ================== LIST QUERIES ==================

// Get users with minimal fields (for lists)
export const GET_USERS_BASE = gql`
  query GetUsersBase($input: UsersInput!) {
    users(input: $input) {
      ...UserBase
    }
  }
  ${USER_BASE_FRAGMENT}
`;

// Get users with detailed information
export const GET_USERS_DETAIL = gql`
  query GetUsersDetail($input: UsersInput!) {
    users(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Get employees with detailed information
export const GET_EMPLOYEES = gql`
  query GetEmployees($input: EmployeesInput!) {
    employees(input: $input) {
      id
      userId
      accountId
      role
      name
      brandsId
      pointsId
      isActive
      user {
        ...UserDetail
      }
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// ================== EXPORTED QUERY COLLECTIONS ==================
export const USER_QUERIES = {
  // Current user queries
  GET_ME_BASE,
  GET_ME_DETAIL,

  // Single user queries
  GET_USER_BASE,
  GET_USER_DETAIL,
  GET_EMPLOYEE_DETAIL,

  // Multiple users queries
  GET_USERS_BASE,
  GET_USERS_DETAIL,
  GET_EMPLOYEES,
} as const;

// Legacy exports for backward compatibility
export const GET_USER = GET_USER_DETAIL;
export const GET_ME = GET_ME_DETAIL;
export const GET_USER_PROFILE = GET_ME_DETAIL;
