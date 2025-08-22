// Re-export hooks by domain
export * from "./brand";
export * from "./category";
export * from "./product";
export * from "./order";
export * from "./user";
export * from "./point";
export * from "./city";
export * from "./menu";

// Re-export hook collections for easy import
export { PRODUCT_HOOKS } from "./product";
export { CATEGORY_HOOKS } from "./category";
export { MENU_HOOKS } from "./menu";
export { BRAND_HOOKS } from "./brand";
export { CITY_HOOKS } from "./city";
export { ORDER_HOOKS } from "./order";
export { POINT_HOOKS } from "./point";
export { USER_HOOKS } from "./user";

// Export commonly used hooks directly

// Product hooks
export {
  useProduct,
  useProducts,
  useAvailableProducts,
  useMenuProducts,
  useProductFormData,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductVariantProperty,
  useUpdateProductVariantProperty,
  useDeleteProductVariantProperty,
} from "./product";

// Category hooks
export {
  useCategory,
  useCategories,
  useMenuCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "./category";

// Menu hooks
export { useMenuData, useOrganizedMenuData, useMenuFilter } from "./menu";

// Brand hooks
export {
  useBrand,
  useBrands,
  useActiveBrands,
  useBrandsByAccount,
  useCreateElectronicMenu,
  useBrandSelection,
} from "./brand";

// City hooks
export {
  useCity,
  useCities,
  useCitiesForBrand,
  useCitySelection,
} from "./city";

// Point hooks
export {
  usePoint,
  usePointsForBrand,
  usePointsForCity,
  useActivePoints,
  useCreatePoint,
  useUpdatePoint,
  usePointSelection,
} from "./point";

// Order hooks
export {
  useOrder,
  useOrdersForEmployee,
  useOrdersForPoint,
  useActiveOrders,
  useOrderHistory,
  useCreatePreOrderByEmployee,
  useUpdatePreOrderByEmployee,
  useUpdateOrderStatus,
  useOrderItemManagement,
  useOrderCommentManagement,
  useOrderPersonsManagement,
  useOrderWorkflow,
  useEmployeeOrderDashboard,
  usePointOrderManagement,
  useOrderTracking,
  useOrderManagement,
  isValidOrderStatusTransition,
  calculateOrderPriority,
  getOrderSummary,
} from "./order";

// User hooks
export {
  useUserProfile,
  useUserDetail,
  useEmployees,
  useEmployeeDetail,
  useAuthentication,
  useAnonymousAuthentication,
  useLogout,
  useRestoplaceAuthentication,
  useRestoplaceAddressIntegration,
  useAuthenticationFlow,
  useEmployeeManagement,
} from "./user";
