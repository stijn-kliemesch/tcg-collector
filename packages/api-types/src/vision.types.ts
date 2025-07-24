/**
 * Vision and card recognition types
 * 
 * Note: These are simpler versions of the vision types for API communication.
 * The full vision types with more detailed interfaces remain in the vision package.
 */

export interface RecognizedText {
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RecognizedIcon {
  type: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CardRecognitionResult {
  textRegions: RecognizedText[];
  detectedIcons: RecognizedIcon[];
  detectedLanguages: string[];
  processingTime: number;
  imageMetadata: {
    width: number;
    height: number;
    format: string;
  };
}

export interface PokemonCardElement {
  type: 'pokemon_name' | 'hp' | 'attack_name' | 'attack_damage' | 'set_number' | 'energy_cost' | 'description' | 'unknown';
  originalText: string;
  correctedText: string;
  confidence: number;
  matchScore: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface PokemonCardAnalysis {
  pokemonName?: PokemonCardElement;
  hp?: PokemonCardElement;
  attacks: PokemonCardElement[];
  setNumber?: PokemonCardElement;
  energyCosts: PokemonCardElement[];
  otherElements: PokemonCardElement[];
  confidence: number;
  totalElementsFound: number;
}

export interface RecognitionOptions {
  languages?: string[];
  ocrMode?: 'auto' | 'single_column' | 'single_block' | 'single_line' | 'single_word';
  confidenceThreshold?: number;
  iconMatchThreshold?: number;
  enableIconDetection?: boolean;
  enhanceContrast?: boolean;
  denoise?: boolean;
  sharpen?: boolean;
  maxImageSize?: number;
}

// Extended types for the vision service
export interface VisionServiceConfig {
  defaultLanguages?: string[];
  iconTemplatePath?: string;
  defaultOptions?: Partial<RecognitionOptions>;
  preloadLanguages?: boolean;
}

export interface VisionError {
  type: 'INITIALIZATION_ERROR' | 'OCR_ERROR' | 'IMAGE_PROCESSING_ERROR' | 'VALIDATION_ERROR';
  message: string;
  originalError?: Error;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  multiScript?: boolean;
}

export interface IconTemplate {
  id: string;
  name: string;
  category: 'energy' | 'rarity' | 'type' | 'other';
}
