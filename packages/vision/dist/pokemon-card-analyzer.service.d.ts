import type { RecognizedText, PokemonCardElement } from '@tcg-collector/api-types';
/**
 * Pokemon-specific card analysis and text correction service
 *
 * Handles intelligent text matching, OCR correction, and Pokemon card element recognition.
 * Extracted from various test scripts to provide reusable Pokemon card analysis functionality.
 *
 * @author AI Agent
 * @semantic PokemonCardAnalysis + Service (domain service for Pokemon-specific card recognition)
 */
export interface PokemonNameCandidate {
    original: string;
    corrected: string;
    ocrConfidence: number;
    matchConfidence: number;
    size: string;
    position: string;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
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
export interface TargetSearchOptions {
    targets: Array<{
        text: string;
        type: PokemonCardElement['type'];
        required?: boolean;
    }>;
    fuzzyMatchThreshold?: number;
    includePartialMatches?: boolean;
}
export declare class PokemonCardAnalyzer {
    /**
     * Analyze recognized text for Pokemon card elements
     */
    static analyzePokemonCard(textRegions: RecognizedText[]): PokemonCardAnalysis;
    /**
     * Search for specific target texts in recognized regions
     */
    static searchForTargets(textRegions: RecognizedText[], options: TargetSearchOptions): Array<{
        target: string;
        type: string;
        matches: Array<{
            region: RecognizedText;
            score: number;
        }>;
    }>;
    /**
     * Find Pokemon name candidates with intelligent correction
     */
    static findPokemonNameCandidates(textRegions: RecognizedText[], targetName?: string): PokemonNameCandidate[];
    /**
     * Smart Pokemon name correction with OCR error patterns
     */
    static smartCorrectPokemonName(text: string, targetName?: string): {
        corrected: string;
        confidence: number;
    };
    /**
     * Find fuzzy text matches with advanced scoring
     */
    private static findTextMatches;
    /**
     * Classify a text region into a Pokemon card element type
     */
    private static classifyCardElement;
    /**
     * Get best Pokemon name candidate from analysis
     */
    static getBestPokemonName(candidates: PokemonNameCandidate[]): PokemonNameCandidate | null;
    /**
     * Format analysis results for display
     */
    static formatAnalysisResults(analysis: PokemonCardAnalysis): string;
}
