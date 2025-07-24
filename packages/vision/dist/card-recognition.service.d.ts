import type { CardRecognitionResult, RecognitionOptions, RecognizedText, PokemonCardAnalysis, VisionServiceConfig, SupportedLanguage, IconTemplate } from '@tcg-collector/api-types';
import { type PokemonNameCandidate } from './pokemon-card-analyzer.service.js';
/**
 * CardRecognitionService
 *
 * Core service for Pokemon TCG card computer vision processing.
 * Handles OCR text extraction and icon recognition from card images.
 *
 * @author AI Agent
 * @semantic CardRecognition + Service (domain service for card computer vision)
 */
export declare class CardRecognitionService {
    private ocrWorker;
    private iconTemplates;
    private isInitialized;
    private config;
    /**
     * Default configuration for the vision service
     */
    private static readonly DEFAULT_CONFIG;
    constructor(config?: VisionServiceConfig);
    /**
     * Initialize the OCR worker and load resources
     */
    initialize(): Promise<void>;
    /**
     * Initialize the Tesseract OCR worker with language support
     */
    private initializeOCRWorker;
    /**
     * Load icon templates for recognition (placeholder implementation)
     */
    private loadIconTemplates;
    /**
     * Recognize text and icons from a card image
     */
    recognizeCard(imageBuffer: Buffer, options?: RecognitionOptions): Promise<CardRecognitionResult>;
    /**
     * Preprocess image for optimal OCR recognition
     * Enhanced for Pokemon cards with size-aware processing
     */
    private preprocessImage;
    /**
     * Extract text from preprocessed image using OCR
     * Enhanced for Pokemon card text with multiple passes for different text sizes
     */
    private extractText;
    /**
     * Detect icons in the image (placeholder implementation)
     */
    private detectIcons;
    /**
     * Group nearby words into logical text regions
     * Enhanced for Pokemon card text that may be fragmented
     */
    private groupTextRegions;
    /**
     * Determine if two words should be grouped together
     */
    private shouldGroupWords;
    /**
     * Calculate horizontal overlap between two bounding boxes
     */
    private calculateHorizontalOverlap;
    /**
     * Intelligently combine text fragments
     */
    private combineTextFragments;
    /**
     * Calculate distance between two bounding boxes
     */
    private calculateDistance;
    /**
     * Detect languages from recognized text using simple heuristics
     */
    private detectLanguagesFromText;
    /**
     * Get list of supported languages
     */
    getSupportedLanguages(): SupportedLanguage[];
    /**
     * Get list of supported icon templates
     */
    getSupportedIcons(): IconTemplate[];
    /**
     * Check if the service is properly initialized
     */
    isReady(): boolean;
    /**
     * Enhanced Pokemon card recognition with intelligent analysis
     */
    recognizePokemonCard(imageBuffer: Buffer, options?: RecognitionOptions): Promise<CardRecognitionResult & {
        pokemonAnalysis: PokemonCardAnalysis;
    }>;
    /**
     * Search for specific Pokemon card elements
     */
    searchPokemonCardElements(imageBuffer: Buffer, targets: Array<{
        text: string;
        type: string;
        required?: boolean;
    }>, options?: RecognitionOptions): Promise<{
        results: Array<{
            target: string;
            type: string;
            matches: Array<{
                region: RecognizedText;
                score: number;
            }>;
        }>;
        totalFound: number;
        recognitionResult: CardRecognitionResult;
    }>;
    /**
     * Find Pokemon name candidates with OCR correction
     */
    findPokemonName(imageBuffer: Buffer, targetName?: string, options?: RecognitionOptions): Promise<{
        candidates: PokemonNameCandidate[];
        bestCandidate: PokemonNameCandidate | null;
        recognitionResult: CardRecognitionResult;
    }>;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
}
