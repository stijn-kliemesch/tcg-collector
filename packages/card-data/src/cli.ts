#!/usr/bin/env tsx

/**
 * CLI entry point for the card-data package
 * Usage: npx @tcg-collector/card-data [options]
 */

import bootstrap from './bootstrap.js';
import { parseArgs } from 'util';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'output-dir': {
      type: 'string',
      short: 'o',
      default: './data',
    },
    'no-sets': {
      type: 'boolean',
      default: false,
    },
    'quiet': {
      type: 'boolean',
      short: 'q',
      default: false,
    },
    'help': {
      type: 'boolean',
      short: 'h',
      default: false,
    },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
Usage: npx @tcg-collector/card-data [options]

Options:
  -o, --output-dir <dir>    Output directory for data files (default: ./data)
  --no-sets                 Skip set data bootstrapping (only fetch expansions)
  -q, --quiet               Suppress verbose output
  -h, --help                Show this help message

Examples:
  npx @tcg-collector/card-data
  npx @tcg-collector/card-data -o ./my-data
  npx @tcg-collector/card-data --no-sets --quiet
`);
  process.exit(0);
}

bootstrap({
  outputDir: values['output-dir'],
  includeSets: !values['no-sets'],
  verbose: !values.quiet,
}).catch((error: Error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
