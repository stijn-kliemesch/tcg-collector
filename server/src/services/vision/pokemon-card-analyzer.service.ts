import type { RecognizedText } from '../../types/vision/recognition.js';

/**
 * Pokemon-specific card analysis and text correction service
 *
 * Handles intelligent text matching, OCR correction, and Pokemon card element recognition.
 * Extracted from various test scripts to provide reusable Pokemon card analysis functionality.
 *
 * @author AI Agent
 * @semantic PokemonCardAnalysis + Service (domain service for Pokemon-specific card recognition)
 */

export interface PokemonCardElement {
  type:
    | 'pokemon_name'
    | 'hp'
    | 'attack_name'
    | 'attack_damage'
    | 'set_number'
    | 'energy_cost'
    | 'description'
    | 'unknown';
  originalText: string;
  correctedText: string;
  confidence: number;
  matchScore: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface PokemonNameCandidate {
  original: string;
  corrected: string;
  ocrConfidence: number;
  matchConfidence: number;
  size: string;
  position: string;
  bbox: { x: number; y: number; width: number; height: number };
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

export class PokemonCardAnalyzer {
  /**
   * Analyze recognized text for Pokemon card elements
   */
  static analyzePokemonCard(
    textRegions: RecognizedText[]
  ): PokemonCardAnalysis {
    const elements: PokemonCardElement[] = [];

    // Sort regions by confidence for better processing
    const sortedRegions = [...textRegions].sort(
      (a, b) => b.confidence - a.confidence
    );

    for (const region of sortedRegions) {
      const element = this.classifyCardElement(region);
      if (element) {
        elements.push(element);
      }
    }

    // Group elements by type
    const pokemonName = elements.find(e => e.type === 'pokemon_name');
    const hp = elements.find(e => e.type === 'hp');
    const attacks = elements.filter(
      e => e.type === 'attack_name' || e.type === 'attack_damage'
    );
    const setNumber = elements.find(e => e.type === 'set_number');
    const energyCosts = elements.filter(e => e.type === 'energy_cost');
    const otherElements = elements.filter(
      e =>
        ![
          'pokemon_name',
          'hp',
          'attack_name',
          'attack_damage',
          'set_number',
          'energy_cost',
        ].includes(e.type)
    );

    // Calculate overall confidence
    const confidence =
      elements.length > 0
        ? elements.reduce((sum, e) => sum + e.confidence, 0) / elements.length
        : 0;

    return {
      pokemonName,
      hp,
      attacks,
      setNumber,
      energyCosts,
      otherElements,
      confidence,
      totalElementsFound: elements.length,
    };
  }

  /**
   * Search for specific target texts in recognized regions
   */
  static searchForTargets(
    textRegions: RecognizedText[],
    options: TargetSearchOptions
  ): Array<{
    target: string;
    type: string;
    matches: Array<{ region: RecognizedText; score: number }>;
  }> {
    const results = [];

    for (const target of options.targets) {
      const matches = this.findTextMatches(
        textRegions,
        target.text,
        target.type
      )
        .filter(match => match.score >= (options.fuzzyMatchThreshold || 50))
        .sort((a, b) => b.score - a.score);

      results.push({
        target: target.text,
        type: target.type,
        matches: options.includePartialMatches ? matches : matches.slice(0, 1),
      });
    }

    return results;
  }

  /**
   * Find Pokemon name candidates with intelligent correction
   */
  static findPokemonNameCandidates(
    textRegions: RecognizedText[],
    targetName?: string
  ): PokemonNameCandidate[] {
    const candidates: PokemonNameCandidate[] = [];

    for (const region of textRegions) {
      const originalText = region.text
        .toLowerCase()
        .replace(/[^a-z0-9()|]/g, '');

      // Only consider substantial text that could be Pokemon names
      if (originalText.length >= 4) {
        const correction = this.smartCorrectPokemonName(
          originalText,
          targetName
        );

        if (correction.confidence >= 15) {
          // Reasonable threshold
          candidates.push({
            original: region.text,
            corrected: correction.corrected,
            ocrConfidence: region.confidence,
            matchConfidence: correction.confidence,
            size: `${Math.round(region.bbox.width)}x${Math.round(region.bbox.height)}px`,
            position: `(${Math.round(region.bbox.x)}, ${Math.round(region.bbox.y)})`,
            bbox: region.bbox,
          });
        }
      }
    }

    // Sort by match confidence
    return candidates.sort((a, b) => b.matchConfidence - a.matchConfidence);
  }

  /**
   * Smart Pokemon name correction with OCR error patterns
   */
  static smartCorrectPokemonName(
    text: string,
    targetName?: string
  ): { corrected: string; confidence: number } {
    const original = text.toLowerCase();
    let corrected = original;
    let confidence = 0;

    // Common OCR misreads for Pokemon names
    const corrections: Array<{ from: RegExp; to: string; confidence: number }> =
      [
        { from: /\)/g, to: 'l', confidence: 15 }, // ) → l
        { from: /\(/g, to: 'l', confidence: 15 }, // ( → l
        { from: /1/g, to: 'l', confidence: 10 }, // 1 → l
        { from: /\|/g, to: 'l', confidence: 8 }, // | → l
        { from: /0/g, to: 'o', confidence: 12 }, // 0 → o
        { from: /5/g, to: 's', confidence: 10 }, // 5 → s
        { from: /6/g, to: 'g', confidence: 8 }, // 6 → g
        { from: /9/g, to: 'g', confidence: 8 }, // 9 → g
        { from: /c\)/g, to: 'cl', confidence: 20 }, // c) → cl (specific to Garganacl)
        { from: /ganac\)/g, to: 'ganacl', confidence: 25 }, // ganac) → ganacl
        { from: /rn/g, to: 'm', confidence: 8 }, // rn → m
        { from: /vv/g, to: 'w', confidence: 10 }, // vv → w
        { from: /ii/g, to: 'u', confidence: 8 }, // ii → u
      ];

    // Apply corrections
    corrections.forEach(correction => {
      if (correction.from.test(corrected)) {
        corrected = corrected.replace(correction.from, correction.to);
        confidence += correction.confidence;
      }
    });

    // Calculate similarity to target (if provided) or general Pokemon name patterns
    let similarityBonus = 0;

    if (targetName) {
      const target = targetName.toLowerCase();

      if (corrected === target) {
        similarityBonus = 50;
      } else if (corrected.includes(target) || target.includes(corrected)) {
        similarityBonus = 40;
      } else if (corrected.length >= 5) {
        // Character matching
        let matches = 0;
        const minLength = Math.min(corrected.length, target.length);
        for (let i = 0; i < minLength; i++) {
          if (corrected[i] === target[i]) matches++;
        }
        similarityBonus = (matches / target.length) * 30;
      }
    } else {
      // General Pokemon name characteristics
      if (corrected.length >= 6 && /^[a-z]+$/.test(corrected)) {
        similarityBonus = 20; // Looks like a Pokemon name
      }
    }

    return {
      corrected,
      confidence: confidence + similarityBonus,
    };
  }

