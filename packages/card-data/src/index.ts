/**
 * @tcg-collector/card-data
 *
 * A comprehensive card data bootstrapping package for Pokemon Trading Card Game.
 * Provides services and utilities for fetching, processing, and organizing
 * Pokemon TCG expansion and set data during build time.
 */

// Main bootstrap function
export { default as bootstrap } from './bootstrap.js';
export type { BootstrapOptions, BootstrapResult } from './bootstrap.js';

// Services
export { ExpansionService } from './services/expansion.service.js';
export { SetService } from './services/set.service.js';

// Types
export type { Expansion, ExpansionData } from './types/expansion.js';
export type {
  Generation,
  Set,
  SetData,
  SetGroup,
  SetServiceConfig,
  SetStructure,
} from './types/set.js';

// Utilities
export { Logger } from './utils/logger.js';
export {
  SetExtractor,
  SetLinkFinder,
  SetNameCleaner,
} from './utils/set-processing.js';

// Data
export { POKEMON_TCG_SET_STRUCTURE } from './data/pokemon-tcg-structure.js';
