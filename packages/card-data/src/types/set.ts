/**
 * Core types for Pokemon TCG Set data structures
 */

export interface Set {
  name: string;
  link?: string;
}

export interface Generation {
  name: string;
  sets: Set[];
}

export interface SetGroup {
  name: string; // "International sets" or "Japanese sets"
  generations: Generation[];
}

export interface SetData {
  expansionName: string;
  groups: SetGroup[];
  totalSets: number;
}

export interface SetDataFile {
  expansionName: string;
  groups: SetGroup[];
  totalSets: number;
  lastUpdated: string;
  version: string;
}

/**
 * Type definitions for the hardcoded set structure
 */
export type SetStructureValue =
  | string
  | SetStructureObject
  | (string | SetStructureObject)[];

export interface SetStructureObject {
  [key: string]: SetStructureValue;
}

export interface SetStructure {
  'International sets': SetStructureObject;
  'Japanese sets': SetStructureObject;
}

/**
 * Configuration types
 */
export interface SetServiceConfig {
  baseUrl: string;
  requestTimeout?: number;
  retryAttempts?: number;
}

/**
 * Bootstrap configuration
 */
export interface BootstrapConfig {
  outputDir: string;
  expansionFileName?: string;
  setsFileName?: string;
  targetExpansion?: string;
  version?: string;
}
