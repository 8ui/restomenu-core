# @restomenu/core - GraphQL SDK

> Comprehensive GraphQL SDK for the Restomenu Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](./src)
[![Apollo Client](https://img.shields.io/badge/Apollo%20Client-Compatible-green)](./src/hooks)

## 🎯 Overview

The `@restomenu/core` package provides a complete GraphQL SDK for the Restomenu platform, featuring:

- ✅ **Standardized GraphQL Operations** - Queries, mutations, and fragments for all domains
- ✅ **React Hooks Integration** - Ready-to-use hooks for React applications
- ✅ **TypeScript Support** - Full type safety with generated types
- ✅ **Apollo Client Optimization** - Built-in caching and performance optimizations
- ✅ **Modular Architecture** - Use only what you need
- ✅ **Composite Operations** - High-level business logic combinations

## 🚀 Quick Start

### Installation

```bash
npm install @restomenu/core @apollo/client graphql
```

### Basic Usage

```typescript
import React from 'react';
import { useMenuData, useCreateProduct } from '@restomenu/core';

// Get complete menu data (categories + products)
const MenuComponent = () => {
  const { categories, products, loading, error } = useMenuData({
    brandId: 'your-brand-id',
    pointId: 'your-point-id',
    orderType: 'DELIVERY',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          {/* Render products */}
        </div>
      ))}
    </div>
  );
};

// Create products with mutations
const AdminComponent = () => {
  const [createProduct] = useCreateProduct();

  const handleCreate = async () => {
    await createProduct({
      variables: {
        input: {
          name: 'New Product',
          brandId: 'your-brand-id',
          // ... other fields
        }
      }
    });
  };

  return <button onClick={handleCreate}>Create Product</button>;
};
```

## 📚 Architecture

The SDK is organized into multiple layers of abstraction:

### Layer 1: Core GraphQL Operations

```typescript
import {
  // Fragments
  PRODUCT_FOR_MENU_FRAGMENT,
  CATEGORY_DETAIL_FRAGMENT,

  // Queries
  GET_PRODUCTS_FOR_MENU,
  GET_CATEGORIES_WITH_PRODUCTS_COUNT,

  // Mutations
  CREATE_PRODUCT,
  UPDATE_PRODUCT,

  // Composite operations
  GET_MENU_DATA,
} from "@restomenu/core";
```

### Layer 2: React Hooks

```typescript
import {
  // Product hooks
  useProduct,
  useProducts,
  useAvailableProducts,
  useCreateProduct,

  // Category hooks
  useCategories,
  useMenuCategories,

  // Composite hooks
  useMenuData,
  useOrganizedMenuData,
  useMenuFilter,
} from "@restomenu/core";
```

### Layer 3: Business Logic Utilities

```typescript
import {
  QUERY_UTILS,
  buildProductFilters,
  buildCategoryFilters,
} from "@restomenu/core";
```

## 🎛️ Domain Coverage

The SDK covers all major Restomenu domains:

| Domain       | Queries | Mutations | Hooks | Description                         |
| ------------ | ------- | --------- | ----- | ----------------------------------- |
| **Product**  | ✅      | ✅        | ✅    | Product management and menu display |
| **Category** | ✅      | ✅        | ✅    | Category hierarchy and organization |
| **Order**    | ✅      | ✅        | ✅    | Order lifecycle management          |
| **User**     | ✅      | ✅        | ✅    | User authentication and profiles    |
| **Brand**    | ✅      | ✅        | ✅    | Brand information and settings      |
| **Point**    | ✅      | ✅        | ✅    | Restaurant locations                |
| **City**     | ✅      | ✅        | ✅    | Geographic data                     |
| **Menu**     | ✅      | ➖        | ✅    | Composite menu operations           |

## 🔧 Advanced Usage

### Custom Queries with Fragments

```typescript
import { gql } from "@apollo/client";
import { PRODUCT_FOR_MENU_FRAGMENT } from "@restomenu/core";

const CUSTOM_PRODUCT_QUERY = gql`
  query CustomProducts($brandId: Uuid!) {
    products(input: { brandId: $brandId, filter: { featured: true } }) {
      ...ProductForMenu
      customField
    }
  }
  ${PRODUCT_FOR_MENU_FRAGMENT}
`;
```

### Filtering and Search

```typescript
import { useMenuFilter } from '@restomenu/core';

const SearchableMenu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  const { categories, totalProducts, loading } = useMenuFilter({
    brandId: 'brand-123',
    pointId: 'point-456',
    orderType: 'DELIVERY',
    searchTerm,
    selectedCategoryId: categoryId,
  });

  return (
    <div>
      <input
        placeholder=\"Search products...\"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <p>{totalProducts} products found</p>
      {/* Render filtered results */}
    </div>
  );
};
```

### Optimistic Updates

```typescript
import { useUpdateProduct } from '@restomenu/core';

const ProductToggle = ({ product }) => {
  const [updateProduct] = useUpdateProduct();

  const handleToggle = () => {
    updateProduct({
      variables: {
        input: {
          productId: product.id,
          brandId: product.brandId,
          isActive: !product.isActive,
        }
      },
      optimisticResponse: {
        productUpdate: {
          ...product,
          isActive: !product.isActive,
        }
      }
    });
  };

  return (
    <button onClick={handleToggle}>
      {product.isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
};
```

## 📖 Available Hooks

### Product Hooks

- `useProduct()` - Get single product with multiple detail levels
- `useProducts()` - Get multiple products with filtering
- `useAvailableProducts()` - Get products available for specific point/order type
- `useProductsByCategory()` - Get products filtered by category
- `useProductTags()` - Get product tags for filtering
- `useCreateProduct()` - Create new product
- `useUpdateProduct()` - Update existing product
- `useDeleteProduct()` - Delete product
- `useMenuProducts()` - Composite hook for menu display
- `useProductFormData()` - Combined product + tags for forms

### Category Hooks

- `useCategory()` - Get single category
- `useCategories()` - Get multiple categories
- `useMenuCategories()` - Get categories with product counts
- `useCreateCategory()` - Create new category
- `useUpdateCategory()` - Update existing category
- `useDeleteCategory()` - Delete category

### Menu Hooks (Composite)

- `useMenuData()` - Get complete menu (categories + products)
- `useOrganizedMenuData()` - Get menu with products organized by categories
- `useMenuFilter()` - Get filtered menu with search and category filtering

### Order Hooks

- `useOrder()` - Get single order
- `useOrders()` - Get multiple orders
- `useCreateOrder()` - Create new order
- `useUpdateOrder()` - Update existing order
- `useOrderStatus()` - Get order status for polling

### User Hooks

- `useUser()` - Get user profile
- `useAuthenticateUser()` - User login
- `useRegisterUser()` - User registration
- `useUpdateUserProfile()` - Update user profile

## 🎨 Fragments Available

### Product Fragments

- `PRODUCT_BASE_FRAGMENT` - Minimal product fields
- `PRODUCT_DETAIL_FRAGMENT` - Detailed product information
- `PRODUCT_FOR_MENU_FRAGMENT` - Optimized for menu display
- `PRODUCT_FULL_FRAGMENT` - Complete product data (admin view)
- `PRODUCT_PRICE_SETTINGS_FRAGMENT` - Price configuration
- `PRODUCT_IMAGES_FRAGMENT` - Product images
- `PRODUCT_TAGS_FRAGMENT` - Product tags and bindings

### Category Fragments

- `CATEGORY_BASE_FRAGMENT` - Minimal category fields
- `CATEGORY_DETAIL_FRAGMENT` - Detailed category information
- `CATEGORY_WITH_PRODUCTS_COUNT_FRAGMENT` - Category with product count

### Other Fragments

- `ORDER_DETAIL_FRAGMENT` - Order information
- `ORDER_WITH_ITEMS_FRAGMENT` - Order with items
- `USER_DETAIL_FRAGMENT` - User profile
- `BRAND_DETAIL_FRAGMENT` - Brand information
- `POINT_DETAIL_FRAGMENT` - Point/location details
- `CITY_BASE_FRAGMENT` - City information

## 🛠️ Utilities

### Query Builders

```typescript
import { buildProductFilters, buildCategoryFilters } from "@restomenu/core";

// Build complex product filters
const productFilters = buildProductFilters({
  brandId: "brand-123",
  pointId: "point-456",
  orderType: "DELIVERY",
  categoryId: "category-789",
  tagIds: ["tag-1", "tag-2"],
  isActive: true,
});

// Build category filters
const categoryFilters = buildCategoryFilters({
  brandId: "brand-123",
  pointId: "point-456",
  orderType: "DELIVERY",
  parentId: null, // Top-level categories
  includeProductsCheck: true,
});
```

## 🔧 Configuration

### Apollo Client Setup

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  uri: "https://your-graphql-endpoint.com/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Product: {
        fields: {
          pricePoint: {
            // Custom cache logic for dynamic pricing
            read(existing, { args, readField }) {
              // Custom price calculation logic
              return existing;
            },
          },
        },
      },
    },
  }),
});
```

## 📊 Performance Optimizations

### Built-in Optimizations

- **Fragment Composition** - Reusable fragments reduce query size
- **Query Deduplication** - Apollo Client automatically deduplicates identical queries
- **Intelligent Caching** - Smart cache updates and invalidation
- **Optimistic Updates** - Immediate UI updates for better UX
- **Error Boundaries** - Graceful error handling with `errorPolicy: 'all'`

### Best Practices

```typescript
// ✅ Good: Use appropriate detail level
const { products } = useProducts({
  input: { brandId },
  level: "base", // Only fetch minimal fields for lists
});

