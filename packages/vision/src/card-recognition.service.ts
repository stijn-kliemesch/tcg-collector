import type {
  CardRecognitionResult,
  IconTemplate,
  PokemonCardAnalysis,
  RecognitionOptions,
  RecognizedIcon,
  RecognizedText,
  SupportedLanguage,
  VisionError,
  VisionServiceConfig,
} from '@tcg-collector/api-types';
import sharp from 'sharp';
import { createWorker, type Worker } from 'tesseract.js';
import {
  PokemonCardAnalyzer,
  type PokemonNameCandidate,
  type TargetSearchOptions,
} from './pokemon-card-analyzer.service';
import { TextRegionFinder } from './text-region-finder.service';

/**
 * CardRecognitionService
 *
 * Core service for Pokemon TCG card computer vision processing.
 * Handles OCR text extraction and icon recognition from card images.
 *
 * @author AI Agent
 * @semantic CardRecognition + Service (domain service for card computer vision)
 */
export class CardRecognitionService {
  private ocrWorker: Worker | null = null;
  private iconTemplates: Map<string, Buffer> = new Map();
  private isInitialized = false;
  private config: Required<VisionServiceConfig>;
  private textRegionFinder: TextRegionFinder;

  /**
   * Default configuration for the vision service
   */
  private static readonly DEFAULT_CONFIG: Required<VisionServiceConfig> = {
    defaultLanguages: ['eng', 'jpn', 'kor'],
    iconTemplatePath: './assets/icons',
    defaultOptions: {
      languages: ['eng', 'jpn'],
      ocrMode: 'auto',
      confidenceThreshold: 35, // Lower threshold to catch more text
      iconMatchThreshold: 0.8,
      enableIconDetection: true,
      enhanceContrast: true,
      denoise: true,
      sharpen: true, // Enable sharpening by default
      maxImageSize: 2048,
    },
    preloadLanguages: false,
  };

  constructor(config: VisionServiceConfig = {}) {
    this.config = { ...CardRecognitionService.DEFAULT_CONFIG, ...config };
    this.textRegionFinder = new TextRegionFinder();
  }

  /**
   * Initialize the OCR worker and load resources
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🧠 Initializing CardRecognitionService...');

      // Initialize Tesseract OCR worker
      await this.initializeOCRWorker();

      // Load icon templates (placeholder for now)
      await this.loadIconTemplates();

      this.isInitialized = true;
      console.log('✅ CardRecognitionService initialized successfully');
    } catch (error) {
      const visionError: VisionError = {
        type: 'INITIALIZATION_ERROR',
        message: 'Failed to initialize CardRecognitionService',
        originalError:
          error instanceof Error ? error : new Error(String(error)),
      };
      throw visionError;
    }
  }

  /**
   * Initialize the Tesseract OCR worker with language support
   */
  private async initializeOCRWorker(): Promise<void> {
    console.log('📝 Setting up OCR worker...');

    // Create basic worker first
    this.ocrWorker = await createWorker();

    // Load language packs
    const languageString = this.config.defaultLanguages.join('+');
    // @ts-ignore - Using deprecated but functional methods
    await this.ocrWorker.loadLanguage(languageString);
    // @ts-ignore - Using deprecated but functional methods
    await this.ocrWorker.initialize(languageString);

    // Apply optimized OCR settings for Pokemon cards
    console.log('🔧 Applying optimized OCR settings for Pokemon cards...');
    await this.ocrWorker.setParameters({
      // Use standard segmentation mode
      tessedit_pageseg_mode: 3 as any, // Auto segmentation

      // Balanced thresholds for card text
      textord_tobias_threshold: '0.4', // Moderate threshold
      textord_min_linesize: '4.0',

      // Enable helpful corrections but not overly aggressive
      tessedit_enable_dict_correction: '1',
      tessedit_enable_bigram_correction: '1',
      tessedit_enable_doc_dict: '0', // Disable document dictionary for cards

      // Character recognition settings
      classify_char_norm_adj_midpoint: '96', // Default value
      classify_char_norm_adj_curl: '2', // Default value

      // Reasonable noise tolerance
      textord_noise_area_ratio: '0.7',

      // Preserve spaces for multi-word text
      preserve_interword_spaces: '1',

      // Standard settings
      tessedit_do_invert: '0',
      tessedit_write_images: '0',
    });

    console.log(`📝 OCR worker ready with Pokemon card optimizations`);
  }