  /**
   * Find fuzzy text matches with advanced scoring
   */
  private static findTextMatches(
    textRegions: RecognizedText[],
    targetText: string,
    elementType: string
  ): Array<{ region: RecognizedText; score: number }> {
    return textRegions
      .map(region => {
        const regionText = region.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = targetText.toLowerCase().replace(/[^a-z0-9]/g, '');

        let score = 0;

        // Skip very short regions unless they're numbers
        if (
          regionText.length < 2 &&
          !['hp', 'attack_damage', 'set_number'].includes(elementType)
        ) {
          return { region, score: 0 };
        }

        // Exact match
        if (regionText === target) {
          score = 100;
        }
        // Contains full target
        else if (regionText.includes(target) && target.length >= 3) {
          score = 90;
        }
        // Target contains region (partial match)
        else if (target.includes(regionText) && regionText.length >= 3) {
          score = 80;
        }
        // Fuzzy matching for similar text
        else {
          const targetWords = targetText.toLowerCase().split(/\s+/);

          for (const word of targetWords) {
            if (word.length >= 4) {
              if (regionText.includes(word)) {
                score = Math.max(score, 70);
              } else if (word.includes(regionText) && regionText.length >= 3) {
                score = Math.max(score, 60);
              }
            }
          }

          // Special handling for numbers
          if (['hp', 'attack_damage', 'set_number'].includes(elementType)) {
            score = 0; // Reset for number matching

            if (region.text.includes('/') && targetText.includes('/')) {
              // Both have slashes, check if numbers match
              const regionNumbers: string[] = region.text.match(/\d+/g) || [];
              const targetNumbers: string[] = targetText.match(/\d+/g) || [];

              const hasMatchingNumber = regionNumbers.some((num: string) =>
                targetNumbers.includes(num)
              );
              if (hasMatchingNumber) {
                score = 80;
              }
            } else if (
              /^\d+$/.test(regionText) &&
              targetText.includes(regionText)
            ) {
              score = 85;
            } else if (regionText.length >= 2 && target.includes(regionText)) {
              score = 70;
            }
          }
        }

        return { region, score };
      })
      .filter(match => match.score > 0);
  }

