# TCG Collector Server

A Node.js/TypeScript server for managing Pokemon Trading Card Game collection data. This server provides APIs for the TCG Collector web application and handles reference data scraping.

## Project Structure

```
server/
├── data/                  # Generated data files and user collections
│   ├── reference/         # Scraped reference data (expansions, sets, etc.)
│   └── user/              # User collection data
├── src/                   # Source code
│   ├── data/              # Static data and hardcoded structures
│   │   └── reference/     # Pokemon TCG set structures
│   ├── routes/            # Express route handlers
│   ├── scripts/           # Utility and bootstrap scripts
│   ├── services/          # Business logic services
│   │   ├── external/      # External API integrations
│   │   ├── reference/     # Reference data services (expansions, sets, etc.)
│   │   └── user/          # User data services
│   ├── tests/             # Test files
│   ├── types/             # TypeScript type definitions
│   │   └── reference/     # Reference data types
│   └── utils/             # Utility classes and functions
└── dist/                  # Compiled JavaScript output
```

## Architecture Decisions

### API Design
- **Internal API Only**: The server's API is designed exclusively to serve the front-end from this same project. It is not intended as a public API for external consumers.
- **RESTful Endpoints**: Uses standard REST conventions for resource management.
- **JSON Communication**: All API endpoints consume and produce JSON data.

### Code Organization
- **No Barrel Files**: Explicit decision to avoid `index.ts` barrel files for re-exports. All imports must be direct to specific files for better clarity, tree-shaking, and debugging.
- **Service Layer Pattern**: Business logic is organized into service classes with single responsibilities.
- **Type-First Approach**: TypeScript interfaces and types are defined in dedicated files before implementation.

### Data Management
- **Hardcoded Reference Data**: Pokemon TCG set structures are maintained as hardcoded data rather than dynamic scraping for reliability and performance.
- **File-Based Storage**: Uses JSON files with LowDB for simple, lightweight data persistence.
- **Singleton Pattern**: Database services use singleton pattern for consistent state management.

## Code Conventions

### Naming Conventions

#### Case Conventions
- **Files**: kebab-case (e.g., `set.service.ts`, `pokemon-tcg-structure.ts`)
- **Classes**: PascalCase (e.g., `SetService`, `DatabaseService`)
- **Functions/Variables**: camelCase (e.g., `scrapeSets`, `expansionData`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `POKEMON_TCG_SET_STRUCTURE`)
- **Types/Interfaces**: PascalCase (e.g., `SetData`, `Generation`)

#### Semantic Naming Conventions
- **Class Names**: `DomainNoun + TechnicalPurpose`
  - Examples: `SetService`, `ExpansionService`, `CardExtractor`, `LinkFinder`
  - Pattern: Entity or concept + what it does technically
  
- **Type/Interface Names**: `DomainNoun` or `DomainNoun + Descriptor`
  - Examples: `Set`, `Generation`, `SetData`, `ServiceConfig`
  - Pattern: The thing being described, optionally with clarifying descriptor
  
- **Function Names (Mutators)**: `verb + Target` 
  - Examples: `scrapeCards`, `addCard`, `updateExpansion`, `extractSets`
  - Pattern: Action word + what is being acted upon
  
- **Function Names (Queries)**: `get/find/is + Target` or `Target + Predicate`
  - Examples: `getAllCards`, `findSetLink`, `isValidSet`, `setExists`
  - Pattern: Query word + target, or target + boolean question
  
- **Variable Names**: `target` or `target + Context`
  - Examples: `card`, `expansionData`, `setIndex`, `responseBody`
  - Pattern: The thing itself, or the thing with clarifying context

### Import Conventions
- **Explicit Imports**: Always import from specific files, never from directory indexes
  ```typescript
  // ✅ Good
  import { SetService } from './services/reference/set.service.ts'
  
  // ❌ Avoid
  import { SetService } from './services/reference'
  ```
- **Type-Only Imports**: Use `import type` for TypeScript types when they're only used for typing
  ```typescript
  import type { SetData } from '../types/reference/set.ts'
  ```
- **ES Module Extensions**: Include `.js` extensions in import paths for ES module compatibility

### Service Architecture
- **Single Responsibility**: Each service handles one specific domain (sets, expansions, user data)
- **Configuration Objects**: Services accept configuration objects for flexibility
- **Error Handling**: Consistent error handling with descriptive messages
- **Logging**: Use centralized Logger utility with emoji prefixes for visual clarity

### Type Definitions
- **Separate Type Files**: Types are defined in dedicated files under `src/types/`
- **Interface Over Type**: Prefer `interface` over `type` for object shapes
- **Explicit Return Types**: All public methods have explicit return type annotations

## Key Services

### Reference Data Services
- **ExpansionService**: Scrapes Pokemon TCG expansion information from Bulbapedia
- **SetService**: Processes Pokemon TCG set data using hardcoded structures (411 sets total)
- **ReferenceDataService**: Manages caching and persistence of reference data

### User Data Services
- **DatabaseService**: Handles user collection CRUD operations
- **Card Management**: Add, update, delete, and search user's card collections

### Utility Services
- **Logger**: Centralized logging with emoji-based visual indicators
- **SetExtractor**: Processes hardcoded set structures for data extraction
- **SetLinkFinder**: Handles Wikipedia link discovery and matching

## Development Guidelines

### For AI Agents Working on This Project

1. **Respect the No-Barrel-Files Decision**: Never create `index.ts` files for re-exports. Always use direct imports.

2. **Follow the Service Pattern**: New functionality should be organized into focused service classes with clear single responsibilities.

3. **Type Safety First**: Define TypeScript interfaces in `src/types/` before implementing functionality.

4. **Maintain Hardcoded Structures**: The Pokemon TCG set data in `src/data/reference/pokemon-tcg-structure.ts` should be maintained as hardcoded data, not dynamically scraped.

5. **Use Existing Utilities**: Leverage the Logger and utility classes for consistency.

6. **API is Internal Only**: Don't add authentication, rate limiting, or other public API concerns. The API serves only the companion front-end application.

7. **File Organization**: Keep the established directory structure. Don't create new top-level directories without explicit need.

8. **Import Paths**: Always use explicit file paths with `.js` extensions for ES module compatibility.

## Getting Started

```bash
# Install dependencies
npm install

# Bootstrap reference data
npm run bootstrap

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The server will start on port 3000 (or PORT environment variable) and serve the TCG Collector API endpoints.
