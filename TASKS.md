# TCG Collector Refactoring Tasks

## 1. Routing Implementation ✓
Completed: Manual page switching replaced with vue-router for improved code organization and user experience.

### Completed Subtasks ✓
- [x] Install and configure vue-router
- [x] Extract each page into its own component:
  - [x] CollectionPage.vue
  - [x] MarketPage.vue
  - [x] LookupPage.vue
  - [x] SetsPage.vue
  - [x] AboutPage.vue
  - [x] SettingsPage.vue
- [x] Set up route configurations
- [x] Update navigation to use router-link
- [x] Implement route guards for title management and future auth

## 2. Theme Management
Theme logic is currently scattered through App.vue and SettingsTheme.vue. This should be centralized and made reusable.

### Subtasks
- [ ] Create useAppTheme composable:
  - [ ] Dark mode toggle functionality
  - [ ] Palette management
  - [ ] Theme initialization
- [ ] Extract theme-related code from App.vue
- [ ] Update SettingsTheme.vue to use the composable
- [ ] Implement theme persistence in localStorage

## 3. State Management
As the app grows, centralized state management will become important. Current state is managed through component refs.

### Subtasks
- [ ] Set up Pinia stores:
  - [ ] CardStore
    - [ ] Move card loading logic
    - [ ] Move card state
    - [ ] Add card filtering/sorting
  - [ ] ThemeStore
    - [ ] Theme preferences
    - [ ] Palette settings
  - [ ] UserStore (future)
    - [ ] User preferences
    - [ ] Collection settings
- [ ] Update components to use stores
- [ ] Implement state persistence where needed

## 4. Component Structure
Some components have too many responsibilities and could be broken down further.

### Subtasks
- [ ] Break down CardGrid.vue:
  - [ ] Extract CardList component
  - [ ] Extract CardFilters component
  - [ ] Extract CardActions component
- [ ] Create reusable UI components:
  - [ ] LoadingOverlay
  - [ ] EmptyState
  - [ ] PageHeader
- [ ] Implement proper prop typing for all components

## 5. API Layer
While we have a cardService, we can further improve our backend API infrastructure.

### Subtasks
- [ ] Create base API client with axios:
  - [ ] Request/response interceptors
  - [ ] Error handling
  - [ ] Authentication handling
- [ ] Implement API response types for our endpoints
- [ ] Add request/response logging
- [ ] Add request caching where appropriate
- [ ] Standardize API response formats
- [ ] Add API versioning support

## 6. Pokémon TCG Integration
Integrate with the pokemontcg.io API through our backend to provide card information and pricing data.

### Subtasks
- [x] Initial Setup:
  - [x] Register for API key
  - [x] Set up GitHub Codespaces secret for API key
  - [x] Install pokemon-tcg-sdk-typescript in server
  - [x] Add API key to server environment configuration
- [ ] Server-Side Integration:
  - [x] Create PokemonTCGService class
  - [ ] Add card search endpoint
  - [ ] Add set information endpoint
  - [ ] Add price tracking endpoint
  - [ ] Implement server-side caching
- [ ] API Routes:
  - [ ] POST /api/pokemon/search (card search)
  - [ ] GET /api/pokemon/sets (list sets)
  - [ ] GET /api/pokemon/sets/:id (set details)
  - [ ] GET /api/pokemon/cards/:id (card details)
  - [ ] GET /api/pokemon/cards/:id/price (price history)
- [ ] Feature Implementation:
  - [ ] Card lookup by name/number
  - [ ] Set browsing and filtering
  - [ ] Price history tracking
  - [ ] Card image proxy
- [ ] UI Integration:
  - [ ] Update LookupPage to use new endpoints
  - [ ] Add price tracking to MarketPage
  - [ ] Enhance set completion tracking

## 7. Error Handling
Implement a consistent error handling strategy.

### Subtasks
- [ ] Create error handling utilities
- [ ] Implement global error boundary
- [ ] Add error reporting service
- [ ] Create user-friendly error components

## 8. Reference Data Management
Restructure the codebase to separate user data from reference data (scraped datasets) and implement proper data storage for server runtime datasets.

### Subtasks
- [x] Restructure folder organization:
  - [x] Create `server/data/` directory structure
  - [x] Organize services into `user/`, `reference/`, and `external/` folders
  - [x] Move types into domain-specific folders
  - [ ] Reorganize tests by domain
- [ ] Create reference data services:
  - [ ] ReferenceDataService for managing scraped data persistence
  - [ ] ExpansionDataService for expansion data CRUD operations
  - [ ] Cache management for scraped content
- [ ] Implement data persistence:
  - [ ] JSON storage for expansion data
  - [ ] Data versioning and migration support
  - [ ] Bootstrap commands to populate reference data
- [ ] Update existing services:
  - [ ] Move user-focused services to user domain
  - [ ] Update import paths throughout codebase
  - [ ] Add proper data separation in database services

## Priority Order
1. Theme Management (most isolated, good starting point) 🔜
2. ~~Routing Implementation~~ ✓ (Completed)
3. State Management (builds on routing, prepares for future features)
4. Component Structure (can be done incrementally)
5. API Layer (enhance our backend API infrastructure)
6. Pokémon TCG Integration (add card lookup and pricing features)
7. Error Handling (cross-cutting concern)
8. Reference Data Management (organize data architecture) 🔜

## Guidelines
- Each task should be completed in isolation when possible
- Changes should be tested thoroughly before moving to next task
- Maintain backward compatibility during refactoring
- Update documentation as changes are made
- Consider adding tests for new functionality
