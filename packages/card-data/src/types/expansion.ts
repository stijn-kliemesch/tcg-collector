/**
 * Core types for Pokemon Trading Card Game expansion data
 */

export interface Expansion {
  name: string;
  link: string;
  languages: string[];
  cardSetCount: number;
  promoSetCount: number;
}

export interface ExpansionData {
  expansions: Expansion[];
  lastUpdated: string;
  version: string;
}
