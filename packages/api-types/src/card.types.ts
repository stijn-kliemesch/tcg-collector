/**
 * Core card-related types shared between client and server
 */

export interface Card {
  id: string;
  name: string;
  set: string;
  setNumber: string;
  rarity: CardRarity;
  type: CardType;
  subtypes: string[];
  hp?: number;
  retreatCost?: number;
  convertedEnergyCost?: number;
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  image?: CardImage;
  prices?: CardPrices;
  legalities?: CardLegalities;
}

export interface Attack {
  name: string;
  cost: string[];
  damage?: string;
  text?: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface CardImage {
  small?: string;
  large?: string;
  original?: string;
}

export interface CardPrices {
  average?: number;
  low?: number;
  high?: number;
  market?: number;
  directLow?: number;
  updated?: string;
}

export interface CardLegalities {
  standard?: string;
  expanded?: string;
  unlimited?: string;
}

export type CardRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Rare Holo'
  | 'Rare Holo EX'
  | 'Rare Holo GX'
  | 'Rare Holo V'
  | 'Rare Holo VMAX'
  | 'Rare Secret'
  | 'Rare Rainbow'
  | 'Promo';

export type CardType = 'Pokémon' | 'Trainer' | 'Energy';

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}
