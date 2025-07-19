# TCG Collector

A Vue 3 + TypeScript application for collecting and managing trading cards.

## Features

- Built with Vue 3 and TypeScript
- Vite for fast development and building
- Type-safe components and state management
- Modern ES modules
- Hot Module Replacement (HMR)
- Component-based architecture

## Project Structure

```
tcg-collector/
├── src/
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── components/      # Vue components
│   ├── App.vue         # Root Vue component
│   ├── main.ts         # Application entry point
│   └── env.d.ts        # TypeScript declarations
├── public/             # Public static assets
├── index.html          # Entry HTML file
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── tsconfig.config.json # TypeScript config for config files
├── vite.config.ts     # Vite configuration
└── README.md          # This file
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   This will start the Vite dev server with hot module replacement.

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

4. **Serve the application:**
   ```bash
   npm run serve
   ```
   This will start a local server at http://localhost:8080

5. **Build and serve in one command:**
   ```bash
   npm start
   ```

## Development Workflow

1. Run `npm run dev` to start the development server
2. Make changes to files in the `src/` directory
3. Changes will be automatically reflected in the browser

## Browser Compatibility

This project requires a modern browser that supports ES2020 features.
- Template literals
- Async/await

## Customization

- Add components in the `src/components/` directory
- Add static assets to the `public/` directory
- Modify `src/App.vue` for application-wide changes