# TCG Collector Refactoring Tasks

## 1. Routing Implementation
Currently, the app uses manual page switching with v-if statements. Moving to a proper routing system would improve code organization and user experience.

### Subtasks
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
- [x] Implement route guards if needed

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
While we have a cardService, we can further improve the API layer.

### Subtasks
- [ ] Create base API client with axios:
  - [ ] Request/response interceptors
  - [ ] Error handling
  - [ ] Authentication handling
- [ ] Implement API response types
- [ ] Add request/response logging
- [ ] Add request caching where appropriate

## 6. Error Handling
Implement a consistent error handling strategy.

### Subtasks
- [ ] Create error handling utilities
- [ ] Implement global error boundary
- [ ] Add error reporting service
- [ ] Create user-friendly error components

## Priority Order
1. Theme Management (most isolated, good starting point)
2. Routing Implementation (significant impact on code organization)
3. State Management (builds on routing, prepares for future features)
4. Component Structure (can be done incrementally)
5. API Layer (enhance existing service)
6. Error Handling (cross-cutting concern)

## Guidelines
- Each task should be completed in isolation when possible
- Changes should be tested thoroughly before moving to next task
- Maintain backward compatibility during refactoring
- Update documentation as changes are made
- Consider adding tests for new functionality
