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
export {
  useProduct,
  useProducts,
  useAvailableProducts,
  useMenuProducts,
  useProductFormData,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "./product";

export {
  useCategory,
  useCategories,
  useMenuCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "./category";

export { useMenuData, useOrganizedMenuData, useMenuFilter } from "./menu";