// ✅ Good: Skip unnecessary queries
const { product } = useProduct({
  input: { productId },
  skip: !productId, // Don't query if no ID
});

// ✅ Good: Use composite hooks for related data
const menuData = useMenuData({ brandId, pointId, orderType });
// Instead of separate category and product queries
```

## 🧪 Testing

```typescript
import { MockedProvider } from '@apollo/client/testing';
import { GET_PRODUCTS_FOR_MENU } from '@restomenu/core';

const mocks = [
  {
    request: {
      query: GET_PRODUCTS_FOR_MENU,
      variables: {
        input: { brandId: 'test-brand' },
        pointId: 'test-point',
        orderType: 'DELIVERY',
      },
    },
    result: {
      data: {
        products: [
          {
            id: '1',
            name: 'Test Product',
            // ... other fields
          },
        ],
      },
    },
  },
];

const TestComponent = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <YourComponent />
  </MockedProvider>
);
```

## 🚀 Migration Guide

### From Direct Apollo Usage

```typescript
// Before: Direct Apollo usage
const { data, loading, error } = useQuery(
  gql`
    query GetProducts($brandId: String!) {
      products(input: { brandId: $brandId }) {
        id
        name
        price
      }
    }
  `,
  { variables: { brandId } }
);

// After: Using SDK hooks
const { data, loading, error } = useProducts({
  input: { brandId },
  level: "base", // Optimized fragment
});
```

### From Custom Fragments

```typescript
// Before: Custom fragments
const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    price
  }
`;

// After: Using SDK fragments
import { PRODUCT_BASE_FRAGMENT } from "@restomenu/core";
```

## 🤝 Contributing

The SDK is designed to be extensible. To add new operations:

1. Add GraphQL operations to the appropriate domain file
2. Create corresponding React hooks
3. Update the exports in index files
4. Add documentation and examples

## 📝 License

Internal package for Restomenu platform.

---

**Built with ❤️ for the Restomenu Platform**
