# TCG Collector

A comprehensive Pokemon Trading Card Game collection management application with reference data scraping and user collection tracking.

## Features

- **Comprehensive Reference Data**: Complete Pokemon TCG set database with 411 sets across all generations
- **Collection Management**: Add, edit, delete, and search your personal card collection
- **Reference Data Scraping**: Automated scraping of Pokemon TCG expansion and set information
- **Clean Architecture**: Modern TypeScript/Node.js backend with Vue.js frontend
- **Local Data Storage**: File-based persistence with no external database dependencies

## Project Architecture

The application consists of two main components:

### Server (`/server`)

- **Node.js/TypeScript backend** with Express.js API
- **Reference data services** for Pokemon TCG expansions and sets (411 total sets)
- **User collection management** with full CRUD operations
- **Wikipedia scraping** for comprehensive Pokemon TCG data
- **File-based storage** using LowDB for simplicity

### Client (`/client`)

- **Vue.js frontend** with modern UI/UX
- **Collection management interface** for user's cards
- **Reference data browsing** for Pokemon TCG sets and expansions
- **Mobile-friendly responsive design**

### Packages (`/packages`)

- **Shared TypeScript modules** with native .ts imports (no build step)
- **API Types**: Type definitions shared between client and server
- **Core**: Business logic utilities and validation
- **Vision**: Computer vision services for card recognition

### Project Documentation

- **ARCHITECTURE.md**: Detailed technical architecture and native TypeScript setup
- **TASKS.md**: Development task list and feature roadmap
- **packages/README.md**: Modular package architecture guide

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation & Setup

Note: Each command below assumed your CWD (Current Working Directory) is in the root of the project.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   If you're not running this from a Github Codespace, configure your environment variables.

   Create `.env.local` files in both directories:

   **client/.env.local:**

   ```
   VITE_API_URL=http://localhost:3000/api
   ```

   **server/.env.local:**

   ```
   PORT=3000
   ```

3. **Bootstrap reference data:**

   Optional: the reference data is present in the git stored codebase, but you can update it by bootstrapping.

   ```bash
   cd server
   npm run bootstrap
   ```

   This scrapes and stores Pokemon TCG reference data (expansions and sets).

4. **Start the application:**

   ```bash
   npm start
   ```

   This starts both the server (port 3000) and client (port 5173).

## Current Features

### Reference Data Management

- **8 Pokemon TCG Expansions** with comprehensive metadata
- **411 Pokemon TCG Sets** across all generations (International + Japanese)
- **Automated scraping** from reliable sources with link discovery
- **Hardcoded set structures** for reliability and performance
- **Bootstrap script** for easy reference data setup

### User Collection Management

- **Add/Edit/Delete cards** in your personal collection
- **Search and filter** your collection by name, set, or tags
- **Card details tracking** including condition, quantity, and notes
- **Persistent storage** with automatic data saving
- **Collection statistics** and organization tools

### Technical Features

- **TypeScript throughout** for type safety and better developer experience
- **Service-oriented architecture** with clear separation of concerns
- **Direct imports** (no barrel files) for better tree-shaking and debugging
- **Comprehensive error handling** and logging
- **Modern ES modules** with proper import conventions

## Development

### Server Development

See detailed documentation in `/server/README.md` including:

- Architecture decisions and explicit conventions
- Semantic naming guidelines for consistent code
- Service patterns and development guidelines
- AI agent instructions for future development

### Key Technologies

- **Backend**: Node.js, TypeScript, Express.js, Cheerio, Axios
- **Frontend**: Vue.js, TypeScript, Vite
- **Data**: LowDB (JSON file-based), hardcoded Pokemon TCG structures
- **Scraping**: Wikipedia/Bulbapedia integration with smart link matching

### Project Status

- 🔄 **Reference Data**: Complete Pokemon TCG database (411 sets) in progress
- 🔄 **Collection Management**: Full CRUD operations for user cards in progress
- 🔄 **Frontend Enhancement**: UI/UX improvements in progress
- ✅ **Documentation**: Comprehensive development guidelines

### Future Enhancements

- Implemented Collection Management
- Card information lookup system
- Card market price tracking and monitoring
- Advanced collection analytics and insights
- Set completion tracking and progress
- Trading and marketplace features
- Mobile app development
- Additional TCG support beyond Pokemon
