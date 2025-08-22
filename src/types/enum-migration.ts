/**
 * Backward Compatibility Types for Enum Migration
 *
 * This file provides type aliases to enable gradual migration from
 * SCREAMING_SNAKE_CASE to PascalCase enum values without breaking changes.
 *
 * Phase 1.1 of Memory Bank guided enum migration strategy.
 */

import {
  OrderType as CoreOrderType,
  OrderStatus as CoreOrderStatus,
  EmployeeRole as CoreEmployeeRole,
  ProductUnit as CoreProductUnit,
  ProductVariantPropertyDisplayType as CoreProductVariantPropertyDisplayType,
  NearType as CoreNearType,
} from "../graphql-types";

// =============================================================================
// BACKWARD COMPATIBILITY TYPE ALIASES
// =============================================================================

/**
 * OrderType Compatibility
 * Supports both new PascalCase and legacy SCREAMING_SNAKE_CASE values
 */
export type OrderTypeCompat =
  | CoreOrderType
  | "DELIVERY"
  | "PICKUP"
  | "ON_TABLE"
  | "PRE_ORDER";

/**
 * OrderStatus Compatibility
 * Supports both new PascalCase and legacy SCREAMING_SNAKE_CASE values
 */
export type OrderStatusCompat =
  | CoreOrderStatus
  | "NEW"
  | "ACCEPTED"
  | "PREPARED"
  | "READY"
  | "COMPLETE"
  | "SUBMITTED";

/**
 * EmployeeRole Compatibility
 * Supports both new PascalCase and legacy SCREAMING_SNAKE_CASE values
 */
export type EmployeeRoleCompat = CoreEmployeeRole | "MANAGER" | "MASTER";

/**
 * ProductUnit Compatibility
 * Supports both new PascalCase and legacy SCREAMING_SNAKE_CASE values
 */
export type ProductUnitCompat =
  | CoreProductUnit
  | "GRAM"
  | "KILOGRAM"
  | "LITERS"
  | "MILLILITERS"
  | "PIECES"
  | "PORTION"
  | "BOTTLES";

/**
 * ProductVariantPropertyDisplayType Compatibility
 * Supports both new PascalCase and legacy SCREAMING_SNAKE_CASE values
 */
export type ProductVariantPropertyDisplayTypeCompat =
  | CoreProductVariantPropertyDisplayType
  | "BUTTONS"
  | "SELECT";

/**
 * NearType Compatibility
 * Supports both new PascalCase and legacy SCREAMING_SNAKE_CASE values
 */
export type NearTypeCompat = CoreNearType | "AFTER" | "BEFORE";

// =============================================================================
// MIGRATION HELPER FUNCTIONS
// =============================================================================

/**
 * Convert legacy OrderType values to new PascalCase format
 */
export const normalizeOrderType = (value: OrderTypeCompat): CoreOrderType => {
  switch (value) {
    case "DELIVERY":
      return CoreOrderType.Delivery;
    case "PICKUP":
      return CoreOrderType.Pickup;
    case "ON_TABLE":
      return CoreOrderType.OnTable;
    case "PRE_ORDER":
      return CoreOrderType.PreOrder;
    default:
      return value as CoreOrderType;
  }
};

/**
 * Convert legacy OrderStatus values to new PascalCase format
 */
export const normalizeOrderStatus = (
  value: OrderStatusCompat
): CoreOrderStatus => {
  switch (value) {
    case "NEW":
      return CoreOrderStatus.New;
    case "ACCEPTED":
      return CoreOrderStatus.Accepted;
    case "PREPARED":
      return CoreOrderStatus.Prepared;
    case "READY":
      return CoreOrderStatus.Ready;
    case "COMPLETE":
      return CoreOrderStatus.Complete;
    case "SUBMITTED":
      return CoreOrderStatus.Submitted;
    default:
      return value as CoreOrderStatus;
  }
};

/**
 * Convert legacy EmployeeRole values to new PascalCase format
 */
export const normalizeEmployeeRole = (
  value: EmployeeRoleCompat
): CoreEmployeeRole => {
  switch (value) {
    case "MANAGER":
      return CoreEmployeeRole.Manager;
    case "MASTER":
      return CoreEmployeeRole.Master;
    default:
      return value as CoreEmployeeRole;
  }
};

/**
 * Convert legacy ProductUnit values to new PascalCase format
 */
