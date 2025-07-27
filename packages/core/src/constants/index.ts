import type {
  CardCondition,
  CardRarity,
  CardType,
} from '@tcg-collector/api-types';

/**
 * Application constants
 */

export const CARD_CONDITIONS: CardCondition[] = [
  'Mint',
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
];

export const CARD_RARITIES: CardRarity[] = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Secret',
  'Rare Rainbow',
  'Promo',
];

export const CARD_TYPES: CardType[] = ['Pokémon', 'Trainer', 'Energy'];

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const API_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_SEARCH_RESULTS: 1000,
};

export const RECOGNITION_DEFAULTS = {
  CONFIDENCE_THRESHOLD: 35,
  OCR_TIMEOUT: 30000, // 30 seconds
  MAX_IMAGE_DIMENSION: 2048,
};
