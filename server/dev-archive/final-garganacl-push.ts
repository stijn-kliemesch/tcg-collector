import { CardRecognitionService } from './services/vision/card-recognition.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function finalGarganaclPush() {
  console.log('🎯 Final Garganacl Recognition Push');
  console.log('==================================\n');
  
  const service = new CardRecognitionService();
  
  try {
    await service.initialize();
    console.log('✅ Service initialized\n');

    const exampleCardPath = path.join(__dirname, './data/example-card.png');
    const imageBuffer = fs.readFileSync(exampleCardPath);
    console.log(`📄 Loaded card: ${Math.round(imageBuffer.length / 1024)}KB\n`);

    // Based on previous results, we know "Ganganac)" was detected with mode 13
    // Let's focus on that approach with even more aggressive settings
    
    console.log('🔍 Focused OCR for Pokemon name (based on previous "Ganganac)" detection)...');
    const result = await service.recognizeCard(imageBuffer, {
      confidenceThreshold: 5, // Extremely low
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      maxImageSize: 1800 // Keep it reasonable but large enough
    });

    const sortedRegions = result.textRegions.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`📊 Found ${sortedRegions.length} text regions\n`);
    
    // Smart OCR correction function
    function smartCorrectPokemonName(text: string): { corrected: string, confidence: number } {
      const original = text.toLowerCase();
      let corrected = original;
      let confidence = 0;
      
      // Common OCR misreads for Garganacl
      const corrections: Array<{from: RegExp, to: string, confidence: number}> = [
        { from: /\)/g, to: 'l', confidence: 15 },    // ) → l
        { from: /\(/g, to: 'l', confidence: 15 },    // ( → l  
        { from: /1/g, to: 'l', confidence: 10 },     // 1 → l
        { from: /\|/g, to: 'l', confidence: 8 },     // | → l
        { from: /0/g, to: 'o', confidence: 12 },     // 0 → o
        { from: /5/g, to: 's', confidence: 10 },     // 5 → s
        { from: /6/g, to: 'g', confidence: 8 },      // 6 → g
        { from: /9/g, to: 'g', confidence: 8 },      // 9 → g
        { from: /c\)/g, to: 'cl', confidence: 20 },  // c) → cl (specific to Garganacl)
        { from: /ganac\)/g, to: 'ganacl', confidence: 25 }, // ganac) → ganacl
      ];
      
      // Apply corrections
      corrections.forEach(correction => {
        if (correction.from.test(corrected)) {
          corrected = corrected.replace(correction.from, correction.to);
          confidence += correction.confidence;
        }
      });
      
      // Calculate final similarity to "garganacl"
      const target = 'garganacl';
      let similarityBonus = 0;
      
      if (corrected === target) {
        similarityBonus = 50;
      } else if (corrected.includes('garganacl') || target.includes(corrected)) {
        similarityBonus = 40;
      } else if (corrected.length >= 5) {
        // Character matching
        let matches = 0;
        for (let i = 0; i < Math.min(corrected.length, target.length); i++) {
          if (corrected[i] === target[i]) matches++;
        }
        similarityBonus = (matches / target.length) * 30;
      }
      
      return {
        corrected,
        confidence: confidence + similarityBonus
      };
    }
    
    // Analyze all text for Garganacl potential
    console.log('🎯 Smart Garganacl Analysis:');
    console.log('─'.repeat(60));
    
    const candidates: Array<{
      original: string,
      corrected: string, 
      ocrConfidence: number,
      matchConfidence: number,
      size: string,
      position: string
    }> = [];
    
    sortedRegions.forEach(region => {
      const originalText = region.text.toLowerCase().replace(/[^a-z0-9\(\)\|]/g, '');
      
      if (originalText.length >= 3) { // Only consider substantial text
        const smartCorrection = smartCorrectPokemonName(originalText);
        
        if (smartCorrection.confidence >= 15) { // Reasonable threshold
          candidates.push({
            original: region.text,
            corrected: smartCorrection.corrected,
            ocrConfidence: region.confidence,
            matchConfidence: smartCorrection.confidence,
            size: `${Math.round(region.bbox.width)}x${Math.round(region.bbox.height)}px`,
            position: `(${Math.round(region.bbox.x)}, ${Math.round(region.bbox.y)})`
          });
        }
      }
    });
    
    // Sort by match confidence
    candidates.sort((a, b) => b.matchConfidence - a.matchConfidence);
    
    if (candidates.length > 0) {
      console.log('✅ Pokemon name candidates found:');
      candidates.forEach((candidate, index) => {
        const ocrIcon = candidate.ocrConfidence >= 50 ? '🟢' : candidate.ocrConfidence >= 30 ? '🟡' : '🟠';
        const matchIcon = candidate.matchConfidence >= 40 ? '🎯' : candidate.matchConfidence >= 25 ? '🎲' : '🔍';
        
        console.log(`  ${index + 1}. ${matchIcon} ${ocrIcon} "${candidate.original}" → "${candidate.corrected}"`);
        console.log(`      OCR: ${Math.round(candidate.ocrConfidence)}%, Match: ${Math.round(candidate.matchConfidence)}%`);
        console.log(`      Size: ${candidate.size}, Position: ${candidate.position}`);
        console.log('');
      });
      
      // Show the best candidate
      const best = candidates[0];
      if (best.matchConfidence >= 30) {
        console.log('🏆 BEST CANDIDATE for "Garganacl":');
        console.log(`    Original: "${best.original}"`);
        console.log(`    Corrected: "${best.corrected}"`);
        console.log(`    Confidence: OCR ${Math.round(best.ocrConfidence)}%, Match ${Math.round(best.matchConfidence)}%`);
        console.log(`    Size: ${best.size} (${best.size.includes('200') ? 'LARGE - likely card name!' : 'normal'})`);
      }
    } else {
      console.log('❌ No strong Pokemon name candidates found');
    }
    
    // Show some raw data for manual inspection
    console.log('\n🔍 Raw text containing "gan", "gar", or similar patterns:');
    const rawPatterns = sortedRegions.filter(r => {
      const text = r.text.toLowerCase();
      return text.includes('gan') || text.includes('gar') || text.includes('anacl') || text.includes('garg');
    });
    
    if (rawPatterns.length > 0) {
      rawPatterns.forEach(region => {
        console.log(`  - "${region.text}" (${Math.round(region.confidence)}% conf, ${Math.round(region.bbox.width)}x${Math.round(region.bbox.height)}px)`);
      });
    } else {
      console.log('  (No obvious pattern matches found)');
    }

    await service.cleanup();
    console.log('\n✅ Final analysis completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

finalGarganaclPush();