export const normalizeProductUnit = (
  value: ProductUnitCompat
): CoreProductUnit => {
  switch (value) {
    case "GRAM":
      return CoreProductUnit.Gram;
    case "KILOGRAM":
      return CoreProductUnit.Kilogram;
    case "LITERS":
      return CoreProductUnit.Liters;
    case "MILLILITERS":
      return CoreProductUnit.Milliliters;
    case "PIECES":
      return CoreProductUnit.Pieces;
    case "PORTION":
      return CoreProductUnit.Portion;
    case "BOTTLES":
      return CoreProductUnit.Bottles;
    default:
      return value as CoreProductUnit;
  }
};

/**
 * Convert legacy ProductVariantPropertyDisplayType values to new PascalCase format
 */
export const normalizeProductVariantPropertyDisplayType = (
  value: ProductVariantPropertyDisplayTypeCompat
): CoreProductVariantPropertyDisplayType => {
  switch (value) {
    case "BUTTONS":
      return CoreProductVariantPropertyDisplayType.Buttons;
    case "SELECT":
      return CoreProductVariantPropertyDisplayType.Select;
    default:
      return value as CoreProductVariantPropertyDisplayType;
  }
};

/**
 * Convert legacy NearType values to new PascalCase format
 */
export const normalizeNearType = (value: NearTypeCompat): CoreNearType => {
  switch (value) {
    case "AFTER":
      return CoreNearType.After;
    case "BEFORE":
      return CoreNearType.Before;
    default:
      return value as CoreNearType;
  }
};

// =============================================================================
// REVERSE CONVERSION HELPERS (for API compatibility)
// =============================================================================

/**
 * Convert new PascalCase OrderType to legacy format if needed
 */
export const toLegacyOrderType = (value: CoreOrderType): string => {
  switch (value) {
    case CoreOrderType.Delivery:
      return "DELIVERY";
    case CoreOrderType.Pickup:
      return "PICKUP";
    case CoreOrderType.OnTable:
      return "ON_TABLE";
    case CoreOrderType.PreOrder:
      return "PRE_ORDER";
    default:
      return value;
  }
};

/**
 * Convert new PascalCase OrderStatus to legacy format if needed
 */
export const toLegacyOrderStatus = (value: CoreOrderStatus): string => {
  switch (value) {
    case CoreOrderStatus.New:
      return "NEW";
    case CoreOrderStatus.Accepted:
      return "ACCEPTED";
    case CoreOrderStatus.Prepared:
      return "PREPARED";
    case CoreOrderStatus.Ready:
      return "READY";
    case CoreOrderStatus.Complete:
      return "COMPLETE";
    case CoreOrderStatus.Submitted:
      return "SUBMITTED";
    default:
      return value;
  }
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if a value is a legacy enum format
 */
export const isLegacyEnumValue = (value: string): boolean => {
  return value === value.toUpperCase() && value.includes("_");
};

/**
 * Check if a value is a new PascalCase enum format
 */
export const isPascalCaseEnumValue = (value: string): boolean => {
  if (value.length === 0) return false;
  const firstChar = value.charAt(0);
  return firstChar === firstChar.toUpperCase() && !value.includes("_");
};

// =============================================================================
// MIGRATION STATUS TRACKING
// =============================================================================

/**
 * Migration phase tracking
 */
export enum MigrationPhase {
  Phase1_BackwardCompatibility = "phase1_backward_compatibility",
  Phase2_ComponentMigration = "phase2_component_migration",
  Phase3_DataLayerMigration = "phase3_data_layer_migration",
  Phase4_Cleanup = "phase4_cleanup",
}

/**
 * Current migration phase (to be updated as we progress)
 */
export const CURRENT_MIGRATION_PHASE =
  MigrationPhase.Phase1_BackwardCompatibility;

/**
 * Migration progress tracking
 */
export interface MigrationProgress {
  phase: MigrationPhase;
  completedComponents: string[];
  remainingComponents: string[];
  errors: string[];
}

export const trackMigrationProgress = (): MigrationProgress => {
  return {
    phase: CURRENT_MIGRATION_PHASE,
    completedComponents: [],
    remainingComponents: [
      "OrderType enum usage",
      "OrderStatus enum usage",
      "EmployeeRole enum usage",
      "ProductUnit enum usage",
      "ProductVariantPropertyDisplayType enum usage",
      "Mock data structures",
      "GraphQL mutations",
    ],
    errors: [],
  };
};
