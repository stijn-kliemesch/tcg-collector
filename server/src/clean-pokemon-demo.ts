#!/usr/bin/env node

/**
 * Clean demonstration of Pokemon card recognition capabilities
 *
 * This script replaces the various test scripts from our development adventure
 * with a clean, organized demonstration of the Pokemon card recognition services.
 *
 * Usage: npx tsx clean-pokemon-demo.ts [path-to-card-image]
 */

import { runPokemonCardDemo } from './services/pokemon-card-demo.service.js';

async function main() {
  const imagePath = process.argv[2]; // Optional image path argument

  console.log('🚀 Starting Pokemon Card Recognition Demo');
  console.log(
    'This demonstrates all the capabilities we built during our adventure!\n'
  );

  await runPokemonCardDemo(imagePath);

  console.log('\n📚 This demo showcases:');
  console.log('  • Smart OCR with Pokemon-specific corrections');
  console.log('  • Intelligent text classification and analysis');
  console.log('  • Fuzzy matching for card elements');
  console.log('  • Confidence scoring and candidate ranking');
  console.log('  • Clean, reusable service architecture');
  console.log(
    '\n✨ All the experimental scripts have been organized into proper services!'
  );
}

main().catch(console.error);
