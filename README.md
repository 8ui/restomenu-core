# @shared-core - Shared Domain Logic and Types

## Overview

`@shared-core` is a TypeScript library that consolidates duplicated domain logic and types used across `web-admin` and `external-menu` applications. It eliminates code duplication by providing a single source of truth for shared business logic.

## Architecture Principles

- **Pure TypeScript**: No React dependencies in core modules
- **Tree-shaking friendly**: Modular exports for optimal bundle size
- **TypeScript-first**: Full type safety and IntelliSense support
- **Domain-driven**: Organized by business domains (brand, category, product, etc.)
- **Backward compatible**: Gradual migration without breaking changes

## Package Structure

```
@shared-core/
├── src/
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Main type exports
│   │   ├── graphql.ts      # Generated GraphQL types
│   │   └── common.ts       # Common utility types
│   ├── graphql/            # GraphQL operations
│   │   ├── index.ts        # Main GraphQL exports
│   │   ├── fragments/      # Reusable GraphQL fragments
│   │   ├── queries/        # Query operations
│   │   └── mutations/      # Mutation operations
│   ├── utils/              # Pure utility functions
│   │   ├── index.ts        # Main utility exports
│   │   ├── validation/     # Data validation utilities
│   │   ├── formatting/     # Data formatting utilities
│   │   └── mapping/        # Data transformation utilities
│   ├── constants/          # Shared constants and enums
│   │   ├── index.ts        # Main constant exports
│   │   ├── enums.ts        # Enum definitions
│   │   └── config.ts       # Configuration constants
│   ├── hooks/              # React hooks (app-specific)
│   │   ├── index.ts        # Main hook exports
│   │   └── [domain]/       # Domain-specific hooks
│   └── index.ts            # Main library exports
├── graphql/
│   └── schema.graphqls     # GraphQL schema definition
└── tsconfig/
    ├── base.json           # Base TypeScript configuration
    └── react-app.json      # React app configuration
```

## Import Patterns

### Main Exports

```typescript
// Import types
import type { Brand, Category, Product } from "@shared-core";

// Import utilities
import { formatPrice, validatePhone } from "@shared-core";

// Import constants
import { OrderType, ProductUnit } from "@shared-core";
```

### Specific Module Imports

```typescript
// GraphQL operations
import { brandQueries, categoryMutations } from "@shared-core/graphql";

// Utility functions
import { formatPrice } from "@shared-core/utils";
import { validatePhone } from "@shared-core/utils/validation";

// Constants
import { OrderType } from "@shared-core/constants";

// React hooks (app-specific)
import { useBrand, useCategory } from "@shared-core/hooks";
```

### Type-only Imports

```typescript
// Import only types (no runtime code)
import type { Brand, Category } from "@shared-core/types";
import type { BrandQuery, CategoryMutation } from "@shared-core/graphql";
```

## Package.json Exports Configuration

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./types": {
      "types": "./src/types/index.ts",
      "import": "./src/types/index.ts"
    },
    "./graphql": {
      "types": "./src/graphql/index.ts",
      "import": "./src/graphql/index.ts"
    },
    "./utils": {
      "types": "./src/utils/index.ts",
      "import": "./src/utils/index.ts"
    },
    "./constants": {
      "types": "./src/constants/index.ts",
      "import": "./src/constants/index.ts"
    },
    "./hooks": {
      "types": "./src/hooks/index.ts",
      "import": "./src/hooks/index.ts"
    },
    "./schema.graphqls": "./graphql/schema.graphqls"
  }
}
```

## Development Guidelines

### Adding New Shared Logic

1. **Identify Duplication**: Find similar code in both `web-admin` and `external-menu`
2. **Extract Pure Logic**: Remove app-specific dependencies (React, routing, etc.)
3. **Create Module**: Add to appropriate directory in `src/`
4. **Export**: Add to relevant `index.ts` files
5. **Document**: Add JSDoc comments and examples
6. **Test**: Create unit tests for shared logic

### Migration Strategy

#### Phase 1: Types and Constants

- Move shared TypeScript types
- Extract common constants and enums
- Update imports in both applications

#### Phase 2: GraphQL Operations

- Consolidate GraphQL fragments
- Share common queries and mutations
- Maintain app-specific operations locally

#### Phase 3: Utilities

- Extract pure utility functions
- Move validation logic
- Share data transformation utilities

#### Phase 4: React Hooks

- Extract app-agnostic hooks
- Keep app-specific hooks in applications
- Share common hook patterns

### Code Organization Rules

#### What Goes in shared-core:

- ✅ Pure TypeScript types and interfaces
- ✅ GraphQL fragments and operations
- ✅ Pure utility functions (no side effects)
- ✅ Constants and enums
- ✅ Data validation logic
- ✅ Data transformation utilities
- ✅ App-agnostic React hooks

#### What Stays in Applications:

- ❌ React components
- ❌ Routing logic
- ❌ State management (Redux, Zustand)
- ❌ API client configuration
- ❌ App-specific business logic
- ❌ UI/UX components
- ❌ Authentication logic

## Usage Examples

### Brand Domain

```typescript
// Types
import type { Brand, BrandInput } from "@shared-core";

// GraphQL operations
import { brandQueries } from "@shared-core/graphql";

// Utilities
import { formatBrandName, validateBrandSlug } from "@shared-core/utils";

// Constants
import { BrandStatus } from "@shared-core/constants";
```

### Product Domain

```typescript
// Types
import type { Product, ProductInput, ProductUnit } from "@shared-core";

// GraphQL operations
import { productQueries, productMutations } from "@shared-core/graphql";

// Utilities
import { formatPrice, calculateNutrition } from "@shared-core/utils";

// React hooks
import { useProduct, useProductVariants } from "@shared-core/hooks";
```

## Build and Development

### Development Setup

```bash
# Install dependencies
npm install

# Generate GraphQL types
npm run codegen

# Build library
npm run build

# Run tests
npm test
```

### Integration with Applications

```bash
# In web-admin or external-menu
npm install @shared-core

# Import and use
import { formatPrice } from '@shared-core';
```

## Versioning and Releases

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Breaking changes require major version bump
- New features use minor version bump
- Bug fixes use patch version bump
- Applications should pin to specific versions during migration

## Contributing

1. Identify code duplication between applications
2. Extract pure logic following guidelines above
3. Add comprehensive tests
4. Update documentation
5. Create migration guide for applications
6. Submit pull request with clear description

## Migration Checklist

For each piece of logic being moved to shared-core:

- [ ] Code is pure (no side effects)
- [ ] No app-specific dependencies
- [ ] Comprehensive tests added
- [ ] Documentation updated
- [ ] TypeScript types defined
- [ ] Exports configured in package.json
- [ ] Applications updated to use shared-core
- [ ] Old code removed from applications