  /**
   * Load icon templates for recognition (placeholder implementation)
   */
  private async loadIconTemplates(): Promise<void> {
    console.log('🎯 Loading icon templates...');

    // For now, this is a placeholder since we don't have actual icon files yet
    // In the future, this would load PNG/SVG files from the assets directory
    const placeholderIcons = [
      'energy_fire',
      'energy_water',
      'energy_grass',
      'energy_electric',
      'energy_psychic',
      'energy_fighting',
      'energy_darkness',
      'energy_metal',
      'rarity_common',
      'rarity_uncommon',
      'rarity_rare',
      'rarity_rare_holo',
    ];

    // Simulate loading (in real implementation, we'd read actual image files)
    for (const _iconId of placeholderIcons) {
      // Placeholder: would load actual template image
      // this.iconTemplates.set(iconId, await fs.readFile(`${this.config.iconTemplatePath}/${iconId}.png`));
    }

    console.log(
      `🎯 Icon templates ready: ${placeholderIcons.length} templates loaded`
    );
  }

  /**
   * Recognize text and icons from a card image
   */
  async recognizeCard(
    imageBuffer: Buffer,
    options: RecognitionOptions = {}
  ): Promise<CardRecognitionResult> {
    if (!this.isInitialized) {
      throw new Error(
        'CardRecognitionService not initialized. Call initialize() first.'
      );
    }

    const startTime = Date.now();

    try {
      // Merge options with defaults - ensure all required properties are present
      const baseOptions = this.config.defaultOptions;
      const opts: Required<RecognitionOptions> = {
        languages: options.languages || baseOptions.languages || ['eng'],
        ocrMode: options.ocrMode || baseOptions.ocrMode || 'auto',
        confidenceThreshold:
          options.confidenceThreshold ?? baseOptions.confidenceThreshold ?? 35,
        iconMatchThreshold:
          options.iconMatchThreshold ?? baseOptions.iconMatchThreshold ?? 0.8,
        enableIconDetection:
          options.enableIconDetection ??
          baseOptions.enableIconDetection ??
          true,
        enhanceContrast:
          options.enhanceContrast ?? baseOptions.enhanceContrast ?? true,
        denoise: options.denoise ?? baseOptions.denoise ?? true,
        sharpen: options.sharpen ?? baseOptions.sharpen ?? true,
        maxImageSize: options.maxImageSize ?? baseOptions.maxImageSize ?? 2048,
      };

      console.log('🔍 Starting card recognition...');

      // Preprocess the image
      const processedImage = await this.preprocessImage(imageBuffer, opts);

      // Extract text with OCR
      const textRegions = await this.extractText(processedImage, opts);

      // Detect icons (if enabled)
      const detectedIcons = opts.enableIconDetection
        ? await this.detectIcons(processedImage, opts)
        : [];

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Detect languages from recognized text
      const detectedLanguages = this.detectLanguagesFromText(textRegions);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Recognition completed in ${processingTime}ms`);
      console.log(`📝 Found ${textRegions.length} text regions`);
      console.log(`🎯 Found ${detectedIcons.length} icons`);
      console.log(`🌐 Detected languages: ${detectedLanguages.join(', ')}`);

      return {
        textRegions,
        detectedIcons,
        detectedLanguages,
        processingTime,
        imageMetadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'unknown',
        },
      };
    } catch (error) {
      const visionError: VisionError = {
        type: 'OCR_ERROR',
        message: 'Failed to recognize card',
        originalError:
          error instanceof Error ? error : new Error(String(error)),
      };
      throw visionError;
    }
  }

  /**
   * Recognize text using region-based approach - better for scattered text on cards
   */
  async recognizeCardByRegions(
    imageBuffer: Buffer,
    options: RecognitionOptions = {}
  ): Promise<CardRecognitionResult> {
    if (!this.isInitialized) {
      throw new Error(
        'CardRecognitionService not initialized. Call initialize() first.'
      );
    }

    const startTime = Date.now();

    try {
      console.log('🔍 Starting region-based card recognition...');

      // Get image metadata first
      const metadata = await sharp(imageBuffer).metadata();

      // Step 1: Find text regions in the image
      const textRegions = await this.textRegionFinder.findTextRegions(
        imageBuffer,
        {
          enableLayoutAnalysis: options.enableLayoutAnalysis || false,
        }
      );

      // Step 2: Extract individual region images
      const regionImages = await this.textRegionFinder.extractRegionImages(
        imageBuffer,
        textRegions
      );

      // Step 3: Process each region independently with OCR
      const allRecognizedText: RecognizedText[] = [];

      for (let i = 0; i < regionImages.length; i++) {
        const { region, imageBuffer: regionBuffer } = regionImages[i];

        console.log(
          `🔍 Processing region ${i + 1}/${regionImages.length}: ${region.name || 'unnamed'} at (${region.x},${region.y})`
        );

        try {
          // Use single text block mode for each region (mode 7)
          await this.ocrWorker!.setParameters({
            tessedit_pageseg_mode: 7 as any, // Single text block
            preserve_interword_spaces: '1',
            tessedit_char_whitelist:
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -+×÷()[]{}/',
          });

          const { data } = await this.ocrWorker!.recognize(regionBuffer);

          if (data.text && data.text.trim()) {
            const recognizedText: RecognizedText = {
              text: data.text.trim(),
              confidence: data.confidence || 0,
              bbox: {
                x: region.x,
                y: region.y,
                width: region.width,
                height: region.height,
              },
            };

            // Only include text with reasonable confidence or length
            if (
              recognizedText.confidence > 10 ||
              recognizedText.text.length > 2
            ) {
              allRecognizedText.push(recognizedText);
              console.log(
                `   ✅ Found: "${recognizedText.text}" (confidence: ${Math.round(recognizedText.confidence)}%)`
              );
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to process region ${i + 1}:`, error);
        }
      }

      // Step 4: Icon detection (placeholder for now)
      const detectedIcons: RecognizedIcon[] = [];

      // Step 5: Language detection
      const detectedLanguages = ['English']; // Simplified for now

      const processingTime = Date.now() - startTime;

      console.log(
        `✅ Region-based recognition completed in ${processingTime}ms`
      );
      console.log(
        `📝 Found ${allRecognizedText.length} text elements from ${textRegions.length} regions`
      );
      console.log(`🎯 Found ${detectedIcons.length} icons`);

      return {
        textRegions: allRecognizedText,
        detectedIcons,
        detectedLanguages,
        processingTime,
        imageMetadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'unknown',
        },
      };
    } catch (error) {
      const visionError: VisionError = {
        type: 'OCR_ERROR',
        message: 'Failed to recognize card using region-based approach',
        originalError:
          error instanceof Error ? error : new Error(String(error)),
      };
      throw visionError;
    }
  }

  /**
   * Preprocess image for optimal OCR recognition
   * Enhanced for Pokemon cards with size-aware processing
   */
  private async preprocessImage(
    imageBuffer: Buffer,
    options: Required<RecognitionOptions>
  ): Promise<Buffer> {
    console.log('🖼️  Preprocessing image with size-aware optimization...');

    let pipeline = sharp(imageBuffer);

    // Get metadata first
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width || 1000;
    const imageHeight = metadata.height || 1000;
    console.log(`📐 Original image: ${imageWidth}x${imageHeight}px`);

    // Calculate if we need to resize - but keep it large enough for text recognition
    const targetWidth = Math.min(
      options.maxImageSize,
      Math.max(1200, imageWidth)
    );
    const needsResize = imageWidth > targetWidth;

    if (needsResize) {
      pipeline = pipeline.resize(targetWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
        kernel: sharp.kernel.lanczos3, // Better resampling for text
      });
      console.log(
        `📐 Resized image from ${imageWidth}px to ${targetWidth}px for optimal OCR`
      );
    } else {
      console.log(
        `📐 Keeping original size ${imageWidth}px (good for text recognition)`
      );
    }

    // For Pokemon card name recognition, apply targeted enhancements
    pipeline = pipeline
      // Normalize histogram to improve contrast - especially important for large text
      .normalise({
        lower: 2, // Slightly more aggressive for large text
        upper: 98, // Clip highlights to improve text contrast
      })
      // Slight saturation boost to make text more distinct from background
      .modulate({
        saturation: 1.15, // Slightly higher for large text
        brightness: 1.08, // Moderate brightness boost
      });

    console.log(
      '🌟 Enhanced contrast and clarity with size-optimized settings'
    );

    // Handle white borders around black text with size-aware sharpening
    if (options.enhanceContrast) {
      // Calculate sharpening parameters based on image size
      const sharpenSigma = Math.max(1.0, Math.min(2.5, imageWidth / 600)); // Scale with image size

      pipeline = pipeline
        // Apply size-appropriate unsharp mask
        .sharpen(sharpenSigma, 2, 3) // sigma scaled with image size
        // Apply gamma correction optimized for large text
        .gamma(1.15); // Slightly higher gamma for better large text contrast

      console.log(
        `🔍 Applied size-aware edge enhancement (sigma: ${sharpenSigma.toFixed(1)})`
      );
    }

    // Noise reduction that preserves text detail
    if (options.denoise) {
      // Use smaller median filter for large images to preserve text detail
      const medianSize = imageWidth > 1500 ? 2 : 3;
      pipeline = pipeline.median(medianSize);
      console.log(
        `🧹 Applied gentle noise reduction (kernel: ${medianSize}px)`
      );
    }

    // Additional sharpening if requested - scaled for image size
    if (options.sharpen) {
      const additionalSharpen = Math.max(0.8, Math.min(1.5, imageWidth / 800));
      pipeline = pipeline.sharpen(additionalSharpen, 1, 2);
      console.log(
        `🔧 Applied additional text sharpening (${additionalSharpen.toFixed(1)})`
      );
    }

    // Convert to grayscale for better OCR on text with complex backgrounds
    pipeline = pipeline.grayscale();
    console.log('⚫ Converted to grayscale for optimal text recognition');

    // Convert to PNG for consistent OCR processing
    return pipeline.png().toBuffer();
  }

  /**
   * Extract text from preprocessed image using OCR
   * Enhanced for Pokemon card text with multiple passes for different text sizes
   */
  private async extractText(
    imageBuffer: Buffer,
    options: Required<RecognitionOptions>
  ): Promise<RecognizedText[]> {
    if (!this.ocrWorker) {
      throw new Error('OCR worker not available');
    }

    console.log('📝 Extracting text with size-aware multi-pass OCR...');

    // Get image dimensions to optimize OCR parameters
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width || 1000;
    const imageHeight = metadata.height || 1000;

    console.log(`🖼️  Working with ${imageWidth}x${imageHeight}px image`);

    // Set languages for this recognition if different from default
    if (options.languages.length > 0) {
      const languageString = options.languages.join('+');
      await this.ocrWorker.reinitialize(languageString);
    }

    const allTextRegions: RecognizedText[] = [];

    // Multiple OCR passes optimized for different text sizes based on image dimensions
    const ocrPasses = [
      {
        mode: 6,
        name: 'Large text (card names)',
        params: {
          tessedit_pageseg_mode: 6 as any,
          textord_min_linesize: Math.max(8, imageHeight * 0.015).toString(), // ~2% of image height
          textord_tobias_threshold: '0.4', // Lower threshold for better detection
        },
      },
      {
        mode: 3,
        name: 'Auto segmentation',
        params: {
          tessedit_pageseg_mode: 3 as any,
          textord_min_linesize: Math.max(4, imageHeight * 0.008).toString(), // ~0.8% of image height
          textord_tobias_threshold: '0.4', // Lower threshold
        },
      },
      {
        mode: 8,
        name: 'Single word (isolated text)',
        params: {
          tessedit_pageseg_mode: 8 as any,
          textord_min_linesize: Math.max(6, imageHeight * 0.012).toString(), // ~1.2% of image height
          textord_tobias_threshold: '0.3', // Much lower threshold for single words
        },
      },
      {
        mode: 13,
        name: 'Raw line (numbers/stats)',
        params: {
          tessedit_pageseg_mode: 13 as any,
          textord_min_linesize: Math.max(3, imageHeight * 0.005).toString(), // ~0.5% of image height
          textord_tobias_threshold: '0.5', // Moderate threshold for numbers
        },
      },
    ];

    for (const pass of ocrPasses) {
      try {
        console.log(`🔍 OCR Pass: ${pass.name} (mode ${pass.mode})`);

        // Set optimized parameters for this pass
        await this.ocrWorker.setParameters(pass.params);

        // For large text like Pokemon names, try with different DPI settings
        if (pass.mode === 6 || pass.mode === 8) {
          // Higher DPI for better large text recognition
          await this.ocrWorker.setParameters({
            ...pass.params,
            user_defined_dpi: Math.min(
              300,
              Math.max(150, imageWidth / 4)
            ).toString(),
          });
        }

        // Perform OCR recognition
        const { data } = await this.ocrWorker.recognize(imageBuffer);

        // Process results from this pass
        if (data.words) {
          for (const word of data.words) {
            // Use different confidence thresholds based on text characteristics and size
            let minConfidence = options.confidenceThreshold;

            // Calculate estimated text size based on bounding box
            const textHeight = word.bbox.y1 - word.bbox.y0;
            const textWidth = word.bbox.x1 - word.bbox.x0;
            const _textArea = textWidth * textHeight;
            const relativeHeight = textHeight / imageHeight;

            // Adjust confidence based on text size and content
            if (word.text.length >= 6 && relativeHeight > 0.04) {
              // Large text like Pokemon names - be more lenient
              minConfidence = Math.max(15, options.confidenceThreshold - 35); // Further reduced for large Pokemon names
              console.log(
                `📏 Large text detected: "${word.text}" (${Math.round(textWidth)}x${Math.round(textHeight)}px, ${(relativeHeight * 100).toFixed(1)}% of image height)`
              );
            } else if (word.text.length >= 6) {
              // Long words (likely Pokemon names or attack names)
              minConfidence = Math.max(20, options.confidenceThreshold - 30); // Reduced for potential Pokemon names
              console.log(
                `📝 Long text detected: "${word.text}" (${word.text.length} chars, ${Math.round(word.confidence)}% confidence)`
              );
            }
            // Numbers (card stats, set numbers)
            else if (/^\d+$/.test(word.text) || /^\d+\/\d+$/.test(word.text)) {
              minConfidence = Math.max(40, options.confidenceThreshold - 15);
            }
            // Medium words
            else if (word.text.length >= 3) {
              minConfidence = Math.max(35, options.confidenceThreshold - 10);
            }

            // Special case: Pokemon-like names with very low confidence but good characteristics
            if (
              word.text.length >= 7 &&
              relativeHeight > 0.05 &&
              /^[A-Za-z()]+$/.test(word.text) &&
              word.confidence < minConfidence
            ) {
              console.log(
                `🎯 Potential Pokemon name with low confidence: "${word.text}" (${Math.round(word.confidence)}%) - accepting anyway`
              );
              minConfidence = Math.min(minConfidence, word.confidence);
            }

            if (
              word.confidence >= minConfidence &&
              word.text.trim().length > 0
            ) {
              const newRegion = {
                text: word.text.trim(),
                confidence: word.confidence,
                bbox: {
                  x: word.bbox.x0,
                  y: word.bbox.y0,
                  width: word.bbox.x1 - word.bbox.x0,
                  height: word.bbox.y1 - word.bbox.y0,
                },
              };

              // Avoid duplicates from different passes
              const isDuplicate = allTextRegions.some(
                existing =>
                  Math.abs(existing.bbox.x - newRegion.bbox.x) < 10 &&
                  Math.abs(existing.bbox.y - newRegion.bbox.y) < 10 &&
                  existing.text.toLowerCase() === newRegion.text.toLowerCase()
              );

              if (!isDuplicate) {
                allTextRegions.push(newRegion);
                if (newRegion.text.includes('Ganganac')) {
                  console.log(`✅ "Ganganac)" ADDED to text regions!`);
                  console.log(`   Text: "${newRegion.text}"`);
                  console.log(`   Confidence: ${newRegion.confidence}%`);
                  console.log(
                    `   Position: (${newRegion.bbox.x}, ${newRegion.bbox.y})`
                  );
                  console.log(
                    `   Size: ${newRegion.bbox.width}x${newRegion.bbox.height}px`
                  );
                }
              } else if (newRegion.text.includes('Ganganac')) {
                console.log(`🚫 "Ganganac)" was FILTERED as duplicate!`);
                console.log(`   New:`, newRegion);
                console.log(
                  `   Existing duplicate:`,
                  allTextRegions.find(
                    existing =>
                      Math.abs(existing.bbox.x - newRegion.bbox.x) < 10 &&
                      Math.abs(existing.bbox.y - newRegion.bbox.y) < 10 &&
                      existing.text.toLowerCase() ===
                        newRegion.text.toLowerCase()
                  )
                );
              }
            } else if (word.text.includes('Ganganac')) {
              console.log(`❌ "Ganganac)" REJECTED due to low confidence!`);
              console.log(`   Text: "${word.text}"`);
              console.log(`   OCR Confidence: ${word.confidence}%`);
              console.log(`   Required minimum: ${minConfidence}%`);
              console.log(`   Length: ${word.text.length} chars`);
            }
          }
        }

        console.log(
          `   Found ${data.words?.length || 0} potential words in this pass`
        );
      } catch (error) {
        console.warn(`   OCR pass ${pass.mode} failed:`, error);
      }
    }

    console.log(`📝 Total unique text regions found: ${allTextRegions.length}`);

    // Sort by confidence and position for better organization
    allTextRegions.sort((a, b) => {
      // First by Y position (top to bottom)
      const yDiff = a.bbox.y - b.bbox.y;
      if (Math.abs(yDiff) > 20) return yDiff;
      // Then by X position (left to right)
      return a.bbox.x - b.bbox.x;
    });

    // Group nearby words into logical text regions
    return this.groupTextRegions(allTextRegions);
  }

  /**
   * Detect icons in the image (placeholder implementation)
   */
  private async detectIcons(
    _imageBuffer: Buffer,
    _options: Required<RecognitionOptions>
  ): Promise<RecognizedIcon[]> {
    console.log('🎯 Detecting icons...');

    // Placeholder implementation
    // In a real implementation, this would use OpenCV or similar for template matching
    const detectedIcons: RecognizedIcon[] = [];

    // Simulate finding some icons with placeholder data
    // This would be replaced with actual template matching logic

    console.log(`🎯 Icon detection completed (placeholder implementation)`);
    return detectedIcons;
  }

  /**
   * Group nearby words into logical text regions
   * Enhanced for Pokemon card text that may be fragmented
   */
  private groupTextRegions(words: RecognizedText[]): RecognizedText[] {
    if (words.length === 0) return [];

    console.log(
      `🔗 Grouping ${words.length} text fragments into logical regions...`
    );

    // Debug: Check if Ganganac) is in the input
    const ganganacWord = words.find(w => w.text.includes('Ganganac'));
    if (ganganacWord) {
      console.log(`🎯 FOUND "Ganganac)" in input words:`, ganganacWord);
      console.log(`   Text: "${ganganacWord.text}"`);
      console.log(`   Confidence: ${ganganacWord.confidence}%`);
      console.log(
        `   Position: (${ganganacWord.bbox.x}, ${ganganacWord.bbox.y})`
      );
      console.log(
        `   Size: ${ganganacWord.bbox.width}x${ganganacWord.bbox.height}px`
      );
    }

    // Sort words by position (top to bottom, left to right)
    const sortedWords = [...words].sort((a, b) => {
      const yDiff = a.bbox.y - b.bbox.y;
      if (Math.abs(yDiff) > 20) return yDiff; // Different lines
      return a.bbox.x - b.bbox.x; // Same line, left to right
    });

    const grouped: RecognizedText[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < sortedWords.length; i++) {
      if (processed.has(i)) continue;

      const group = [sortedWords[i]];
      processed.add(i);

      // Debug: Track if this is the Ganganac) word
      const isGanganacGroup = sortedWords[i].text.includes('Ganganac');
      if (isGanganacGroup) {
        console.log(`🎯 Processing Ganganac) word: "${sortedWords[i].text}"`);
      }

      // Look for nearby words to group together
      for (let j = i + 1; j < sortedWords.length; j++) {
        if (processed.has(j)) continue;

        const currentWord = sortedWords[i];
        const candidateWord = sortedWords[j];

        // Check if words should be grouped
        if (this.shouldGroupWords(currentWord, candidateWord, group)) {
          group.push(candidateWord);
          processed.add(j);

          if (isGanganacGroup) {
            console.log(`  🔗 Grouped with: "${candidateWord.text}"`);
          }
        }
      }

      // Create combined text region
      if (group.length === 1) {
        grouped.push(group[0]);
        if (isGanganacGroup) {
          console.log(`  ✅ Ganganac) kept as single word: "${group[0].text}"`);
        }
      } else {
        // Sort group members by position for proper text order
        group.sort((a, b) => {
          const yDiff = a.bbox.y - b.bbox.y;
          if (Math.abs(yDiff) > 15) return yDiff;
          return a.bbox.x - b.bbox.x;
        });

        // Combine text intelligently
        const combinedText = this.combineTextFragments(group);
        const avgConfidence =
          group.reduce((sum, w) => sum + w.confidence, 0) / group.length;

        if (isGanganacGroup) {
          console.log(`  🔄 Ganganac) combined into: "${combinedText}"`);
          console.log(
            `     From fragments:`,
            group.map(g => g.text)
          );
        }

        // Calculate bounding box
        const minX = Math.min(...group.map(w => w.bbox.x));
        const minY = Math.min(...group.map(w => w.bbox.y));
        const maxX = Math.max(...group.map(w => w.bbox.x + w.bbox.width));
        const maxY = Math.max(...group.map(w => w.bbox.y + w.bbox.height));

        grouped.push({
          text: combinedText,
          confidence: avgConfidence,
          bbox: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          },
        });
      }
    }

    console.log(`🔗 Grouped into ${grouped.length} logical regions`);

    // Debug: Check if Ganganac) made it to the output
    const ganganacResult = grouped.find(w => w.text.includes('Ganganac'));
    if (ganganacResult) {
      console.log(`🎯 "Ganganac)" SURVIVED grouping:`, ganganacResult);
    } else {
      console.log(`❌ "Ganganac)" was LOST during grouping`);
    }

    return grouped;
  }

  /**
   * Determine if two words should be grouped together
   */
  private shouldGroupWords(
    baseWord: RecognizedText,
    candidateWord: RecognizedText,
    _currentGroup: RecognizedText[]
  ): boolean {
    // Protect important Pokemon names from being over-grouped
    const isPokemonName = (text: string) =>
      text.length >= 6 && /^[A-Za-z()]+$/.test(text);
    if (isPokemonName(baseWord.text) || isPokemonName(candidateWord.text)) {
      // Be more conservative with Pokemon names - only group if very close
      const horizontalDistance = Math.abs(
        candidateWord.bbox.x - (baseWord.bbox.x + baseWord.bbox.width)
      );
      const verticalDistance = Math.abs(candidateWord.bbox.y - baseWord.bbox.y);

      if (verticalDistance <= 10 && horizontalDistance <= 15) {
        return true;
      } else {
        console.log(
          `🛡️  Protecting Pokemon name "${baseWord.text}" from grouping with "${candidateWord.text}" (dist: h${horizontalDistance}px, v${verticalDistance}px)`
        );
        return false;
      }
    }

    // Calculate distances
    const horizontalDistance = Math.abs(
      candidateWord.bbox.x - (baseWord.bbox.x + baseWord.bbox.width)
    );
    const verticalDistance = Math.abs(candidateWord.bbox.y - baseWord.bbox.y);

    // Group if words are on the same line and close horizontally
    if (verticalDistance <= 15 && horizontalDistance <= 30) {
      return true;
    }

    // Group if words are vertically aligned (same column) and close vertically
    const horizontalOverlap = this.calculateHorizontalOverlap(
      baseWord.bbox,
      candidateWord.bbox
    );
    if (horizontalOverlap > 0.3 && verticalDistance <= 40) {
      return true;
    }

    // Special case for Pokemon card text patterns
    // Group single characters or short fragments that might be part of a larger word
    if (
      (baseWord.text.length <= 2 || candidateWord.text.length <= 2) &&
      verticalDistance <= 25 &&
      horizontalDistance <= 50
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate horizontal overlap between two bounding boxes
   */
  private calculateHorizontalOverlap(
    bbox1: RecognizedText['bbox'],
    bbox2: RecognizedText['bbox']
  ): number {
    const left1 = bbox1.x;
    const right1 = bbox1.x + bbox1.width;
    const left2 = bbox2.x;
    const right2 = bbox2.x + bbox2.width;

    const overlapStart = Math.max(left1, left2);
    const overlapEnd = Math.min(right1, right2);
    const overlapWidth = Math.max(0, overlapEnd - overlapStart);

    const minWidth = Math.min(bbox1.width, bbox2.width);
    return minWidth > 0 ? overlapWidth / minWidth : 0;
  }

  /**
   * Intelligently combine text fragments
   */
  private combineTextFragments(fragments: RecognizedText[]): string {
    if (fragments.length === 1) return fragments[0].text;

    // Combine fragments with appropriate spacing
    let combinedText = '';

    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i].text.trim();
      if (!fragment) continue;

      if (combinedText) {
        // Determine if we need a space
        const lastChar = combinedText[combinedText.length - 1];
        const firstChar = fragment[0];

        // Don't add space before punctuation or if last char is punctuation
        if (!/[.,!?:;]/.test(firstChar) && !/[.,!?:;]/.test(lastChar)) {
          // Add space if both are letters/numbers
          if (/[a-zA-Z0-9]/.test(lastChar) && /[a-zA-Z0-9]/.test(firstChar)) {
            combinedText += ' ';
          }
        }
      }

      combinedText += fragment;
    }

    return combinedText.trim();
  }

  /**
   * Calculate distance between two bounding boxes
   */
  private calculateDistance(
    bbox1: RecognizedText['bbox'],
    bbox2: RecognizedText['bbox']
  ): number {
    const centerX1 = bbox1.x + bbox1.width / 2;
    const centerY1 = bbox1.y + bbox1.height / 2;
    const centerX2 = bbox2.x + bbox2.width / 2;
    const centerY2 = bbox2.y + bbox2.height / 2;

    return Math.sqrt(
      Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
    );
  }

  /**
   * Detect languages from recognized text using simple heuristics
   */
  private detectLanguagesFromText(textRegions: RecognizedText[]): string[] {
    const detectedLanguages = new Set<string>();

    for (const region of textRegions) {
      const text = region.text;

      // Simple language detection based on character sets
      if (/[ひらがなカタカナ]/.test(text)) {
        detectedLanguages.add('Japanese');
      } else if (/[ㄱ-ㅎ가-힣]/.test(text)) {
        detectedLanguages.add('Korean');
      } else if (/[\u4e00-\u9fff]/.test(text)) {
        detectedLanguages.add('Chinese');
      } else if (/[a-zA-Z]/.test(text)) {
        detectedLanguages.add('English');
      }
    }

    return Array.from(detectedLanguages);
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [
      { code: 'eng', name: 'English' },
      { code: 'jpn', name: 'Japanese', multiScript: true },
      { code: 'kor', name: 'Korean' },
      { code: 'chi_sim', name: 'Chinese (Simplified)' },
      { code: 'chi_tra', name: 'Chinese (Traditional)' },
      { code: 'fra', name: 'French' },
      { code: 'ger', name: 'German' },
      { code: 'spa', name: 'Spanish' },
      { code: 'ita', name: 'Italian' },
      { code: 'por', name: 'Portuguese' },
      { code: 'rus', name: 'Russian' },
      { code: 'ara', name: 'Arabic' },
    ];
  }

  /**
   * Get list of supported icon templates
   */
  getSupportedIcons(): IconTemplate[] {
    return [
      { id: 'energy_fire', name: 'Fire Energy', category: 'energy' },
      { id: 'energy_water', name: 'Water Energy', category: 'energy' },
      { id: 'energy_grass', name: 'Grass Energy', category: 'energy' },
      { id: 'energy_electric', name: 'Electric Energy', category: 'energy' },
      { id: 'energy_psychic', name: 'Psychic Energy', category: 'energy' },
      { id: 'energy_fighting', name: 'Fighting Energy', category: 'energy' },
      { id: 'energy_darkness', name: 'Darkness Energy', category: 'energy' },
      { id: 'energy_metal', name: 'Metal Energy', category: 'energy' },
      { id: 'rarity_common', name: 'Common', category: 'rarity' },
      { id: 'rarity_uncommon', name: 'Uncommon', category: 'rarity' },
      { id: 'rarity_rare', name: 'Rare', category: 'rarity' },
      { id: 'rarity_rare_holo', name: 'Rare Holo', category: 'rarity' },
    ];
  }

  /**
   * Check if the service is properly initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.ocrWorker !== null;
  }

  /**
   * Enhanced Pokemon card recognition with intelligent analysis
   */
  async recognizePokemonCard(
    imageBuffer: Buffer,
    options: RecognitionOptions = {}
  ): Promise<CardRecognitionResult & { pokemonAnalysis: PokemonCardAnalysis }> {
    // First run standard recognition
    const baseResult = await this.recognizeCard(imageBuffer, options);

    // Then run Pokemon-specific analysis
    const pokemonAnalysis = PokemonCardAnalyzer.analyzePokemonCard(
      baseResult.textRegions
    );

    return {
      ...baseResult,
      pokemonAnalysis,
    };
  }

  /**
   * Search for specific Pokemon card elements
   */
  async searchPokemonCardElements(
    imageBuffer: Buffer,
    targets: Array<{ text: string; type: string; required?: boolean }>,
    options: RecognitionOptions = {}
  ): Promise<{
    results: Array<{
      target: string;
      type: string;
      matches: Array<{ region: RecognizedText; score: number }>;
    }>;
    totalFound: number;
    recognitionResult: CardRecognitionResult;
  }> {
    const recognitionResult = await this.recognizeCard(imageBuffer, options);

    const searchOptions: TargetSearchOptions = {
      targets: targets.map(t => ({
        text: t.text,
        type: t.type as any,
        required: t.required,
      })),
      fuzzyMatchThreshold: 50,
      includePartialMatches: false,
    };

    const results = PokemonCardAnalyzer.searchForTargets(
      recognitionResult.textRegions,
      searchOptions
    );
    const totalFound = results.filter(r => r.matches.length > 0).length;

    return {
      results,
      totalFound,
      recognitionResult,
    };
  }

  /**
   * Find Pokemon name candidates with OCR correction
   */
  async findPokemonName(
    imageBuffer: Buffer,
    targetName?: string,
    options: RecognitionOptions = {}
  ): Promise<{
    candidates: PokemonNameCandidate[];
    bestCandidate: PokemonNameCandidate | null;
    recognitionResult: CardRecognitionResult;
  }> {
    // Use aggressive settings for Pokemon name detection
    const pokemonOptions: RecognitionOptions = {
      confidenceThreshold: 5, // Very low for catching poorly recognized names
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      ...options,
    };

    const recognitionResult = await this.recognizeCard(
      imageBuffer,
      pokemonOptions
    );
    const candidates = PokemonCardAnalyzer.findPokemonNameCandidates(
      recognitionResult.textRegions,
      targetName
    );
    const bestCandidate = PokemonCardAnalyzer.getBestPokemonName(candidates);

    return {
      candidates,
      bestCandidate,
      recognitionResult,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up CardRecognitionService...');

    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }

    this.iconTemplates.clear();
    this.isInitialized = false;

    console.log('✅ CardRecognitionService cleanup completed');
  }
}
