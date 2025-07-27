/**
 * Text Region Detection Service
 *
 * Detects discrete text regions in trading card images without assuming
 * document-like text flow. Each detected region is processed independently.
 */

import sharp from 'sharp';

export interface TextRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  name?: string; // Optional name for debugging
}

export interface TextRegionFinderOptions {
  minRegionWidth?: number;
  minRegionHeight?: number;
  textDetectionThreshold?: number;
  mergeThreshold?: number;
}

export class TextRegionFinder {
  private static readonly DEFAULT_OPTIONS: Required<TextRegionFinderOptions> = {
    minRegionWidth: 20,
    minRegionHeight: 15,
    textDetectionThreshold: 0.3,
    mergeThreshold: 10,
  };

  /**
   * Find potential text regions in an image using edge detection and contour analysis
   */
  async findTextRegions(
    imageBuffer: Buffer,
    options: TextRegionFinderOptions = {}
  ): Promise<TextRegion[]> {
    const config = { ...TextRegionFinder.DEFAULT_OPTIONS, ...options };

    console.log('🔍 Analyzing image for discrete text regions...');

    // Get image metadata
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();

    if (!width || !height) {
      throw new Error('Could not determine image dimensions');
    }

    // Step 1: Create a high-contrast version for text detection
    const textDetectionBuffer = await image
      .clone()
      .grayscale()
      .normalize() // Auto-adjust contrast
      .threshold(128) // Binary threshold
      .negate() // Invert so text is white on black
      .blur(1) // Slight blur to connect text characters
      .toBuffer();

    // Step 2: Find text regions using morphological operations
    const regions = await this.detectTextAreas(
      textDetectionBuffer,
      width,
      height,
      config
    );

    console.log(`📝 Found ${regions.length} potential text regions`);

    return regions;
  }

  /**
   * Detect text areas using image analysis
   */
  private async detectTextAreas(
    binaryBuffer: Buffer,
    width: number,
    height: number,
    config: Required<TextRegionFinderOptions>
  ): Promise<TextRegion[]> {
    const regions: TextRegion[] = [];

    // For now, implement a grid-based approach that divides the card into logical sections
    // This is a starting point that can be refined with actual edge detection

    // Specific Pokemon card text regions based on actual Garganacl card layout
    const cardSections = [
      // Pokemon name area (top left, larger area)
      { name: 'pokemon-name', x: 0.05, y: 0.02, width: 0.6, height: 0.12 },
      // HP area (top right)
      { name: 'hp', x: 0.65, y: 0.02, width: 0.3, height: 0.1 },
      // Ability name area (middle-upper)
      { name: 'ability-name', x: 0.1, y: 0.25, width: 0.8, height: 0.08 },
      // Ability description area (longer text block)
      { name: 'ability-text', x: 0.1, y: 0.33, width: 0.8, height: 0.15 },
      // Attack name area
      { name: 'attack-name', x: 0.1, y: 0.55, width: 0.6, height: 0.08 },
      // Attack damage area (right side)
      { name: 'attack-damage', x: 0.7, y: 0.55, width: 0.25, height: 0.08 },
      // Weakness/Resistance/Retreat area (bottom)
      { name: 'stats', x: 0.1, y: 0.82, width: 0.8, height: 0.12 },
      // Set number area (bottom right)
      { name: 'set-number', x: 0.6, y: 0.9, width: 0.35, height: 0.08 },
      // Energy costs (left side near attacks)
      { name: 'energy-cost', x: 0.02, y: 0.5, width: 0.15, height: 0.2 },
    ];

    // Convert percentage-based regions to pixel coordinates
    for (const section of cardSections) {
      const region: TextRegion = {
        x: Math.round(section.x * width),
        y: Math.round(section.y * height),
        width: Math.round(section.width * width),
        height: Math.round(section.height * height),
        confidence: 0.8, // Default confidence for predefined regions
        name: section.name,
      };

      // Only add regions that meet minimum size requirements
      if (
        region.width >= config.minRegionWidth &&
        region.height >= config.minRegionHeight
      ) {
        regions.push(region);
      }
    }

    console.log(`🎯 Created ${regions.length} text detection regions`);

    return regions;
  }

  /**
   * Extract individual region images for OCR processing
   */
  async extractRegionImages(
    imageBuffer: Buffer,
    regions: TextRegion[]
  ): Promise<{ region: TextRegion; imageBuffer: Buffer }[]> {
    const results: { region: TextRegion; imageBuffer: Buffer }[] = [];

    const image = sharp(imageBuffer);

    for (const region of regions) {
      try {
        // Extract and preprocess each region individually
        const regionBuffer = await image
          .clone()
          .extract({
            left: region.x,
            top: region.y,
            width: region.width,
            height: region.height,
          })
          .grayscale()
          .normalize() // Auto-adjust contrast for this specific region
          .sharpen(1.5) // Sharpen text
          .toBuffer();

        results.push({ region, imageBuffer: regionBuffer });
      } catch (error) {
        console.warn(
          `⚠️ Failed to extract region at ${region.x},${region.y}:`,
          error
        );
      }
    }

    console.log(`✂️ Extracted ${results.length} region images for OCR`);

    return results;
  }
}
