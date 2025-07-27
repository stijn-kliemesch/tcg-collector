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

export interface CardBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
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
  cardBounds?: CardBounds; // Detected card boundaries within the image
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

    // Step 1: Detect card boundaries within the image
    console.log('🃏 Detecting card boundaries...');
    const cardBounds = await this.detectCardBounds(imageBuffer, width, height);
    
    if (cardBounds) {
      console.log(`📐 Card detected at: ${cardBounds.x},${cardBounds.y} size: ${cardBounds.width}x${cardBounds.height} (confidence: ${Math.round(cardBounds.confidence * 100)}%)`);
    } else {
      console.log('⚠️ Card boundaries not detected, using full image');
    }

    // Use layout analysis if enabled
    if (config.enableLayoutAnalysis) {
      console.log('📊 Using layout analysis to detect regions...');
      const layoutResult = await this.analyzeCardLayout(imageBuffer, cardBounds);
      return layoutResult.detectedRegions;
    }

    // Step 2: Create a high-contrast version for text detection
    const textDetectionBuffer = await image
      .clone()
      .grayscale()
      .normalize() // Auto-adjust contrast
      .threshold(128) // Binary threshold
      .negate() // Invert so text is white on black
      .blur(1) // Slight blur to connect text characters
      .toBuffer();

    // Step 3: Find text regions using morphological operations
    const regions = await this.detectTextAreas(
      textDetectionBuffer,
      width,
      height,
      config,
      cardBounds
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
    config: Required<TextRegionFinderOptions>,
    cardBounds?: CardBounds | null
  ): Promise<TextRegion[]> {
    const regions: TextRegion[] = [];

    // For now, implement a grid-based approach that divides the card into logical sections
    // This is a starting point that can be refined with actual edge detection

    // Enhanced Pokemon card text regions based on actual card layouts
    // Accounts for different text colors, optional regions, and multiple instances
    const cardSections = [
      // === TOP SECTION ===
      // Pokemon name area (top left, larger area for main name)
      { name: 'pokemon-name', x: 0.05, y: 0.02, width: 0.5, height: 0.12 },
      
      // HP number area (top right, larger for the number)
      { name: 'hp-number', x: 0.65, y: 0.02, width: 0.2, height: 0.1 },
      
      // HP text area (tiny "HP" text next to the number)
      { name: 'hp-text', x: 0.85, y: 0.02, width: 0.1, height: 0.08 },
      
      // Evolution info (optional - appears when Pokemon evolves from another)
      { name: 'evolution-stage', x: 0.05, y: 0.15, width: 0.3, height: 0.06 },
      { name: 'evolves-from', x: 0.35, y: 0.15, width: 0.4, height: 0.06 },

      // === ABILITY SECTION ===
      // "Ability" label text (italics, left side)
      { name: 'ability-label', x: 0.05, y: 0.25, width: 0.15, height: 0.06 },
      
      // Ability name area (after the "Ability" label)
      { name: 'ability-name', x: 0.2, y: 0.25, width: 0.7, height: 0.08 },
      
      // Ability description area (longer text block, may contain energy icons)
      { name: 'ability-text', x: 0.1, y: 0.33, width: 0.8, height: 0.15 },

      // === ATTACK SECTIONS ===
      // First attack energy cost (left side)
      { name: 'attack1-energy', x: 0.02, y: 0.52, width: 0.12, height: 0.08 },
      
      // First attack name
      { name: 'attack1-name', x: 0.15, y: 0.52, width: 0.5, height: 0.08 },
      
      // First attack damage (right side)
      { name: 'attack1-damage', x: 0.7, y: 0.52, width: 0.25, height: 0.08 },
      
      // First attack description (if present)
      { name: 'attack1-text', x: 0.15, y: 0.61, width: 0.8, height: 0.1 },

      // Second attack (optional - many cards have multiple attacks)
      { name: 'attack2-energy', x: 0.02, y: 0.72, width: 0.12, height: 0.08 },
      { name: 'attack2-name', x: 0.15, y: 0.72, width: 0.5, height: 0.08 },
      { name: 'attack2-damage', x: 0.7, y: 0.72, width: 0.25, height: 0.08 },
      { name: 'attack2-text', x: 0.15, y: 0.81, width: 0.8, height: 0.08 },

      // === STATS SECTION (Bottom) ===
      // Weakness label and value (left side of bottom)
      { name: 'weakness-label', x: 0.05, y: 0.89, width: 0.15, height: 0.06 },
      { name: 'weakness-value', x: 0.2, y: 0.89, width: 0.15, height: 0.06 },
      
      // Resistance label and value (middle of bottom)
      { name: 'resistance-label', x: 0.4, y: 0.89, width: 0.15, height: 0.06 },
      { name: 'resistance-value', x: 0.55, y: 0.89, width: 0.15, height: 0.06 },
      
      // Retreat cost label and value (right side of bottom)
      { name: 'retreat-label', x: 0.75, y: 0.89, width: 0.1, height: 0.06 },
      { name: 'retreat-value', x: 0.85, y: 0.89, width: 0.1, height: 0.06 },

      // === CARD INFO ===
      // Set number area (bottom right corner) - fix coordinates that were out of bounds
      { name: 'set-number', x: 0.6, y: 0.92, width: 0.35, height: 0.06 }, // Moved up from 0.96
      
      // Card type/rarity info (if visible) - fix coordinates
      { name: 'card-type', x: 0.05, y: 0.92, width: 0.3, height: 0.06 }, // Moved up from 0.96

      // === FALLBACK REGIONS ===
      // General energy cost area (broader coverage for varied layouts)
      { name: 'energy-cost-general', x: 0.02, y: 0.5, width: 0.15, height: 0.3 },
      
      // General stats area (fallback for complex bottom sections)
      { name: 'stats-general', x: 0.05, y: 0.85, width: 0.9, height: 0.12 },
    ];

    // Determine effective card dimensions and offset
    const cardWidth = cardBounds ? cardBounds.width : width;
    const cardHeight = cardBounds ? cardBounds.height : height;
    const cardOffsetX = cardBounds ? cardBounds.x : 0;
    const cardOffsetY = cardBounds ? cardBounds.y : 0;

    console.log(`🃏 Using card bounds: ${cardOffsetX},${cardOffsetY} size: ${cardWidth}x${cardHeight}`);

    // Convert percentage-based regions to pixel coordinates relative to card bounds
    for (const section of cardSections) {
      const region: TextRegion = {
        x: Math.round(cardOffsetX + section.x * cardWidth),
        y: Math.round(cardOffsetY + section.y * cardHeight),
        width: Math.round(section.width * cardWidth),
        height: Math.round(section.height * cardHeight),
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
        // Apply region-specific preprocessing for optimal OCR
        const regionBuffer = await this.preprocessRegionForOCR(image, region);
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
  async analyzeCardLayout(imageBuffer: Buffer, cardBounds?: CardBounds | null): Promise<LayoutAnalysisResult> {
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

    // Step 2: Create improved text confidence map using multiple preprocessing strategies
    console.log('🖼️ Creating enhanced text detection buffer...');
    
    const textBuffer = await image
      .clone()
      .grayscale()
      .normalise() // Auto-adjust contrast first
      .sharpen(1.2) // Sharpen text edges
      .linear(1.2, -30) // Increase contrast and reduce brightness
      .threshold(120) // Lower threshold for better text capture
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
      cardBounds: cardBounds || undefined, // Include detected card bounds
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
    console.log(`🔬 Analyzing text density in ${width}x${height} image...`);

    // Use larger grid size to reduce computational load
    const baseGridSize = Math.min(width, height) / 15; // Larger grid, less computation
    const gridSize = Math.max(24, Math.min(48, baseGridSize)); // Between 24-48 pixels
    
    console.log(`📐 Using grid size: ${gridSize}px for ${width}x${height} image`);

    const areas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }> = [];

    // Convert buffer to pixel data for analysis
    const imageData = await sharp(binaryBuffer).raw().toBuffer();
    
    // Use less overlapping for better performance (25% instead of 50%)
    const stepSize = Math.round(gridSize * 0.75); // 25% overlap instead of 50%
    let sampledCells = 0;
    let textCells = 0;

    // Sample text density with reduced overlap for performance
    for (let y = 0; y <= height - gridSize; y += stepSize) {
      for (let x = 0; x <= width - gridSize; x += stepSize) {
        sampledCells++;
        
        let whitePixels = 0;
        let totalPixels = 0;

        // Sample every 2nd pixel for performance (skip some pixels)
        const sampleStep = 2;
        for (let dy = 0; dy < gridSize; dy += sampleStep) {
          for (let dx = 0; dx < gridSize; dx += sampleStep) {
            const pixelY = y + dy;
            const pixelX = x + dx;
            
            if (pixelY < height && pixelX < width) {
              const pixelIndex = pixelY * width + pixelX;
              totalPixels++;
              
              if (pixelIndex < imageData.length && imageData[pixelIndex] > 128) {
                whitePixels++;
              }
            }
          }
        }

        if (totalPixels > 0) {
          const density = whitePixels / totalPixels;

          // More selective threshold focusing on text characteristics
          // Text typically has moderate density (not pure white like icons, not too sparse)
          if (density > 0.15 && density < 0.85) { // Text range: 15-85% white pixels
            textCells++;
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
    }

    console.log(`📊 Sampled ${sampledCells} cells, found ${textCells} with text (${Math.round(textCells/sampledCells*100)}%)`);
    console.log(`🎯 Before merging: ${areas.length} density areas`);

    // Debug: Show sample of density areas before merging
    if (areas.length > 0) {
      console.log(`📏 Sample density areas: first area is ${areas[0].width}x${areas[0].height}, density: ${areas[0].density.toFixed(3)}`);
      if (areas.length > 1) {
        console.log(`📏 Last area is ${areas[areas.length-1].width}x${areas[areas.length-1].height}, density: ${areas[areas.length-1].density.toFixed(3)}`);
      }
    } else {
      console.log(`⚠️ No density areas found! This might be due to threshold being too high (${0.08})`);
    }

    // Merge adjacent high-density areas with optimized algorithm
    // First try: Create individual regions from areas that have text-like characteristics
    const textLikeRegions = areas.filter(area => 
      area.density > 0.25 && area.density < 0.75 && // Text sweet spot (was 0.25-0.95)
      area.width >= 20 && area.height >= 20 // Reasonable size for text
    );
    
    console.log(`🎯 Found ${textLikeRegions.length} text-like regions (density 0.25-0.75)`);
    
    // If we have a reasonable number of text regions (8-40), use them
    if (textLikeRegions.length >= 8 && textLikeRegions.length <= 40) {
      console.log(`✅ Using individual text regions approach (${textLikeRegions.length} regions in target range)`);
      return textLikeRegions;
    }
    
    // If still too many, try zone-based clustering first
    if (textLikeRegions.length > 40) {
      console.log(`🔗 Too many text regions (${textLikeRegions.length}), trying smart clustering by card zones...`);
      const clustered = this.clusterRegionsByCardZones(textLikeRegions, width, height);
      console.log(`🎯 Zone clustering produced ${clustered.length} regions`);
      if (clustered.length >= 8 && clustered.length <= 35) {
        return clustered;
      }
      
      // If zone clustering didn't work, try filtering smaller regions only
      console.log(`🎯 Zone clustering outside range, trying smaller regions filter...`);
      const smallerRegions = textLikeRegions.filter(area => 
        area.width <= 120 && area.height <= 120 // Focus on smaller, more text-like areas
      );
      console.log(`🎯 Filtering to smaller regions: ${smallerRegions.length} regions`);
      if (smallerRegions.length >= 8 && smallerRegions.length <= 35) {
        return smallerRegions;
      }
      
      // Fall back to traditional merging as last resort
      console.log(`🔗 Trying traditional merging as fallback...`);
      const merged = this.mergeAdjacentAreasImproved(textLikeRegions, gridSize, stepSize, width, height);
      console.log(`🎯 Traditional merging produced ${merged.length} regions`);
      if (merged.length >= 8 && merged.length <= 35) {
        return merged;
      }
    }
    
    // If too few, try lower threshold
    if (textLikeRegions.length < 8) {
      console.log(`� Too few text regions (${textLikeRegions.length}), trying broader criteria...`);
      const broaderRegions = areas.filter(area => 
        area.density > 0.2 && area.density < 0.8 && // Slightly broader
        area.width >= 18 && area.height >= 15 // Slightly smaller minimum
      );
      console.log(`🎯 Broader filter found ${broaderRegions.length} regions`);
      if (broaderRegions.length >= 8 && broaderRegions.length <= 40) {
        return broaderRegions;
      }
      
      // Last resort: try merging the broader set
      const merged = this.mergeAdjacentAreasImproved(broaderRegions, gridSize, stepSize, width, height);
      if (merged.length > 0) {
        return merged;
      }
    }
    
    // Final fallback: Use original merging approach
    console.log(`⚠️ Falling back to original merging approach`);
    const merged = this.mergeAdjacentAreasImproved(areas, gridSize, stepSize, width, height);
    
    console.log(`🔗 After merging: ${merged.length} consolidated regions`);
    
    return merged;
  }

  /**
   * Merge adjacent text density areas into larger regions (improved algorithm)
   */
  private mergeAdjacentAreasImproved(
    areas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }>,
    gridSize: number,
    stepSize: number,
    imageWidth: number,
    imageHeight: number
  ): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    density: number;
  }> {
    if (areas.length === 0) return [];

    console.log(`🔗 Merging ${areas.length} areas with grid=${gridSize}, step=${stepSize}`);
    
    // Sort areas by position for better merging
    areas.sort((a, b) => a.y - b.y || a.x - b.x);
    
    const merged: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      density: number;
    }> = [];

    // Use union-find like approach with improved merging criteria
    const visited = new Set<number>();

    for (let i = 0; i < areas.length; i++) {
      if (visited.has(i)) continue;

      const area = areas[i];
      const cluster = [area];
      const clusterIndices = [i];
      visited.add(i);

      // Find all areas that should be merged with this one
      let changed = true;
      while (changed) {
        changed = false;
        
        for (let j = 0; j < areas.length; j++) {
          if (visited.has(j)) continue;
          
          const candidate = areas[j];
          
          // Check if candidate overlaps or is adjacent to any area in current cluster
          const shouldMerge = cluster.some(clusterArea => {
            const horizontalDistance = Math.min(
              Math.abs(candidate.x - (clusterArea.x + clusterArea.width)),
              Math.abs(clusterArea.x - (candidate.x + candidate.width))
            );
            
            const verticalDistance = Math.min(
              Math.abs(candidate.y - (clusterArea.y + clusterArea.height)),
              Math.abs(clusterArea.y - (candidate.y + candidate.height))
            );
            
            const horizontalOverlap =
              candidate.x < clusterArea.x + clusterArea.width &&
              clusterArea.x < candidate.x + candidate.width;
              
            const verticalOverlap =
              candidate.y < clusterArea.y + clusterArea.height &&
              clusterArea.y < candidate.y + candidate.height;
            
            // Much more restrictive merging criteria to prevent giant regions
            const maxMergeDistance = stepSize * 0.8; // Even stricter proximity merging
            
            // Additional constraint: don't merge if it would create a region larger than reasonable text blocks
            const wouldBeWidth = Math.max(
              clusterArea.x + clusterArea.width,
              candidate.x + candidate.width
            ) - Math.min(clusterArea.x, candidate.x);
            
            const wouldBeHeight = Math.max(
              clusterArea.y + clusterArea.height,
              candidate.y + candidate.height
            ) - Math.min(clusterArea.y, candidate.y);
            
            // Don't merge if resulting region would be too large for typical text blocks
            const maxTextBlockSize = Math.min(imageWidth, imageHeight) * 0.4; // 40% max for individual text blocks
            if (wouldBeWidth > maxTextBlockSize || wouldBeHeight > maxTextBlockSize) {
              // Debug first few rejections to see what's happening
              if (cluster.length < 5) {
                console.log(`🚫 Rejected merge: would create ${wouldBeWidth}x${wouldBeHeight} (max: ${Math.round(maxTextBlockSize)})`);
              }
              return false;
            }
            
            const isAdjacent = 
              (horizontalOverlap && verticalDistance <= maxMergeDistance) ||
              (verticalOverlap && horizontalDistance <= maxMergeDistance);
              
            const isOverlapping = horizontalOverlap && verticalOverlap;
            
            return isAdjacent || isOverlapping;
          });
          
          if (shouldMerge) {
            cluster.push(candidate);
            clusterIndices.push(j);
            visited.add(j);
            changed = true;
          }
        }
      }

      // Create merged region from cluster with proper integer coordinates
      const minX = Math.round(Math.min(...cluster.map(a => a.x)));
      const minY = Math.round(Math.min(...cluster.map(a => a.y)));
      const maxX = Math.round(Math.max(...cluster.map(a => a.x + a.width)));
      const maxY = Math.round(Math.max(...cluster.map(a => a.y + a.height)));
      
      const mergedWidth = maxX - minX;
      const mergedHeight = maxY - minY;
      
      // Only add regions that meet minimum size requirements and aren't too large
      const minSize = Math.min(gridSize / 2, 20); // Minimum 20 pixels or half grid size
      
      // Use more intelligent max size based on card layout patterns
      // Trading cards can have large text areas that span significant portions
      const baseMaxSize = Math.min(imageWidth, imageHeight);
      let maxSize;
      
      // If we have many small areas merging into one large region, it's likely legitimate card text
      if (cluster.length > 20) {
        // Allow larger regions when many small areas merge (full card text)
        maxSize = baseMaxSize * 0.95; // 95% for extensive text areas
      } else if (cluster.length > 10) {
        // Medium-sized merged regions
        maxSize = baseMaxSize * 0.85; // 85% for moderate text areas
      } else {
        // Small clusters should still be reasonably bounded
        maxSize = baseMaxSize * 0.7; // 70% for small clusters
      }
      
      // Debug logging for large clusters
      if (cluster.length > 50) {
        console.log(`🔍 Large cluster: ${cluster.length} areas merging to ${mergedWidth}x${mergedHeight} (max: ${Math.round(maxSize)})`);
      }
      
      if (mergedWidth >= minSize && mergedHeight >= minSize && 
          mergedWidth <= maxSize && mergedHeight <= maxSize) {
        const avgDensity = cluster.reduce((sum, a) => sum + a.density, 0) / cluster.length;
        
        merged.push({
          x: minX,
          y: minY,
          width: mergedWidth,
          height: mergedHeight,
          density: avgDensity,
        });
        
        console.log(`✅ Added region: ${mergedWidth}x${mergedHeight} from ${cluster.length} areas (max: ${Math.round(maxSize)})`);
      } else {
        console.log(`⚠️ Skipping region: ${mergedWidth}x${mergedHeight} from ${cluster.length} areas (constraints: ${minSize}-${Math.round(maxSize)})`);
      }
    }

    console.log(`✅ Merged into ${merged.length} final regions`);
    
    return merged;
  }

  /**
   * Merge adjacent text density areas into larger regions (original algorithm - kept for fallback)
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

  /**
   * Apply region-specific preprocessing for optimal OCR quality
   */
  private async preprocessRegionForOCR(
    image: sharp.Sharp,
    region: TextRegion
  ): Promise<Buffer> {
    const regionName = region.name || 'unknown';
    
    // Base extraction with minimal padding to reduce memory usage
    const padding = 2; // Reduced from 4
    let pipeline = image
      .clone()
      .extract({
        left: Math.max(0, region.x - padding),
        top: Math.max(0, region.y - padding),
        width: Math.min(region.width + padding * 2, 400), // Reduced max width from 1000 to 400
        height: Math.min(region.height + padding * 2, 200), // Reduced max height from 1000 to 200
      })
      .grayscale();

    // Apply enhanced region-specific preprocessing
    switch (regionName) {
      // === POKEMON NAME (usually large, colorful text) ===
      case 'pokemon-name':
        // Pokemon names often have colorful backgrounds and stylized fonts
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(200, region.width * 3)), kernel: 'cubic' }) // Increased scaling
          .normalize()
          .linear(1.6, -30) // Much higher contrast to cut through colored backgrounds
          .sharpen(1.5) // Strong sharpening for stylized text
          .threshold(110); // Lower threshold to capture more text pixels
        break;

      // === HP SECTION ===
      case 'hp-number':
        // HP numbers are usually large and bold but may have colored backgrounds
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(120, region.width * 4)), kernel: 'cubic' }) // More aggressive scaling
          .normalize()
          .linear(1.5, -25) // Higher contrast for colored HP areas
          .sharpen(1.3)
          .threshold(115); // Lower threshold to capture more pixels
        break;

      case 'hp-text':
        // Tiny "HP" text needs very aggressive processing
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(80, region.width * 5)), kernel: 'cubic' }) // Much more scaling
          .normalize()
          .linear(1.7, -35) // Very high contrast for tiny text
          .sharpen(1.8)
          .threshold(120);
        break;

      // === EVOLUTION INFO (small text) ===
      case 'evolution-stage':
      case 'evolves-from':
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(120, region.width * 2)), kernel: 'cubic' })
          .normalize()
          .linear(1.3, -15)
          .sharpen(1.0)
          .threshold(125);
        break;

      // === ABILITY SECTION ===
      case 'ability-label':
        // "Ability" is usually in italics, smaller text, often low contrast
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(100, region.width * 4)), kernel: 'cubic' }) // More scaling for small text
          .normalize()
          .linear(1.6, -28) // Much higher contrast for italic text
          .sharpen(1.5) // Strong sharpening for italic/stylized text
          .threshold(115); // Lower threshold to capture faint text
        break;

      case 'ability-name':
        // Ability names are usually bold but can have varying contrast
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(150, region.width * 2.5)), kernel: 'cubic' }) // More scaling
          .normalize()
          .linear(1.5, -22) // Higher contrast
          .sharpen(1.3) // Stronger sharpening
          .threshold(118); // Lower threshold
        break;

      case 'ability-text':
        // Longer text with possible icons - balance readability
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(200, region.width * 1.5)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10) // Gentle processing to preserve icons
          .sharpen(0.6) // Light sharpening to avoid icon artifacts
          .threshold(118);
        break;

      // === ATTACK SECTIONS ===
      case 'attack1-name':
      case 'attack2-name':
        // Attack names are usually bold but can have varying backgrounds
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(150, region.width * 2.8)), kernel: 'cubic' }) // More scaling
          .normalize()
          .linear(1.5, -22) // Higher contrast for better text separation
          .sharpen(1.2) // Stronger sharpening
          .threshold(115); // Lower threshold to capture more text
        break;

      case 'attack1-damage':
      case 'attack2-damage':
        // Damage numbers are usually large and bold - keep current good performance
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(80, region.width * 3)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10)
          .sharpen(1.0)
          .threshold(125); // Keep current settings that work well (96% confidence)
        break;

      case 'attack1-text':
      case 'attack2-text':
        // Attack descriptions - smaller text
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(150, region.width * 1.8)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10)
          .sharpen(0.8)
          .threshold(120);
        break;

      case 'attack1-energy':
      case 'attack2-energy':
      case 'energy-cost-general':
        // Energy symbols need high contrast and edge definition
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(60, region.width * 4)), kernel: 'cubic' })
          .normalize()
          .linear(1.5, -25) // High contrast for symbols
          .sharpen(1.5)
          .threshold(140);
        break;

      // === STATS SECTION ===
      case 'weakness-label':
      case 'resistance-label':
      case 'retreat-label':
        // Stats labels are small text, often with icons nearby
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(100, region.width * 3.5)), kernel: 'cubic' }) // More scaling for small labels
          .normalize()
          .linear(1.4, -20) // Higher contrast to separate from icons
          .sharpen(1.2)
          .threshold(120); // Lower threshold for better capture
        break;

      case 'weakness-value':
      case 'resistance-value':
      case 'retreat-value':
        // Stats values may include symbols and numbers, often small
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(80, region.width * 4)), kernel: 'cubic' }) // More scaling
          .normalize()
          .linear(1.5, -23) // Higher contrast for small values
          .sharpen(1.3)
          .threshold(125);
        break;

      // === CARD INFO ===
      case 'set-number':
        // Set numbers are very small text, often faint
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(120, region.width * 4)), kernel: 'cubic' }) // More scaling for tiny text
          .normalize()
          .linear(1.6, -28) // Much higher contrast for faint set numbers
          .sharpen(1.4)
          .threshold(115); // Lower threshold to capture faint text
        break;

      case 'card-type':
        // Card type info is usually small text
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(100, region.width * 3)), kernel: 'cubic' }) // More scaling
          .normalize()
          .linear(1.4, -20) // Higher contrast
          .sharpen(1.2)
          .threshold(120); // Lower threshold
        break;

      // === FALLBACK REGIONS ===
      case 'stats-general':
        // General stats area with mixed content - keep current good performance
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(150, region.width * 1.8)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10)
          .sharpen(0.8)
          .threshold(125); // Keep settings that found "resistance" and "202"
        break;

      // === LEGACY COMPATIBILITY ===
      case 'hp':
      case 'attack-damage':
      case 'set-number':
        // Numbers: moderate scaling
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(100, region.width * 2.5)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10)
          .sharpen(1.0)
          .threshold(125);
        break;

      case 'ability-name':
      case 'attack-name':
        // Names: moderate scaling
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(120, region.width * 2)), kernel: 'cubic' })
          .normalize()
          .linear(1.3, -15)
          .sharpen(1.0)
          .threshold(130);
        break;

      case 'ability-text':
        // Text blocks: minimal scaling
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(200, region.width * 1.5)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10)
          .sharpen(0.5)
          .threshold(120);
        break;

      case 'stats':
        // Stats area: moderate processing
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(150, region.width * 1.8)), kernel: 'cubic' })
          .normalize()
          .linear(1.2, -10)
          .sharpen(0.8)
          .threshold(125);
        break;

      case 'energy-cost':
        // Energy symbols: high contrast
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(80, region.width * 3)), kernel: 'cubic' })
          .normalize()
          .linear(1.4, -20)
          .sharpen(1.2)
          .threshold(135);
        break;

      default:
        // Generic preprocessing - conservative approach
        pipeline = pipeline
          .resize({ width: Math.round(Math.max(100, region.width * 1.5)), kernel: 'cubic' })
          .normalize()
          .sharpen(0.8)
          .threshold(128);
        break;
    }

    return pipeline.toBuffer();
  }

  /**
   * Detect the boundaries of a trading card within the full image
   * Uses edge detection and contour analysis to find the card rectangle
   */
  private async detectCardBounds(
    imageBuffer: Buffer,
    imageWidth: number,
    imageHeight: number
  ): Promise<CardBounds | null> {
    console.log('🔍 Detecting card boundaries using edge detection...');

    try {
      const image = sharp(imageBuffer);

      // Create an edge detection image to find the card outline
      const edgeBuffer = await image
        .clone()
        .grayscale()
        .normalize() // Auto-adjust contrast
        .blur(1) // Slight blur to reduce noise
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // Edge detection kernel
        })
        .threshold(50) // Keep strong edges
        .toBuffer();

      // Analyze the edge buffer to find the largest rectangular region
      const cardBounds = await this.findLargestRectangle(
        edgeBuffer,
        imageWidth,
        imageHeight
      );

      if (cardBounds && this.validateCardBounds(cardBounds, imageWidth, imageHeight)) {
        return cardBounds;
      }

      // Fallback: try with different parameters
      console.log('🔄 First attempt failed, trying alternative edge detection...');
      
      const altEdgeBuffer = await image
        .clone()
        .grayscale()
        .sharpen(1.0) // Sharpen edges
        .linear(1.5, -50) // Increase contrast
        .convolve({
          width: 3,
          height: 3,
          kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0], // Alternative edge kernel
        })
        .threshold(30) // Lower threshold
        .toBuffer();

      const altCardBounds = await this.findLargestRectangle(
        altEdgeBuffer,
        imageWidth,
        imageHeight
      );

      if (altCardBounds && this.validateCardBounds(altCardBounds, imageWidth, imageHeight)) {
        return altCardBounds;
      }

      // Final fallback: Use heuristic based on typical card positioning
      console.log('🎯 Trying heuristic card detection based on typical positioning...');
      const heuristicBounds = this.detectCardUsingHeuristics(imageWidth, imageHeight);
      
      if (heuristicBounds && this.validateCardBounds(heuristicBounds, imageWidth, imageHeight)) {
        return heuristicBounds;
      }

      console.log('⚠️ Could not detect card boundaries, will use full image');
      return null;
    } catch (error) {
      console.error('❌ Error detecting card bounds:', error);
      return null;
    }
  }

  /**
   * Find the largest rectangular region in an edge-detected image
   */
  private async findLargestRectangle(
    edgeBuffer: Buffer,
    width: number,
    height: number
  ): Promise<CardBounds | null> {
    // Convert buffer to raw pixel data for analysis
    const imageData = await sharp(edgeBuffer).raw().toBuffer();

    // Simplified approach: find the bounding box of all edge pixels
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let edgePixelCount = 0;

    // Scan for edge pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        if (pixelIndex < imageData.length && imageData[pixelIndex] > 128) {
          // Found an edge pixel
          edgePixelCount++;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Check if we found enough edge pixels to form a reasonable card boundary
    const edgePixelRatio = edgePixelCount / (width * height);
    if (edgePixelCount < 100 || edgePixelRatio > 0.3) {
      console.log(`⚠️ Edge detection failed: ${edgePixelCount} pixels, ratio: ${edgePixelRatio.toFixed(3)}`);
      return null;
    }

    // Add some padding and adjust for typical card margins
    const padding = Math.min(width, height) * 0.02; // 2% padding
    const cardBounds: CardBounds = {
      x: Math.max(0, Math.round(minX - padding)),
      y: Math.max(0, Math.round(minY - padding)),
      width: Math.min(width, Math.round(maxX - minX + 2 * padding)),
      height: Math.min(height, Math.round(maxY - minY + 2 * padding)),
      confidence: Math.min(1.0, edgePixelCount / 1000), // Simple confidence based on edge pixels
    };

    console.log(`📐 Detected card bounds: ${cardBounds.x},${cardBounds.y} size: ${cardBounds.width}x${cardBounds.height}`);
    return cardBounds;
  }

  /**
   * Validate that detected card bounds are reasonable for a trading card
   */
  private validateCardBounds(
    bounds: CardBounds,
    imageWidth: number,
    imageHeight: number
  ): boolean {
    // Check aspect ratio - trading cards are typically around 2.5:3.5 ratio
    const aspectRatio = bounds.width / bounds.height;
    const expectedAspectRatio = 2.5 / 3.5; // ~0.714
    const aspectRatioTolerance = 0.3; // Allow 30% variation

    if (Math.abs(aspectRatio - expectedAspectRatio) > aspectRatioTolerance) {
      console.log(`⚠️ Invalid aspect ratio: ${aspectRatio.toFixed(3)} (expected ~${expectedAspectRatio.toFixed(3)})`);
      return false;
    }

    // Check size - card should be at least 20% of image but not more than 95%
    const cardArea = bounds.width * bounds.height;
    const imageArea = imageWidth * imageHeight;
    const areaRatio = cardArea / imageArea;

    if (areaRatio < 0.2 || areaRatio > 0.95) {
      console.log(`⚠️ Invalid size ratio: ${areaRatio.toFixed(3)} (expected 0.2-0.95)`);
      return false;
    }

    // Check position - card should not be at the very edge
    const margin = Math.min(imageWidth, imageHeight) * 0.05; // 5% margin
    if (bounds.x < margin || bounds.y < margin || 
        bounds.x + bounds.width > imageWidth - margin || 
        bounds.y + bounds.height > imageHeight - margin) {
      console.log(`⚠️ Card too close to edge`);
      return false;
    }

    console.log(`✅ Card bounds validation passed (aspect: ${aspectRatio.toFixed(3)}, area: ${areaRatio.toFixed(3)})`);
    return true;
  }

  /**
   * Detect card boundaries using heuristics based on typical card positioning and proportions
   */
  private detectCardUsingHeuristics(imageWidth: number, imageHeight: number): CardBounds | null {
    console.log('🎯 Using heuristic approach for card detection...');
    
    // Trading cards typically have an aspect ratio of ~0.71 (2.5" x 3.5")
    const expectedAspectRatio = 2.5 / 3.5; // ~0.714
    
    // Try different scenarios based on image orientation and typical card positioning
    let bestBounds: CardBounds | null = null;
    let bestScore = 0;
    
    // Scenario 1: Card takes up most of the image with some margin
    for (const marginPercent of [0.05, 0.1, 0.15, 0.2]) {
      const margin = Math.min(imageWidth, imageHeight) * marginPercent;
      const cardWidth = imageWidth - 2 * margin;
      const cardHeight = imageHeight - 2 * margin;
      const aspectRatio = cardWidth / cardHeight;
      
      // Score based on how close to expected aspect ratio
      const aspectScore = 1 - Math.abs(aspectRatio - expectedAspectRatio) / expectedAspectRatio;
      
      if (aspectScore > bestScore && aspectScore > 0.7) { // At least 70% match
        bestScore = aspectScore;
        bestBounds = {
          x: Math.round(margin),
          y: Math.round(margin),
          width: Math.round(cardWidth),
          height: Math.round(cardHeight),
          confidence: aspectScore * 0.8, // Heuristic confidence
        };
      }
    }
    
    // Scenario 2: Card is centered but with asymmetric margins (common in photos)
    if (!bestBounds || bestScore < 0.8) {
      const centerX = imageWidth / 2;
      const centerY = imageHeight / 2;
      
      // Try different card sizes that would fit in the image
      for (const sizePercent of [0.6, 0.7, 0.8, 0.85]) {
        const maxSize = Math.min(imageWidth, imageHeight) * sizePercent;
        
        // Calculate card dimensions maintaining aspect ratio
        let cardWidth, cardHeight;
        if (imageWidth > imageHeight) {
          // Landscape image, card height constrained
          cardHeight = maxSize;
          cardWidth = cardHeight * expectedAspectRatio;
        } else {
          // Portrait image, card width constrained  
          cardWidth = maxSize;
          cardHeight = cardWidth / expectedAspectRatio;
        }
        
        // Check if card fits in image
        if (cardWidth <= imageWidth && cardHeight <= imageHeight) {
          const x = centerX - cardWidth / 2;
          const y = centerY - cardHeight / 2;
          
          const aspectScore = 1.0; // Perfect aspect ratio by design
          const sizeScore = sizePercent; // Larger cards get higher score
          const totalScore = (aspectScore + sizeScore) / 2;
          
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestBounds = {
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(cardWidth),
              height: Math.round(cardHeight),
              confidence: totalScore * 0.6, // Lower confidence for heuristic
            };
          }
        }
      }
    }
    
    if (bestBounds) {
      console.log(`🎯 Heuristic detection found card: ${bestBounds.x},${bestBounds.y} size: ${bestBounds.width}x${bestBounds.height} (score: ${bestScore.toFixed(3)})`);
      return bestBounds;
    }
    
    console.log('❌ Heuristic detection failed');
    return null;
  }

  /**
   * Cluster regions by card zones to get better text groupings
   * Trading cards have predictable layout zones where text appears
   */
  private clusterRegionsByCardZones(
    regions: Array<{ x: number; y: number; width: number; height: number; density: number; confidence?: number }>, 
    cardWidth: number, 
    cardHeight: number
  ): Array<{ x: number; y: number; width: number; height: number; density: number; confidence?: number }> {
    // Define card zones where text typically appears (relative coordinates)
    const zones = [
      { name: 'card-name', x: 0.05, y: 0.02, width: 0.9, height: 0.08 },      // Top name area
      { name: 'energy-cost', x: 0.7, y: 0.08, width: 0.25, height: 0.06 },    // Energy symbols
      { name: 'card-type', x: 0.05, y: 0.14, width: 0.9, height: 0.05 },      // Type line
      { name: 'hp-value', x: 0.8, y: 0.02, width: 0.15, height: 0.08 },       // HP area
      { name: 'flavor-text', x: 0.05, y: 0.3, width: 0.9, height: 0.15 },     // Description
      { name: 'attack1-name', x: 0.15, y: 0.52, width: 0.5, height: 0.08 },   // First attack
      { name: 'attack1-damage', x: 0.7, y: 0.52, width: 0.25, height: 0.08 }, // Attack damage
      { name: 'attack2-name', x: 0.15, y: 0.72, width: 0.5, height: 0.08 },   // Second attack
      { name: 'weakness', x: 0.05, y: 0.89, width: 0.35, height: 0.06 },      // Weakness/resistance
      { name: 'resistance', x: 0.4, y: 0.89, width: 0.35, height: 0.06 },     // Resistance area
      { name: 'retreat', x: 0.75, y: 0.89, width: 0.2, height: 0.06 },        // Retreat cost
      { name: 'set-number', x: 0.6, y: 0.92, width: 0.35, height: 0.06 },     // Set info
    ];

    const clusteredRegions: Array<{ x: number; y: number; width: number; height: number; density: number; confidence?: number }> = [];
    
    // For each zone, find regions that fall within it and merge them
    for (const zone of zones) {
      const zoneX = zone.x * cardWidth;
      const zoneY = zone.y * cardHeight;
      const zoneWidth = zone.width * cardWidth;
      const zoneHeight = zone.height * cardHeight;
      
      // Find regions that overlap with this zone
      const regionsInZone = regions.filter(region => {
        const regionCenterX = region.x + region.width / 2;
        const regionCenterY = region.y + region.height / 2;
        
        return regionCenterX >= zoneX && regionCenterX <= zoneX + zoneWidth &&
               regionCenterY >= zoneY && regionCenterY <= zoneY + zoneHeight;
      });
      
      if (regionsInZone.length > 0) {
        // Merge regions within this zone
        const minX = Math.min(...regionsInZone.map(r => r.x));
        const minY = Math.min(...regionsInZone.map(r => r.y));
        const maxX = Math.max(...regionsInZone.map(r => r.x + r.width));
        const maxY = Math.max(...regionsInZone.map(r => r.y + r.height));
        
        const mergedRegion = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          density: regionsInZone.reduce((sum, r) => sum + r.density, 0) / regionsInZone.length,
          confidence: regionsInZone.reduce((sum, r) => sum + (r.confidence || 0.8), 0) / regionsInZone.length
        };
        
        // Only keep reasonably sized merged regions
        if (mergedRegion.width <= cardWidth * 0.95 && mergedRegion.height <= cardHeight * 0.4) {
          clusteredRegions.push(mergedRegion);
        }
      }
    }
    
    console.log(`🏷️ Zone clustering: ${regions.length} → ${clusteredRegions.length} regions`);
    return clusteredRegions;
  }
}