  /**
   * Classify a text region into a Pokemon card element type
   */
  private static classifyCardElement(
    region: RecognizedText
  ): PokemonCardElement | null {
    const text = region.text.trim();
    const _cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '');

    let type: PokemonCardElement['type'] = 'unknown';
    let correctedText = text;
    let matchScore = region.confidence;

    // Classify based on text patterns and position

    // HP numbers (usually 2-3 digits)
    if (/^\d{2,3}$/.test(text) && region.bbox.y < 300) {
      // Likely in upper area
      type = 'hp';
    }
    // Set numbers (format: XXX/XXX)
    else if (/^\d{2,3}\/\d{2,3}$/.test(text)) {
      type = 'set_number';
    }
    // Attack damage (standalone numbers, usually in lower area)
    else if (/^\d{1,3}$/.test(text) && region.bbox.y > 400) {
      type = 'attack_damage';
    }
    // Long text likely to be Pokemon names (in upper area, substantial size)
    else if (
      text.length >= 6 &&
      /^[A-Za-z()|]+$/.test(text) &&
      region.bbox.y < 350 &&
      region.bbox.width > 150
    ) {
      type = 'pokemon_name';
      const correction = this.smartCorrectPokemonName(text);
      correctedText = correction.corrected;
      matchScore = correction.confidence;
    }
    // Attack names (capitalized text, medium length)
    else if (
      text.length >= 4 &&
      text.length <= 20 &&
      /^[A-Z]/.test(text) &&
      region.bbox.y > 300
    ) {
      type = 'attack_name';
    }
    // Energy symbols or costs (short text, could be numbers or symbols)
    else if (text.length <= 3 && /^[\d[\]]+$/.test(text)) {
      type = 'energy_cost';
    }

    // Only return elements we can classify with reasonable confidence
    if (type === 'unknown' && region.confidence < 30) {
      return null;
    }

    return {
      type,
      originalText: text,
      correctedText,
      confidence: region.confidence,
      matchScore,
      position: { x: region.bbox.x, y: region.bbox.y },
      size: { width: region.bbox.width, height: region.bbox.height },
    };
  }

  /**
   * Get best Pokemon name candidate from analysis
   */
  static getBestPokemonName(
    candidates: PokemonNameCandidate[]
  ): PokemonNameCandidate | null {
    if (candidates.length === 0) return null;

    // Prefer candidates with higher match confidence and reasonable OCR confidence
    const scored = candidates.map(candidate => ({
      candidate,
      score:
        candidate.matchConfidence +
        candidate.ocrConfidence * 0.3 +
        (candidate.bbox.width > 200 ? 10 : 0), // Bonus for large text
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].candidate;
  }

  /**
   * Format analysis results for display
   */
  static formatAnalysisResults(analysis: PokemonCardAnalysis): string {
    const lines = [];
    lines.push('🎯 Pokemon Card Analysis Results:');
    lines.push('─'.repeat(50));

    if (analysis.pokemonName) {
      lines.push(
        `🎭 Pokemon Name: "${analysis.pokemonName.correctedText}" (${Math.round(analysis.pokemonName.confidence)}% confidence)`
      );
    }

    if (analysis.hp) {
      lines.push(
        `❤️  HP: ${analysis.hp.originalText} (${Math.round(analysis.hp.confidence)}% confidence)`
      );
    }

    if (analysis.attacks.length > 0) {
      lines.push(
        `⚔️  Attacks: ${analysis.attacks.map(a => a.correctedText).join(', ')}`
      );
    }

    if (analysis.setNumber) {
      lines.push(
        `📦 Set Number: ${analysis.setNumber.originalText} (${Math.round(analysis.setNumber.confidence)}% confidence)`
      );
    }

    lines.push(`📊 Overall Confidence: ${Math.round(analysis.confidence)}%`);
    lines.push(`🔍 Elements Found: ${analysis.totalElementsFound}`);

    return lines.join('\n');
  }
}
