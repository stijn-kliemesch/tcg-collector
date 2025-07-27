/**
 * TypeScript interfaces for computer vision card recognition results
 *
 * @author AI Agent
 * @semantic Vision recognition result types and configuration interfaces
 */

/**
 * Represents a single recognized text region with position and confidence
 */
export interface RecognizedText {
  /** The recognized text content */
  text: string;
  /** OCR confidence score (0-100) */
  confidence: number;
  /** Bounding box coordinates of the text region */
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Detected language of this text region (optional) */
  language?: string;
}

/**
 * Represents a detected icon with template matching results
 */
export interface RecognizedIcon {
  /** Unique identifier for the icon template */
  iconId: string;
  /** Human-readable name of the icon */
  iconName: string;
  /** Template matching confidence (0-1) */
  confidence: number;
  /** Position where the icon was found */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Category of the icon (energy, rarity, type, etc.) */
  category?: string;
}

/**
 * Complete recognition result for a card image
 */
export interface CardRecognitionResult {
  /** All recognized text regions */
  textRegions: RecognizedText[];
  /** All detected icons */
  detectedIcons: RecognizedIcon[];
  /** Languages detected in the card text */
  detectedLanguages: string[];
  /** Total processing time in milliseconds */
  processingTime: number;
  /** Metadata about the processed image */
  imageMetadata: {
    width: number;
    height: number;
    format: string;
  };
}

/**
 * Configuration options for card recognition
 */
export interface RecognitionOptions {
  // OCR Configuration
  /** Languages to use for OCR (e.g., ['eng', 'jpn', 'kor']) */
  languages?: string[];
  /** OCR mode for text detection */
  ocrMode?: 'auto' | 'single_block' | 'single_column' | 'single_word';
  /** Minimum confidence threshold for text acceptance (0-100) */
  confidenceThreshold?: number;

  // Icon Detection Configuration
  /** Minimum confidence threshold for icon matches (0-1) */
  iconMatchThreshold?: number;
  /** Whether to enable icon detection (can be disabled for faster text-only processing) */
  enableIconDetection?: boolean;

  // Image Processing Configuration
  /** Enhance image contrast for better OCR */
  enhanceContrast?: boolean;
  /** Apply noise reduction to the image */
  denoise?: boolean;
  /** Apply image sharpening */
  sharpen?: boolean;
  /** Maximum image size for processing (larger images will be resized) */
  maxImageSize?: number;
}

/**
 * Supported language configuration
 */
export interface SupportedLanguage {
  /** Language code (e.g., 'eng', 'jpn') */
  code: string;
  /** Human-readable language name */
  name: string;
  /** Whether this language supports multiple scripts */
  multiScript?: boolean;
}

/**
 * Icon template information
 */
export interface IconTemplate {
  /** Unique identifier for the icon */
  id: string;
  /** Human-readable name */
  name: string;
  /** Category (energy, rarity, type, mechanics) */
  category: string;
  /** File path to the template image */
  templatePath?: string;
  /** Whether the template is currently loaded */
  loaded?: boolean;
}

/**
 * Service initialization configuration
 */
export interface VisionServiceConfig {
  /** Default languages to load on initialization */
  defaultLanguages?: string[];
  /** Path to icon template directory */
  iconTemplatePath?: string;
  /** Default recognition options */
  defaultOptions?: RecognitionOptions;
  /** Whether to preload all language packs (slower startup, faster recognition) */
  preloadLanguages?: boolean;
}

/**
 * Error types specific to vision processing
 */
export interface VisionError {
  /** Error type */
  type:
    | 'INITIALIZATION_ERROR'
    | 'OCR_ERROR'
    | 'IMAGE_PROCESSING_ERROR'
    | 'ICON_DETECTION_ERROR';
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: unknown;
  /** Original error if wrapped */
  originalError?: Error;
}
