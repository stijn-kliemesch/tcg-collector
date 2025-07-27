#!/usr/bin/env node

/**
 * Bootstrap script to populate reference data
 * Usage: npm run bootstrap
 */

import { ExpansionService } from '../services/reference/expansion.service.js';
import { SetService } from '../services/reference/set.service.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  console.log('🚀 Starting reference data bootstrap...\n');

  try {
    // Create data directories if they don't exist
    const dataDir = join(process.cwd(), 'data', 'reference');
    mkdirSync(dataDir, { recursive: true });

    // Bootstrap expansions
    console.log('📦 Fetching expansion data...');
    const expansionService = new ExpansionService();
    const expansions = await expansionService.getExpansions();

    // Store to JSON file
    const expansionFile = join(dataDir, 'expansions.json');
    const referenceData = {
      expansions,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };

    writeFileSync(expansionFile, JSON.stringify(referenceData, null, 2));

    console.log(`✅ Successfully bootstrapped ${expansions.length} expansions`);
    console.log(`📁 Data stored in: ${expansionFile}`);

    // Bootstrap sets for Pokemon Trading Card Game expansion
    console.log('\n🎯 Fetching set data for Pokemon Trading Card Game...');
    const setService = new SetService();

    // Find the Pokemon Trading Card Game expansion
    const pokemonTcgExpansion = expansions.find(
      exp => exp.name === 'Pokémon Trading Card Game'
    );

    if (pokemonTcgExpansion && pokemonTcgExpansion.link) {
      const setData = await setService.scrapeSets(pokemonTcgExpansion.link);

      // Store sets data
      const setsFile = join(dataDir, 'sets.json');
      const setsReferenceData = {
        expansionName: setData.expansionName,
        groups: setData.groups,
        totalSets: setData.totalSets,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      };

      writeFileSync(setsFile, JSON.stringify(setsReferenceData, null, 2));

      console.log(`✅ Successfully bootstrapped ${setData.totalSets} sets`);
      console.log(`📁 Data stored in: ${setsFile}`);

      // Display sets summary
      console.log('\n📊 Sets Summary:');
      console.log('─'.repeat(50));
      setData.groups.forEach(group => {
        console.log(`${group.name}:`);
        group.generations.forEach(generation => {
          console.log(`  ${generation.name}: ${generation.sets.length} sets`);
          // Show first few sets as examples
          generation.sets.slice(0, 2).forEach(set => {
            console.log(`    - ${set.name}`);
          });
          if (generation.sets.length > 2) {
            console.log(`    ... and ${generation.sets.length - 2} more`);
          }
        });
      });
    } else {
      console.log(
        '⚠️ Pokemon Trading Card Game expansion not found or missing link - skipping sets bootstrap'
      );
    }

    // Display expansions summary
    console.log('\n📊 Expansions Summary:');
    console.log('─'.repeat(50));
    expansions.forEach((exp, index) => {
      console.log(
        `${index + 1}. ${exp.name} (${exp.languages.join(', ')}) - ${exp.cardSetCount + exp.promoSetCount} sets`
      );
    });

    console.log('\n🎉 Bootstrap completed successfully!');
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

// Run bootstrap if this file is executed directly
if (process.argv[1].includes('bootstrap')) {
  bootstrap();
}
