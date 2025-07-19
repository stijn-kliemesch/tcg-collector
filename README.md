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

1. Edit TypeScript files in the `src/` directory
2. Run `npm run dev` to watch for changes and auto-compile
3. Open `dist/index.html` in your browser or use `npm run serve`
4. The compiled JavaScript will be generated in the `dist/` directory

## TypeScript Features Demonstrated

- Classes with private/public methods
- Type annotations and interfaces
- Namespaces for utility functions
- Generic functions
- Strict null checks
- DOM manipulation with proper typing
- Error handling

## Browser Compatibility

This project uses ES2020 features and requires a modern browser that supports:
- ES modules
- Arrow functions
- Classes
- Template literals
- Async/await

## Customization

- Modify `src/index.ts` to add your application logic
- Update `dist/styles.css` for styling changes
- Edit `dist/index.html` for structure modifications
- Adjust `tsconfig.json` for TypeScript compiler options