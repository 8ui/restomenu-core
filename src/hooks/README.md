# SDK Hooks - Domain-Specific React Hooks

This directory contains specialized React hooks for each domain in the Restomenu SDK. Each domain has its own unique requirements and workflows, so we maintain separate, optimized hooks rather than forcing everything into a generic pattern.

## Current Implementation

### Domain-Specific Hooks

- **`brand.ts`** - Brand operations, selection, and electronic menu creation
- **`category.ts`** - Category hierarchy management with parent/child relationships
- **`city.ts`** - City operations and brand relationships
- **`menu.ts`** - Complex menu data aggregation, filtering, and organization
- **`order.ts`** - Order lifecycle management with employee and point context
- **`point.ts`** - Point operations with geographic and brand context
- **`product.ts`** - Product CRUD with variants, tags, and category bindings
- **`user.ts`** - Authentication flows and employee management

### Common Patterns (Where Appropriate)

Some domains share similar patterns, but each is tailored to specific needs:

```typescript
// Basic entity queries (adapted per domain)
useEntity({ input, level, skip });
useEntities({ filter, level, skip });

// Domain-specific mutations
useCreateEntity(); // Customized per domain requirements
useUpdateEntity(); // With domain-specific cache logic
useDeleteEntity(); // With proper relationship cleanup

// Specialized composite operations
useEntitySelection(); // Tailored to domain context
useEntityManagement(); // With domain-specific business logic
```

## 🎯 Domain-Specific Optimization Strategy

### Core Philosophy

Each domain has unique characteristics that require specialized handling:

- **Orders**: Complex state machines with employee workflows
- **Products**: Rich variant systems and category relationships
- **Categories**: Hierarchical structures with inheritance
- **Menus**: Data aggregation from multiple sources
- **Authentication**: Multi-step flows with different user types

### Benefits of Domain-Specific Approach

- **Optimized for actual use cases** rather than theoretical generalization
- **Domain expertise embedded** in hook implementations
- **Flexible evolution** - each domain can evolve independently
- **Better developer experience** with domain-specific APIs
- **Easier testing** with domain-focused test scenarios

## 📋 Domain-Specific Implementation Examples

### Product Domain - Rich CRUD with Variants

```typescript
// Specialized for product complexity
export const useProductFormData = ({ brandId, productId, skip = false }) => {
  const productQuery = useProduct({
    input: { id: productId || "", brandId },
    level: "detail",
    skip: skip || !productId,
  });
  const tagsQuery = useProductTags({ brandId, skip });
  const variantsQuery = useProductVariantProperties({ brandId, skip });

  return {
    product: productQuery.data?.product,
    tags: tagsQuery.data?.productTags || [],
    variants: variantsQuery.data?.variantProperties || [],
    loading: productQuery.loading || tagsQuery.loading || variantsQuery.loading,
    error: productQuery.error || tagsQuery.error || variantsQuery.error,
  };
};
```

### Order Domain - Workflow Management

```typescript
// Specialized for order state management
export const useOrderWorkflow = ({ orderId, employeeId, pointId }) => {
  const orderQuery = useOrder({ input: { id: orderId }, skip: !orderId });

  const canEdit = useMemo(() => {
    const order = orderQuery.data?.order;
    return order?.status === "DRAFT" || order?.status === "PENDING";
  }, [orderQuery.data]);

  return {
    order: orderQuery.data?.order,
    permissions: { canEdit },
    loading: orderQuery.loading,
    error: orderQuery.error,
  };
};
```

### Category Domain - Hierarchy Management

```typescript
// Specialized for tree structures
export const useCategoryHierarchy = ({ brandId, skip = false }) => {
  const allCategoriesQuery = useBrandCategories({ brandId, skip });

  const buildHierarchy = useCallback((categories, parentId = null) => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((category) => ({
        ...category,
        children: buildHierarchy(categories, category.id),
      }));
  }, []);

  const hierarchy = useMemo(() => {
    if (!allCategoriesQuery.data?.categories) return [];
    return buildHierarchy(allCategoriesQuery.data.categories);
  }, [allCategoriesQuery.data, buildHierarchy]);

  return { hierarchy, loading: allCategoriesQuery.loading };
};
```

## 🔄 Evolution Strategy

### Phase 1: Analysis & Standards (Week 1-2)

1. ✅ **Document current patterns** - Understand existing hook implementations
2. 🔄 **Identify shared utilities** - Extract common Apollo Client patterns
3. 🔄 **Establish coding standards** - TypeScript patterns, error handling, caching
4. 🔄 **Create shared helpers** - Reusable cache management utilities

### Phase 2: Domain Optimization (Week 3-6)

1. 🔄 **Product domain enhancement** - Improve variant handling, add search capabilities
2. 🔄 **Order domain workflows** - Add state management, employee context
3. 🔄 **Category hierarchy** - Improve tree operations, drag & drop support
4. 🔄 **Menu aggregation** - Enhanced filtering, performance optimization

### Phase 3: Advanced Features (Week 7-10)

1. 🔄 **Domain-specific search** - Tailored search for each domain
2. 🔄 **Real-time updates** - Subscriptions where appropriate
3. 🔄 **Offline capabilities** - Domain-specific sync strategies
4. 🔄 **Performance optimization** - Lazy loading, prefetching

### Shared Utilities (When Beneficial)

Create shared utilities for common patterns without forcing uniformity:

```typescript
// Shared cache management utilities
export const createCacheUpdater = (typename: string) => ({
  invalidateByPattern: (pattern: string) => {
    /* ... */
  },
  optimisticUpdate: (id: string, updater: Function) => {
    /* ... */
  },
});

// Shared error handling
export const useErrorHandler = (domain: string) => ({
  handleError: (error: ApolloError) => {
    /* domain-specific handling */
  },
  formatErrorMessage: (error: ApolloError) => {
    /* ... */
  },
});
```

## 🎯 Expected Benefits

### Development Experience

- **Optimized APIs** for each domain's specific use cases
- **Domain expertise** embedded in hook implementations
- **Flexible evolution** - each domain can evolve independently
- **Better IntelliSense** with domain-specific type definitions

### Performance

- **Domain-optimized caching** strategies
- **Specialized optimizations** for each use case
- **Efficient data fetching** patterns per domain
- **Context-aware optimizations**

### Maintainability

- **Domain-focused testing** with realistic scenarios
- **Easier debugging** with domain-specific logic
- **Independent scaling** of each domain
- **Clear separation of concerns**

## 🚀 Getting Started

### Current Usage (Continue As-Is)

```typescript
// Each domain hook is already optimized for its specific use case
import {
  useProduct,
  useProductFormData,
  useMenuProducts,
} from "@restomenu/core";

// Product management
const { product, tags, variants, loading } = useProductFormData({
  brandId: "brand-123",
  productId: "product-456",
});

// Menu display
const { products } = useMenuProducts({
  brandId: "brand-123",
  pointId: "point-789",
  orderType: "DELIVERY",
});
```

---

**📝 Status:** Ready for Domain-Specific Evolution

**🎯 Goal:** Optimize each domain for its specific use cases while sharing utilities where beneficial

**🤝 Strategy:** Domain-specific optimization with shared utilities, not forced generalization
