# @tcg-collector/card-data

A comprehensive card data bootstrapping package for Pokemon Trading Card Game. This package provides services and utilities for fetching, processing, and organizing Pokemon TCG expansion and set data during build time.

## Features

- **Expansion Data**: Fetch comprehensive expansion information from Bulbapedia
- **Set Data**: Scrape and organize Pokemon TCG set data using hardcoded structure
- **TypeScript-First**: Direct TypeScript execution without build step
- **CLI Support**: Command-line interface for standalone usage
- **Structured Output**: Clean JSON output with proper typing

## Installation

```bash
npm install @tcg-collector/card-data
```

## Usage

### Programmatic Usage

```typescript
import bootstrap, {
  ExpansionService,
  SetService,
} from '@tcg-collector/card-data';

// Full bootstrap
const result = await bootstrap({
  outputDir: './data',
  includeSets: true,
  verbose: true,
});

// Individual services
const expansionService = new ExpansionService();
const expansions = await expansionService.getExpansions();

const setService = new SetService();
const setData = await setService.scrapeSets(expansions[0].link);
```

### CLI Usage

```bash
# Bootstrap all data
npx @tcg-collector/card-data

# Specify output directory
npx @tcg-collector/card-data -o ./my-data

# Skip set data (expansions only)
npx @tcg-collector/card-data --no-sets

# Quiet mode
npx @tcg-collector/card-data --quiet
```

### NPM Scripts

```bash
# Run bootstrap
npm run bootstrap

# Run tests
npm test
```

## Output Structure

The package generates the following files:

- `expansions.json`: Complete expansion data with metadata
- `sets.json`: Structured set data organized by groups and generations

## Architecture

This package follows the TypeScript-only directive from the main project:

- No build step required
- Direct TypeScript execution using `tsx`
- Source files consumed directly
- No `dist` folder generation

## Types

The package exports comprehensive TypeScript types for all data structures:

- `Expansion`: Individual expansion information
- `SetData`: Complete set data structure
- `BootstrapOptions`: Configuration options
- `BootstrapResult`: Bootstrap operation results

## Development

```bash
# Install dependencies
npm install

# Run bootstrap
npm run bootstrap

# Run tests
npm test
```

## License

Part of the TCG Collector project.
