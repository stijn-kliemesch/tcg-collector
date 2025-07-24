import { CardRecognitionService } from './vision/card-recognition.service.js';
import { PokemonCardAnalyzer } from './vision/pokemon-card-analyzer.service.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Demonstration service showing clean usage of Pokemon card recognition capabilities
 * 
 * This replaces the various test scripts with organized, reusable functionality.
 * 
 * @author AI Agent
 * @semantic PokemonCardDemo + Service (demo service showcasing Pokemon card recognition)
 */
export class PokemonCardDemoService {
  private cardService: CardRecognitionService;

  constructor() {
    this.cardService = new CardRecognitionService();
  }

  async initialize(): Promise<void> {
    await this.cardService.initialize();
  }

  async cleanup(): Promise<void> {
    await this.cardService.cleanup();
  }

  /**
   * Demonstrate comprehensive Pokemon card analysis
   */
  async demonstrateFullAnalysis(imagePath: string): Promise<void> {
    console.log('🎯 Pokemon Card Recognition Demo');
    console.log('================================\n');

    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`📄 Loaded card: ${Math.round(imageBuffer.length / 1024)}KB\n`);

    // Comprehensive recognition with Pokemon analysis
    const result = await this.cardService.recognizePokemonCard(imageBuffer, {
      confidenceThreshold: 15,
      enhanceContrast: true,
      denoise: true,
      sharpen: true
    });

    console.log(`📊 Found ${result.textRegions.length} text regions`);
    console.log(`🎯 Processing time: ${result.processingTime}ms\n`);

    // Display formatted analysis
    const analysisReport = PokemonCardAnalyzer.formatAnalysisResults(result.pokemonAnalysis);
    console.log(analysisReport);
  }

  /**
   * Demonstrate targeted Pokemon name search
   */
  async demonstratePokemonNameSearch(imagePath: string, targetName: string): Promise<void> {
    console.log(`🔍 Searching for Pokemon: "${targetName}"`);
    console.log('─'.repeat(40));

    const imageBuffer = fs.readFileSync(imagePath);

    const result = await this.cardService.findPokemonName(imageBuffer, targetName);

    if (result.candidates.length > 0) {
      console.log('✅ Pokemon name candidates found:');
      result.candidates.forEach((candidate, index) => {
        const ocrIcon = candidate.ocrConfidence >= 50 ? '🟢' : candidate.ocrConfidence >= 30 ? '🟡' : '🟠';
        const matchIcon = candidate.matchConfidence >= 40 ? '🎯' : candidate.matchConfidence >= 25 ? '🎲' : '🔍';
        
        console.log(`  ${index + 1}. ${matchIcon} ${ocrIcon} "${candidate.original}" → "${candidate.corrected}"`);
        console.log(`      OCR: ${Math.round(candidate.ocrConfidence)}%, Match: ${Math.round(candidate.matchConfidence)}%`);
        console.log(`      Size: ${candidate.size}, Position: ${candidate.position}\n`);
      });

      if (result.bestCandidate) {
        console.log('🏆 BEST CANDIDATE:');
        console.log(`    Original: "${result.bestCandidate.original}"`);
        console.log(`    Corrected: "${result.bestCandidate.corrected}"`);
        console.log(`    Confidence: OCR ${Math.round(result.bestCandidate.ocrConfidence)}%, Match ${Math.round(result.bestCandidate.matchConfidence)}%`);
      }
    } else {
      console.log('❌ No Pokemon name candidates found');
    }
  }

  /**
   * Demonstrate searching for specific card elements
   */
  async demonstrateElementSearch(imagePath: string): Promise<void> {
    console.log('🎲 Searching for Card Elements');
    console.log('─'.repeat(30));

    const imageBuffer = fs.readFileSync(imagePath);

    const targets = [
      { text: 'Garganacl', type: 'pokemon_name' },
      { text: '160', type: 'hp' }, 
      { text: 'Energizing Rock Salt', type: 'attack_name' },
      { text: 'Land Crush', type: 'attack_name' },
      { text: '202/182', type: 'set_number' }
    ];

    const result = await this.cardService.searchPokemonCardElements(imageBuffer, targets);

    console.log(`📈 Found ${result.totalFound}/${targets.length} targets\n`);

    for (const searchResult of result.results) {
      if (searchResult.matches.length > 0) {
        const best = searchResult.matches[0];
        const confidence = Math.round(best.region.confidence);
        const icon = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : '🟠';
        
        console.log(`✅ ${icon} ${searchResult.type.toUpperCase()}: "${searchResult.target}"`);
        console.log(`    Found: "${best.region.text}" (${confidence}% OCR, ${best.score}% match)`);
      } else {
        console.log(`❌ ${searchResult.type.toUpperCase()}: "${searchResult.target}" - NOT FOUND`);
      }
    }
  }

  /**
   * Run all demonstrations
   */
  async runAllDemos(imagePath?: string): Promise<void> {
    const defaultImagePath = imagePath || path.join(__dirname, '../data/example-card.png');
    
    try {
      await this.initialize();
      
      await this.demonstrateFullAnalysis(defaultImagePath);
      console.log('\n' + '='.repeat(60) + '\n');
      
      await this.demonstratePokemonNameSearch(defaultImagePath, 'Garganacl');
      console.log('\n' + '='.repeat(60) + '\n');
      
      await this.demonstrateElementSearch(defaultImagePath);
      
      console.log('\n🎉 All demonstrations completed!');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Export a convenience function for quick testing
export async function runPokemonCardDemo(imagePath?: string): Promise<void> {
  const demo = new PokemonCardDemoService();
  await demo.runAllDemos(imagePath);
}

// If running this file directly, run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runPokemonCardDemo().catch(console.error);
}
