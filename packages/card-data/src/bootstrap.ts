#!/usr/bin/env node

/**
 * Card Data Bootstrap
 * 
 * This script bootstraps the Pokemon Trading Card Game reference data
 * by fetching expansion and set information from Bulbapedia.
 * 
 * Usage: npm run bootstrap
 */

import { ExpansionService } from './services/expansion.service.js';
import { SetService } from './services/set.service.js';
import { Logger } from './utils/logger.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface BootstrapOptions {
  outputDir?: string;
  includeSets?: boolean;
  verbose?: boolean;
}

export interface BootstrapResult {
  expansions: any[];
  sets?: any;
  outputFiles: string[];
}

/**
 * Bootstrap reference data for Pokemon Trading Card Game
 */
async function bootstrap(options: BootstrapOptions = {}): Promise<BootstrapResult> {
  const { 
    outputDir = join(process.cwd(), 'data'), 
    includeSets = true, 
    verbose = true 
  } = options;

  if (verbose) {
    Logger.progress('Starting Pokemon TCG card data bootstrap...\n');
  }

  const outputFiles: string[] = [];

  try {
    // Create output directories if they don't exist
    mkdirSync(outputDir, { recursive: true });

    // Bootstrap expansions
    if (verbose) {
      Logger.data('Fetching expansion data...');
    }
    const expansionService = new ExpansionService();
    const expansions = await expansionService.getExpansions();

    // Store expansions to JSON file
    const expansionFile = join(outputDir, 'expansions.json');
    const expansionData = {
      expansions,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };

    writeFileSync(expansionFile, JSON.stringify(expansionData, null, 2));
    outputFiles.push(expansionFile);

    if (verbose) {
      Logger.success(`Successfully bootstrapped ${expansions.length} expansions`);
      Logger.file(`Data stored in: ${expansionFile}`);
    }

    let setData;
    if (includeSets) {
      // Bootstrap sets for Pokemon Trading Card Game expansion
      if (verbose) {
        Logger.target('\nFetching set data for Pokemon Trading Card Game...');
      }
      const setService = new SetService();

      // Find the Pokemon Trading Card Game expansion
      const pokemonTcgExpansion = expansions.find(
        exp => exp.name === 'Pokémon Trading Card Game'
      );

      if (pokemonTcgExpansion && pokemonTcgExpansion.link) {
        setData = await setService.scrapeSets(pokemonTcgExpansion.link);

        // Store sets data
        const setsFile = join(outputDir, 'sets.json');
        const setsReferenceData = {
          expansionName: setData.expansionName,
          groups: setData.groups,
          totalSets: setData.totalSets,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
        };

        writeFileSync(setsFile, JSON.stringify(setsReferenceData, null, 2));
        outputFiles.push(setsFile);

        if (verbose) {
          Logger.success(`Successfully bootstrapped ${setData.totalSets} sets`);
          Logger.file(`Data stored in: ${setsFile}`);

          // Display sets summary
          Logger.info('\n📊 Sets Summary:');
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
        }
      } else {
        if (verbose) {
          Logger.warn(
            'Pokemon Trading Card Game expansion not found or missing link - skipping sets bootstrap'
          );
        }
      }
    }

    if (verbose) {
      // Display expansions summary
      Logger.info('\n📊 Expansions Summary:');
      console.log('─'.repeat(50));
      expansions.forEach((exp, index) => {
        console.log(
          `${index + 1}. ${exp.name} (${exp.languages.join(', ')}) - ${exp.cardSetCount + exp.promoSetCount} sets`
        );
      });

      Logger.celebrate('\nBootstrap completed successfully!');
    }

    return {
      expansions,
      sets: setData,
      outputFiles,
    };
  } catch (error) {
    Logger.error('Bootstrap failed:', error);
    throw error;
  }
}

// Run bootstrap if this file is executed directly
if (process.argv[1].endsWith('bootstrap.ts') || process.argv[1].endsWith('bootstrap.js')) {
  bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default bootstrap;
