# TCG Collector

An application for managing your trading card game collection.

## Features

- Easy-to-use interface with dark/light theme support
- Mobile-friendly design with collapsible menu
- Comprehensive card collection management
- Data persistence to keep your collection safe

### Coming Soon
- Market price monitoring
- Card information lookup
- Set management tools
- Trading features

## Project Overview

The application consists of two main parts:
- A web interface where you manage your collection
- A local server that safely stores your data

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure local environment:**
   Create `.env.local` files in both client and server directories:
   
   client/.env.local:
   ```
   VITE_API_URL=http://localhost:3000
   ```

   server/.env.local:
   ```
   PORT=3000
   ```

3. **Start the application:**
   ```bash
   npm start
   ```
   This will start both the web interface and the data server.

## Current Features

### Collection Management
- View your card collection in an organized table
- Load example cards to see how the system works
- Clear your collection data when needed
- All changes are automatically saved

### Coming Soon
- Card market price tracking
- Detailed card information lookup
- Set collection tracking
- Trading features