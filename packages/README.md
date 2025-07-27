# TCG Collector Packages

This directory contains the modular packages that make up the TCG Collector application. This architecture provides:

- **Code Reuse**: Shared logic between client and server
- **Modularity**: Clear separation of concerns
- **Type Safety**: Consistent types across the entire application
- **Maintainability**: Easier to manage and update individual features

## Package Structure

### 📦 `@tcg-collector/api-types`

**Shared API types and interfaces**

- All TypeScript interfaces for API communication
- Data models for cards, collections, users
- Request/response types
- Shared between client and server to ensure consistency

### 📦 `@tcg-collector/core`

**Core business logic and utilities**

- Validation functions
- Utility classes (StringUtils, DateUtils, etc.)
- Application constants
- Business logic that's shared between client and server

### 📦 `@tcg-collector/vision`

**Computer vision and OCR services**

- Pokemon card recognition services
- OCR processing and text analysis
- Image preprocessing utilities
- Currently used by server, could be used by client for offline processing

## Usage

### In Server Code

```typescript
import { CardRecognitionService } from '@tcg-collector/vision';
import { Validator } from '@tcg-collector/core';
import type { Card, ApiResponse } from '@tcg-collector/api-types';
```

### In Client Code

```typescript
import { StringUtils, DateUtils } from '@tcg-collector/core';
import type { Collection, User } from '@tcg-collector/api-types';
```

## Benefits of This Architecture

### 🔄 **No Code Duplication**

- Types are defined once and used everywhere
- Validation logic is shared between client and server
- Utilities are reusable across all applications

### 🎯 **Type Safety**

- Consistent interfaces ensure client and server always agree
- Changes to types are automatically reflected everywhere
- Prevents API mismatches during development

### 📚 **Clear Dependencies**

- Each package has clearly defined responsibilities
- Dependencies flow in one direction (no circular references)
- Easy to understand what code belongs where

### 🚀 **Independent Development**

- Teams can work on different packages simultaneously
- Packages can be versioned and released independently
- Clear API boundaries between modules

### 🧪 **Easier Testing**

- Business logic can be tested independently
- Mock implementations are easier to create
- Unit tests are more focused and isolated

## Development Workflow

### Building Packages

```bash
# Build all packages
npm run build:packages

# Watch for changes during development
npm run watch:packages
```

### Adding New Packages

1. Create new directory in `packages/`
2. Add `package.json` with workspace dependency syntax
3. Add TypeScript configuration
4. Update root workspace configuration

### Package Dependencies

- Use `workspace:*` for local package dependencies
- External dependencies go in each package's `package.json`
- Keep dependencies minimal and focused

## Future Packages

As the application grows, we can add more packages:

- `@tcg-collector/ui-components` - Shared React components
- `@tcg-collector/database` - Database models and migrations
- `@tcg-collector/auth` - Authentication and authorization logic
- `@tcg-collector/notifications` - Email/push notification services
- `@tcg-collector/analytics` - Analytics and tracking utilities

## Migration Guide

### From Existing Code

When moving existing code into packages:

1. **Identify Shared Code**: Look for code duplicated between client/server
2. **Extract Types First**: Move shared interfaces to `api-types`
3. **Move Utilities**: Extract reusable functions to `core`
4. **Update Imports**: Change imports to use the new packages
5. **Test Everything**: Ensure all functionality still works

### Example Migration

```typescript
// Before (duplicated in client and server)
interface Card {
  id: string;
  name: string;
  // ...
}

// After (in @tcg-collector/api-types)
export interface Card {
  id: string;
  name: string;
  // ...
}

// Usage
import type { Card } from '@tcg-collector/api-types';
```

This modular architecture sets up your project for long-term success and maintainability! 🎉
