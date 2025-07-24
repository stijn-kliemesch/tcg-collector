import type { CardCondition, CardRarity, CardType } from '@tcg-collector/api-types';
/**
 * Application constants
 */
export declare const CARD_CONDITIONS: CardCondition[];
export declare const CARD_RARITIES: CardRarity[];
export declare const CARD_TYPES: CardType[];
export declare const SUPPORTED_IMAGE_FORMATS: string[];
export declare const MAX_IMAGE_SIZE: number;
export declare const API_LIMITS: {
    DEFAULT_PAGE_SIZE: number;
    MAX_PAGE_SIZE: number;
    MAX_SEARCH_RESULTS: number;
};
export declare const RECOGNITION_DEFAULTS: {
    CONFIDENCE_THRESHOLD: number;
    OCR_TIMEOUT: number;
    MAX_IMAGE_DIMENSION: number;
};
