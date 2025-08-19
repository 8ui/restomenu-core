# @restomenu/core

Shared domain logic, types, and utilities for Restomenu applications.

## Installation

This package is published to GitLab Package Registry. To install:

```bash
npm install @restomenu/core
```

## Package Contents

- **GraphQL Types** - Generated TypeScript types from GraphQL schema
- **Constants** - Shared constants for brands, categories, cities, etc.
- **Hooks** - Reusable React hooks for common operations
- **Utils** - Common utility functions for formatting, validation, etc.

## Usage

```typescript
import { useBrands, formatPrice } from "@restomenu/core";

// Use hooks
const { data: brands, loading } = useBrands();

// Use utilities
const formattedPrice = formatPrice(1299, "RUB");
```

## Development

This package is part of the Restomenu monorepo and should be developed within that context.

### Publishing

Publishing is handled automatically via GitLab CI/CD when changes are pushed to the main branch.

Manual publishing:

```bash
npm publish
```

## Type Generation

GraphQL types are generated from the schema using GraphQL Code Generator:

```bash
npm run graphql:codegen
```
