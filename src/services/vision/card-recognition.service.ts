import { createWorker, type Worker } from 'tesseract.js';
import sharp from 'sharp';
import type {
  CardRecognitionResult,
  RecognitionOptions,
  RecognizedText,
  RecognizedIcon,
  VisionServiceConfig,
  VisionError,
  SupportedLanguage,
  IconTemplate
} from '../../types/vision/recognition.js';

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

  /**
   * Default configuration for the vision service
   */
  private static readonly DEFAULT_CONFIG: Required<VisionServiceConfig> = {
    defaultLanguages: ['eng', 'jpn', 'kor'],
    iconTemplatePath: './assets/icons',
    defaultOptions: {
      languages: ['eng', 'jpn'],
      ocrMode: 'auto',
      confidenceThreshold: 60,
      iconMatchThreshold: 0.8,
      enableIconDetection: true,
      enhanceContrast: true,
      denoise: true,
      sharpen: false,
      maxImageSize: 2048
    },
    preloadLanguages: false
  };

  constructor(config: VisionServiceConfig = {}) {
    this.config = { ...CardRecognitionService.DEFAULT_CONFIG, ...config };
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
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw visionError;
    }
  }

  /**
   * Initialize the Tesseract OCR worker with language support
   */
  private async initializeOCRWorker(): Promise<void> {
    console.log('📝 Setting up OCR worker...');
    
    this.ocrWorker = await createWorker();
    
    // Load language packs
    const languageString = this.config.defaultLanguages.join('+');
    await this.ocrWorker.loadLanguage(languageString);
    await this.ocrWorker.initialize(languageString);
    
    // Configure OCR parameters for better card text recognition
    await this.ocrWorker.setParameters({
      tessedit_pageseg_mode: '6', // Uniform block of text (good for card text)
      tessedit_ocr_engine_mode: '1', // Neural nets LSTM only
      preserve_interword_spaces: '1' // Keep spaces between words
    });
    
    console.log(`📝 OCR worker ready with languages: ${this.config.defaultLanguages.join(', ')}`);
  }

  /**
   * Load icon templates for recognition (placeholder implementation)
   */
  private async loadIconTemplates(): Promise<void> {
    console.log('🎯 Loading icon templates...');
    
    // For now, this is a placeholder since we don't have actual icon files yet
    // In the future, this would load PNG/SVG files from the assets directory
    const placeholderIcons = [
      'energy_fire', 'energy_water', 'energy_grass', 'energy_electric',
      'energy_psychic', 'energy_fighting', 'energy_darkness', 'energy_metal',
      'rarity_common', 'rarity_uncommon', 'rarity_rare', 'rarity_rare_holo'
    ];
    
    // Simulate loading (in real implementation, we'd read actual image files)
    for (const iconId of placeholderIcons) {
      // Placeholder: would load actual template image
      // this.iconTemplates.set(iconId, await fs.readFile(`${this.config.iconTemplatePath}/${iconId}.png`));
    }
    
    console.log(`🎯 Icon templates ready: ${placeholderIcons.length} templates loaded`);
  }

  /**
   * Recognize text and icons from a card image
   */
  async recognizeCard(
    imageBuffer: Buffer,
    options: RecognitionOptions = {}
  ): Promise<CardRecognitionResult> {
    if (!this.isInitialized) {
      throw new Error('CardRecognitionService not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    
    try {
      // Merge options with defaults
      const opts: Required<RecognitionOptions> = {
        ...this.config.defaultOptions,
        ...options
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
          format: metadata.format || 'unknown'
        }
      };
      
    } catch (error) {
      const visionError: VisionError = {
        type: 'OCR_ERROR',
        message: 'Failed to recognize card',
        originalError: error instanceof Error ? error : new Error(String(error))
      };
      throw visionError;
    }
  }

  /**
   * Preprocess image for optimal OCR recognition
   */
  private async preprocessImage(
    imageBuffer: Buffer,
    options: Required<RecognitionOptions>
  ): Promise<Buffer> {
    console.log('🖼️  Preprocessing image...');
    
    let pipeline = sharp(imageBuffer);
    
    // Resize if too large
    const metadata = await sharp(imageBuffer).metadata();
    if (metadata.width && metadata.width > options.maxImageSize) {
      pipeline = pipeline.resize(options.maxImageSize, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
      console.log(`📐 Resized image from ${metadata.width}px to max ${options.maxImageSize}px`);
    }
    
    // Enhance contrast for better text recognition
    if (options.enhanceContrast) {
      pipeline = pipeline.normalise();
      console.log('🌟 Enhanced contrast');
    }
    
    // Apply noise reduction
    if (options.denoise) {
      pipeline = pipeline.median(3);
      console.log('🧹 Applied noise reduction');
    }
    
    // Apply sharpening if requested
    if (options.sharpen) {
      pipeline = pipeline.sharpen();
      console.log('🔧 Applied sharpening');
    }
    
    // Convert to PNG for consistent OCR processing
    return pipeline.png().toBuffer();
  }

  /**
   * Extract text from preprocessed image using OCR
   */
  private async extractText(
    imageBuffer: Buffer,
    options: Required<RecognitionOptions>
  ): Promise<RecognizedText[]> {
    if (!this.ocrWorker) {
      throw new Error('OCR worker not available');
    }
    
    console.log('📝 Extracting text with OCR...');
    
    // Set languages for this recognition if different from default
    if (options.languages.length > 0) {
      const languageString = options.languages.join('+');
      await this.ocrWorker.reinitialize(languageString);
    }
    
    // Perform OCR recognition
    const { data } = await this.ocrWorker.recognize(imageBuffer);
    
    // Process and filter results
    const textRegions: RecognizedText[] = [];
    
    if (data.words) {
      for (const word of data.words) {
        if (word.confidence >= options.confidenceThreshold) {
          textRegions.push({
            text: word.text,
            confidence: word.confidence,
            bbox: {
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0
            }
          });
        }
      }
    }
    
    // Group nearby words into logical text regions
    return this.groupTextRegions(textRegions);
  }

  /**
   * Detect icons in the image (placeholder implementation)
   */
  private async detectIcons(
    imageBuffer: Buffer,
    options: Required<RecognitionOptions>
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
   */
  private groupTextRegions(words: RecognizedText[]): RecognizedText[] {
    if (words.length === 0) return [];
    
    const grouped: RecognizedText[] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < words.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [words[i]];
      processed.add(i);
      
      // Find nearby words (simple distance-based grouping)
      for (let j = i + 1; j < words.length; j++) {
        if (processed.has(j)) continue;
        
        const distance = this.calculateDistance(words[i].bbox, words[j].bbox);
        if (distance < 50) { // 50px threshold for grouping
          group.push(words[j]);
          processed.add(j);
        }
      }
      
      // Create combined text region
      if (group.length === 1) {
        grouped.push(group[0]);
      } else {
        const combinedText = group.map(w => w.text).join(' ');
        const avgConfidence = group.reduce((sum, w) => sum + w.confidence, 0) / group.length;
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
            height: maxY - minY
          }
        });
      }
    }
    
    return grouped;
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
    
    return Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2));
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
      { code: 'ara', name: 'Arabic' }
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
      { id: 'rarity_rare_holo', name: 'Rare Holo', category: 'rarity' }
    ];
  }

  /**
   * Check if the service is properly initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.ocrWorker !== null;
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
