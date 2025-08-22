# @restomenu/core SDK Usage Guide

A comprehensive guide for using the Restomenu GraphQL SDK in your applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Advanced Usage](#advanced-usage)

## Installation

```bash
npm install @restomenu/core
```

## Quick Start

```typescript
import {
  useMenuData,
  useOrganizedMenuData,
  GET_MENU_DATA,
  formatPrice,
} from "@restomenu/core";
```

## Core Concepts

The `@restomenu/core` package provides a unified interface for interacting with the Restomenu GraphQL API. It includes:

- **GraphQL Operations**: Pre-built queries, mutations, and fragments
- **React Hooks**: Convenient wrappers for common operations
- **Utilities**: Helper functions for data processing
- **Types**: TypeScript definitions for all API entities
- **Constants**: Shared constants and enums

### Package Structure

```
@restomenu/core/
├── graphql/           # GraphQL operations
│   ├── queries/       # Domain-specific queries
│   ├── mutations/     # Domain-specific mutations
│   └── fragments/     # Reusable fragments
├── hooks/            # React hooks
├── types/            # TypeScript definitions
├── utils/            # Utility functions
└── constants/        # Shared constants
```

## API Reference

### GraphQL Operations

#### Core Queries

- `GET_MENU_DATA` - Fetch complete menu data for a point
- `GET_PRODUCTS_FOR_MENU` - Get products with menu-specific data
- `GET_CATEGORIES_BY_POINT` - Fetch categories for a specific point

#### Core Mutations

- `CREATE_PRODUCT` - Create a new product
- `UPDATE_PRODUCT` - Update existing product
- `DELETE_PRODUCT` - Remove a product

#### Fragments

- `PRODUCT_FOR_MENU_FRAGMENT` - Product data optimized for menu display
- `CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT` - Category with product count

### React Hooks

#### Menu Hooks

- `useMenuData(options)` - Basic menu data fetching
- `useOrganizedMenuData(options)` - Menu with organized categories and products
- `useMenuFilter(options)` - Advanced filtering and search capabilities

#### Product Hooks

- `useProduct(productId)` - Single product details
- `useProducts(options)` - Multiple products with filtering
- `useAvailableProducts(options)` - Products available for a specific point/order type
- `useCreateProduct()` - Product creation mutation hook
- `useUpdateProduct()` - Product update mutation hook

### Utilities

#### Formatting

- `formatPrice(priceInKopecks, currency)` - Format price from kopecks to display format

#### Filtering

- `buildProductFilters(options)` - Build complex filter objects for product queries

#### Query Utils

- `QUERY_UTILS` - Collection of utility functions for query construction

## Usage Examples

### 1. Basic Menu Display

Display a restaurant menu with categories and products:

```typescript
import React from 'react';
import { useOrganizedMenuData } from '@restomenu/core';

interface MenuDisplayProps {
  brandId: string;
  pointId: string;
  orderType: 'DELIVERY' | 'PICKUP';
}

const MenuDisplay: React.FC<MenuDisplayProps> = ({
  brandId,
  pointId,
  orderType
}) => {
  const { organizedCategories, loading, error, refetch } = useOrganizedMenuData({
    brandId,
    pointId,
    orderType,
  });

  if (loading) return <div>Loading menu...</div>;
  if (error) return <div>Error loading menu: {error.message}</div>;

  return (
    <div className="menu-display">
      <h1>Restaurant Menu</h1>
      {organizedCategories.map((category) => (
        <div key={category.id} className="category-section">
          <h2>{category.name}</h2>
          <div className="products-grid">
            {category.products.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <span className="price">{product.pricePoint} ₽</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => refetch()}>Refresh Menu</button>
    </div>
  );
};
```

### 2. Menu with Search and Filtering

Implement advanced menu filtering with search capabilities:

```typescript
import React from 'react';
import { useMenuFilter } from '@restomenu/core';

const MenuWithSearch: React.FC<MenuDisplayProps> = ({
  brandId,
  pointId,
  orderType
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const { categories, uncategorizedProducts, loading, totalProducts } = useMenuFilter({
    brandId,
    pointId,
    orderType,
    searchTerm,
    selectedCategoryId: selectedCategory,
  });

  return (
    <div className="menu-with-search">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <span>{totalProducts} products found</span>
      </div>

      {loading ? (
        <div>Searching...</div>
      ) : (
        <div className="search-results">
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
          {uncategorizedProducts.length > 0 && (
            <CategorySection
              category={{ name: 'Other', products: uncategorizedProducts }}
            />
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Product Management (Admin)

Implement full CRUD operations for product management:

```typescript
import React from 'react';
import { useProducts, useCreateProduct, useUpdateProduct } from '@restomenu/core';

const ProductManagement: React.FC<{ brandId: string }> = ({ brandId }) => {
  const [editingProduct, setEditingProduct] = React.useState<any>(null);

  const { data: productsData, loading, refetch } = useProducts({
    input: { brandId },
    level: 'detail',
  });

  const [createProduct] = useCreateProduct();
  const [updateProduct] = useUpdateProduct();

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct({
        variables: {
          input: {
            ...productData,
            brandId,
          },
        },
      });
      refetch();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    try {
      await updateProduct({
        variables: {
          input: productData,
        },
      });
      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  return (
    <div className="product-management">
      <h1>Product Management</h1>

      <div className="actions">
        <button onClick={() => setEditingProduct({})}>Add New Product</button>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div className="products-list">
          {productsData?.products?.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>Status: {product.isActive ? 'Active' : 'Inactive'}</p>
              <button onClick={() => setEditingProduct(product)}>Edit</button>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSave={editingProduct.id ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};
```

### 4. Custom Hook Creation

Create reusable custom hooks by combining SDK hooks:

```typescript
import { useQuery } from "@apollo/client";
import {
  GET_POINT_DETAIL,
  GET_CATEGORIES_BY_POINT,
  useAvailableProducts,
} from "@restomenu/core";

const useRestaurantData = (pointId: string) => {
  const pointQuery = useQuery(GET_POINT_DETAIL, {
    variables: { input: { pointId } },
  });

  const categoriesQuery = useQuery(GET_CATEGORIES_BY_POINT, {
    variables: { pointId },
    skip: !pointQuery.data?.point?.brandId,
  });

  const productsQuery = useAvailableProducts({
    brandId: pointQuery.data?.point?.brandId || "",
    pointId,
    orderType: "DELIVERY",
    skip: !pointQuery.data?.point?.brandId,
  });

  return {
    point: pointQuery.data?.point,
    categories: categoriesQuery.data?.categories || [],
    products: productsQuery.products,
    loading:
      pointQuery.loading || categoriesQuery.loading || productsQuery.loading,
    error: pointQuery.error || categoriesQuery.error || productsQuery.error,
  };
};
```

### 5. Direct GraphQL Usage

For advanced use cases, use GraphQL operations directly:

```typescript
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MENU_DATA } from '@restomenu/core';

const AdvancedMenuComponent = () => {
  const { data, loading, error } = useQuery(GET_MENU_DATA, {
    variables: {
      brandId: 'brand-123',
      pointId: 'point-456',
      orderType: 'DELIVERY',
    },
  });

  const processedData = React.useMemo(() => {
    if (!data) return null;

    return {
      categories: data.categories.map((cat) => ({
        ...cat,
        productCount: data.products.filter((p) =>
          p.categoryBinds?.some((b) => b.categoryId === cat.id)
        ).length,
      })),
      featuredProducts: data.products.filter((p) => p.featured),
    };
  }, [data]);

  return (
    <div>
      {/* Custom rendering logic */}
    </div>
  );
};
```

### 6. Using Utility Functions

Leverage built-in utilities for common tasks:

```typescript
import { buildProductFilters, formatPrice } from '@restomenu/core';

const CustomFilterExample = () => {
  const brandId = 'brand-123';
  const pointId = 'point-456';
  const orderType = 'DELIVERY';

  // Build complex filters
  const filterVariables = buildProductFilters({
    brandId,
    pointId,
    orderType,
    categoryId: 'category-789',
    tagIds: ['tag-1', 'tag-2'],
    isActive: true,
  });

  // Format prices
  const formattedPrice = formatPrice(15000); // "150 ₽"
  const formattedPriceWithKopecks = formatPrice(15050); // "150,50 ₽"

  return <div>{/* Component logic */}</div>;
};
```

## Best Practices

### 1. Import Strategy

Use specific imports to optimize bundle size:

```typescript
// ✅ Good - specific imports
import { useMenuData, formatPrice } from "@restomenu/core";

// ❌ Avoid - importing everything
import * as RestomenuCore from "@restomenu/core";
```

### 2. Error Handling

Always handle loading states and errors:

```typescript
const { data, loading, error } = useMenuData(options);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

// Render component
```

### 3. Performance Optimization

Use React.memo and useMemo for expensive operations:

```typescript
const ProductCard = React.memo(({ product }) => {
  const formattedPrice = React.useMemo(
    () => formatPrice(product.pricePoint),
    [product.pricePoint]
  );

  return (
    <div>
      <h3>{product.name}</h3>
      <span>{formattedPrice}</span>
    </div>
  );
});
```

### 4. Type Safety

Leverage TypeScript for better development experience:

```typescript
import { Product, Category } from "@restomenu/core";

interface MenuProps {
  products: Product[];
  categories: Category[];
}

const MenuComponent: React.FC<MenuProps> = ({ products, categories }) => {
  // Component implementation
};
```

## Advanced Usage

### Custom Query Building

For complex scenarios, build custom queries using fragments:

```typescript
import { gql } from "@apollo/client";
import { PRODUCT_FOR_MENU_FRAGMENT } from "@restomenu/core";

const CUSTOM_MENU_QUERY = gql`
  query CustomMenuQuery($brandId: ID!, $pointId: ID!) {
    categories: categoriesByPoint(pointId: $pointId) {
      id
      name
      products {
        ...ProductForMenu
      }
    }
    featuredProducts: products(input: { brandId: $brandId, featured: true }) {
      ...ProductForMenu
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;
```

### SDK Configuration

The SDK is designed to work seamlessly with Apollo Client:

```typescript
import { RestoMenuSDK } from "@restomenu/core";

console.log("SDK Info:", {
  name: RestoMenuSDK.name,
  version: RestoMenuSDK.version,
  features: RestoMenuSDK.features,
});
```

### Integration with State Management

Combine SDK hooks with your state management solution:

```typescript
import { useMenuData } from '@restomenu/core';
import { useAppSelector, useAppDispatch } from './store';

const MenuContainer = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.menu.filters);

  const { organizedCategories, loading } = useOrganizedMenuData({
    brandId: filters.brandId,
    pointId: filters.pointId,
    orderType: filters.orderType,
  });

  React.useEffect(() => {
    if (organizedCategories) {
      dispatch(setMenuData(organizedCategories));
    }
  }, [organizedCategories, dispatch]);

  return <MenuDisplay />;
};
```

## Troubleshooting

### Common Issues

1. **GraphQL Errors**: Ensure your GraphQL client is properly configured with the correct endpoint
2. **Type Errors**: Make sure you're using the latest generated types
3. **Missing Data**: Check if the required variables are being passed to hooks
4. **Performance Issues**: Use React DevTools Profiler to identify re-rendering issues

### Debugging Tips

- Enable Apollo Client DevTools for GraphQL debugging
- Use React Developer Tools to inspect hook states
- Check network requests in browser DevTools
- Verify that your queries include necessary fragments

---

For more information, see the [API documentation](./README.md) or check the [examples](./examples/) directory.
