import { CardRecognitionService } from './services/vision/card-recognition.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function debugGarganaclRecognition() {
  console.log('🔬 Debug Garganacl Recognition');
  console.log('==============================\n');
  
  const service = new CardRecognitionService();
  
  try {
    await service.initialize();
    console.log('✅ Service initialized\n');

    const exampleCardPath = path.join(__dirname, './data/example-card.png');
    const imageBuffer = fs.readFileSync(exampleCardPath);
    console.log(`📄 Loaded card: ${Math.round(imageBuffer.length / 1024)}KB\n`);

    // Run OCR with debugging enabled
    console.log('🔍 Running OCR with character correction...');
    const result = await service.recognizeCard(imageBuffer, {
      confidenceThreshold: 10, // Very low to catch everything
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      maxImageSize: 2000
    });

    const sortedRegions = result.textRegions.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`📊 Found ${sortedRegions.length} text regions\n`);
    
    // Function to correct common OCR mistakes
    function correctOCRMistakes(text: string): string {
      return text
        .replace(/\)/g, 'l')  // ) often misread as l
        .replace(/\(/g, 'l')  // ( often misread as l  
        .replace(/1/g, 'l')   // 1 often misread as l
        .replace(/\|/g, 'l')  // | often misread as l
        .replace(/0/g, 'o')   // 0 often misread as o
        .replace(/5/g, 's')   // 5 often misread as s
        .replace(/8/g, 'a')   // 8 sometimes misread as a
        .toLowerCase();
    }
    
    // Look for potential "Garganacl" matches with correction
    console.log('🎯 Analyzing all text for "Garganacl" with OCR corrections:');
    console.log('─'.repeat(60));
    
    const garganaclTarget = 'garganacl';
    let bestMatches: Array<{region: any, score: number, corrected: string}> = [];
    
    sortedRegions.forEach(region => {
      const originalText = region.text.toLowerCase().replace(/[^a-z0-9]/g, '');
      const correctedText = correctOCRMistakes(originalText);
      
      // Calculate similarity scores
      let score = 0;
      
      // Check corrected text
      if (correctedText === garganaclTarget) {
        score = 100;
      } else if (correctedText.includes('garganacl') || garganaclTarget.includes(correctedText)) {
        score = 90;
      } else if (correctedText.length >= 5) {
        // Character-by-character comparison
        let matches = 0;
        const minLen = Math.min(correctedText.length, garganaclTarget.length);
        for (let i = 0; i < minLen; i++) {
          if (correctedText[i] === garganaclTarget[i]) matches++;
        }
        score = (matches / garganaclTarget.length) * 100;
      }
      
      if (score >= 30) { // Show potential matches
        bestMatches.push({
          region,
          score: Math.round(score),
          corrected: correctedText
        });
      }
    });
    
    // Sort by score
    bestMatches.sort((a, b) => b.score - a.score);
    
    if (bestMatches.length > 0) {
      console.log('✅ Potential "Garganacl" matches found:');
      bestMatches.forEach((match, index) => {
        const conf = Math.round(match.region.confidence);
        const icon = conf >= 50 ? '🟢' : conf >= 30 ? '🟡' : '🟠';
        console.log(`  ${index + 1}. ${icon} Original: "${match.region.text}" → Corrected: "${match.corrected}"`);
        console.log(`      Confidence: ${conf}%, Match Score: ${match.score}%`);
        console.log(`      Size: ${Math.round(match.region.bbox.width)}x${Math.round(match.region.bbox.height)}px`);
        console.log(`      Position: (${Math.round(match.region.bbox.x)}, ${Math.round(match.region.bbox.y)})`);
        console.log('');
      });
    } else {
      console.log('❌ No potential matches found even with corrections');
    }
    
    // Show all detected text for manual analysis
    console.log('📋 All detected text (for manual analysis):');
    console.log('─'.repeat(50));
    
    sortedRegions.forEach((region, index) => {
      const conf = Math.round(region.confidence);
      const icon = conf >= 50 ? '🟢' : conf >= 30 ? '🟡' : conf >= 15 ? '🟠' : '🔴';
      const corrected = correctOCRMistakes(region.text.toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      console.log(`${(index + 1).toString().padStart(2)}. ${icon} ${conf.toString().padStart(2)}% | "${region.text}" → "${corrected}"`);
      
      if (region.bbox.width > 150 || region.bbox.height > 40) {
        console.log(`      [LARGE: ${Math.round(region.bbox.width)}x${Math.round(region.bbox.height)}px]`);
      }
    });
    
    // Look for large text that might be the card name
    console.log('\n🔍 Large text analysis (likely card name area):');
    const largeText = sortedRegions.filter(r => r.bbox.width > 150 || r.bbox.height > 40);
    
    if (largeText.length > 0) {
      largeText.forEach((region, index) => {
        const conf = Math.round(region.confidence);
        const corrected = correctOCRMistakes(region.text.toLowerCase().replace(/[^a-z0-9]/g, ''));
        console.log(`  ${index + 1}. "${region.text}" → "${corrected}" (${conf}% conf, ${Math.round(region.bbox.width)}x${Math.round(region.bbox.height)}px)`);
      });
    }

    await service.cleanup();
    console.log('\n✅ Debug analysis completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

debugGarganaclRecognition();
