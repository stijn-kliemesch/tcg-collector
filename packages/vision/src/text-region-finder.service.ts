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
  enableLayoutAnalysis?: boolean; // New option to enable actual layout analysis
}

export interface LayoutAnalysisResult {
  detectedRegions: TextRegion[];
  confidenceMap: number[][];
  edgeMap: number[][];
  layoutMetrics: {
    cardWidth: number;
    cardHeight: number;
    textDensityAreas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }>;
  };
}

export class TextRegionFinder {
  private static readonly DEFAULT_OPTIONS: Required<TextRegionFinderOptions> = {
    minRegionWidth: 20,
    minRegionHeight: 15,
    textDetectionThreshold: 0.3,
    mergeThreshold: 10,
    enableLayoutAnalysis: false, // Default to false for backward compatibility
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

    // Use layout analysis if enabled
    if (config.enableLayoutAnalysis) {
      console.log('📊 Using layout analysis to detect regions...');
      const layoutResult = await this.analyzeCardLayout(imageBuffer);
      return layoutResult.detectedRegions;
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

  /**
   * Analyze the actual layout of a card image to determine optimal text regions
   * This method uses edge detection and morphological operations to find text areas
   */
  async analyzeCardLayout(imageBuffer: Buffer): Promise<LayoutAnalysisResult> {
    console.log('🔬 Analyzing card layout using image analysis...');

    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();

    if (!width || !height) {
      throw new Error('Could not determine image dimensions');
    }

    // Step 1: Create edge detection map
    const edgeBuffer = await image
      .clone()
      .grayscale()
      .normalise() // Auto-adjust contrast
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // Edge detection kernel
      })
      .threshold(30) // Keep strong edges
      .toBuffer();

    // Step 2: Create text confidence map using morphological operations
    const textBuffer = await image
      .clone()
      .grayscale()
      .normalise()
      .threshold(128)
      .negate() // Text becomes white
      .toBuffer();

    // Step 3: Analyze the buffers to find text density areas
    const textDensityAreas = await this.findTextDensityAreas(
      textBuffer,
      width,
      height
    );

    // Step 4: Convert density areas to regions
    const detectedRegions = this.densityAreasToRegions(
      textDensityAreas,
      width,
      height
    );

    console.log(
      `📊 Layout analysis found ${detectedRegions.length} text regions`
    );

    return {
      detectedRegions,
      confidenceMap: [], // Placeholder for now
      edgeMap: [], // Placeholder for now
      layoutMetrics: {
        cardWidth: width,
        cardHeight: height,
        textDensityAreas,
      },
    };
  }

  /**
   * Find areas with high text density using image analysis
   */
  private async findTextDensityAreas(
    binaryBuffer: Buffer,
    width: number,
    height: number
  ): Promise<
    Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }>
  > {
    // For now, implement a grid-based analysis that samples text density
    const gridSize = 32; // Sample every 32 pixels
    const areas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }> = [];

    // Convert buffer to pixel data for analysis
    const imageData = await sharp(binaryBuffer).raw().toBuffer();

    // Sample text density in grid cells
    for (let y = 0; y < height - gridSize; y += gridSize) {
      for (let x = 0; x < width - gridSize; x += gridSize) {
        let whitePixels = 0;
        const totalPixels = gridSize * gridSize;

        // Count white pixels (text) in this grid cell
        for (let dy = 0; dy < gridSize; dy++) {
          for (let dx = 0; dx < gridSize; dx++) {
            const pixelIndex = (y + dy) * width + (x + dx);
            if (pixelIndex < imageData.length && imageData[pixelIndex] > 128) {
              whitePixels++;
            }
          }
        }

        const density = whitePixels / totalPixels;

        // Only keep areas with significant text density
        if (density > 0.1) {
          areas.push({
            x,
            y,
            width: gridSize,
            height: gridSize,
            density,
          });
        }
      }
    }

    // Merge adjacent high-density areas
    return this.mergeAdjacentAreas(areas, gridSize);
  }

  /**
   * Merge adjacent text density areas into larger regions
   */
  private mergeAdjacentAreas(
    areas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }>,
    gridSize: number
  ): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    density: number;
  }> {
    const merged: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }> = [];

    // Sort areas by position for easier merging
    areas.sort((a, b) => a.y - b.y || a.x - b.x);

    for (const area of areas) {
      // Try to merge with existing areas
      let wasMerged = false;

      for (const existing of merged) {
        // Check if areas are adjacent or overlapping
        const horizontalAdjacent =
          Math.abs(area.x - (existing.x + existing.width)) <= gridSize ||
          Math.abs(existing.x - (area.x + area.width)) <= gridSize;

        const verticalAdjacent =
          Math.abs(area.y - (existing.y + existing.height)) <= gridSize ||
          Math.abs(existing.y - (area.y + area.height)) <= gridSize;

        const horizontalOverlap =
          area.x < existing.x + existing.width &&
          existing.x < area.x + area.width;

        const verticalOverlap =
          area.y < existing.y + existing.height &&
          existing.y < area.y + area.height;

        if (
          (horizontalAdjacent && verticalOverlap) ||
          (verticalAdjacent && horizontalOverlap)
        ) {
          // Merge the areas
          const newX = Math.min(existing.x, area.x);
          const newY = Math.min(existing.y, area.y);
          const newWidth =
            Math.max(existing.x + existing.width, area.x + area.width) - newX;
          const newHeight =
            Math.max(existing.y + existing.height, area.y + area.height) - newY;

          existing.x = newX;
          existing.y = newY;
          existing.width = newWidth;
          existing.height = newHeight;
          existing.density = Math.max(existing.density, area.density);

          wasMerged = true;
          break;
        }
      }

      if (!wasMerged) {
        merged.push({ ...area });
      }
    }

    return merged;
  }

  /**
   * Convert text density areas to named regions based on position
   */
  private densityAreasToRegions(
    densityAreas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }>,
    cardWidth: number,
    cardHeight: number
  ): TextRegion[] {
    const regions: TextRegion[] = [];

    for (const area of densityAreas) {
      // Determine region name based on position on the card
      const centerX = area.x + area.width / 2;
      const centerY = area.y + area.height / 2;
      const relativeX = centerX / cardWidth;
      const relativeY = centerY / cardHeight;

      let name = 'unknown';

      // Top area (Pokemon name and HP)
      if (relativeY < 0.2) {
        if (relativeX < 0.6) {
          name = 'pokemon-name';
        } else {
          name = 'hp';
        }
      }
      // Upper middle (abilities)
      else if (relativeY < 0.5) {
        if (area.height > 40) {
          name = 'ability-text';
        } else {
          name = 'ability-name';
        }
      }
      // Middle area (attacks)
      else if (relativeY < 0.8) {
        if (relativeX < 0.2) {
          name = 'energy-cost';
        } else if (relativeX > 0.7) {
          name = 'attack-damage';
        } else {
          name = 'attack-name';
        }
      }
      // Bottom area (stats and set info)
      else {
        if (relativeX > 0.6) {
          name = 'set-number';
        } else {
          name = 'stats';
        }
      }

      regions.push({
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
        confidence: area.density,
        name,
      });
    }

    console.log(
      `🎯 Converted ${densityAreas.length} density areas to ${regions.length} named regions`
    );

    return regions;
  }
}
