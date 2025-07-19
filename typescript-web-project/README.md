# TypeScript Web Project

A modern TypeScript web application with a clean project structure and development workflow.

## Features

- TypeScript with strict type checking
- Modern ES2020 modules
- CSS styling with gradients and animations
- Interactive button with click counter
- Utility functions and namespaces
- Source maps for debugging
- Hot reload development workflow

## Project Structure

```
typescript-web-project/
├── src/
│   └── index.ts          # Main TypeScript source file
├── dist/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── index.js          # Compiled JavaScript (generated)
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Getting Started

1. **Install dependencies:**
   ```bash
   cd typescript-web-project
   npm install
   ```

2. **Development mode (with file watching):**
   ```bash
   npm run dev
   ```
   This will compile TypeScript files automatically when you make changes.

3. **Build the project:**
   ```bash
   npm run build
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