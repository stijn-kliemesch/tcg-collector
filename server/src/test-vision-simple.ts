import { CardRecognitionService } from './services/vision/card-recognition.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testVision() {
  console.log('🧪 CardRecognitionService Quick Test');
  console.log('===================================\n');
  
  try {
    // Initialize service
    console.log('1. Initializing service...');
    const service = new CardRecognitionService();
    await service.initialize();
    console.log('✅ Service initialized');

    // Load example card
    console.log('\n2. Loading example card...');
    const exampleCardPath = path.join(__dirname, './data/example-card.png');
    
    if (!fs.existsSync(exampleCardPath)) {
      console.error(`❌ Example card not found at: ${exampleCardPath}`);
      return;
    }
    
    const imageBuffer = fs.readFileSync(exampleCardPath);
    console.log(`✅ Loaded card: ${Math.round(imageBuffer.length / 1024)}KB`);

    // Test OCR with enhanced settings for Pokemon cards
    console.log('\n3. Running enhanced OCR for Pokemon cards...');
    const result = await service.recognizeCard(imageBuffer, {
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      confidenceThreshold: 25 // Lower threshold to catch more text
    });
    
    console.log(`✅ OCR complete - found ${result.textRegions.length} text regions`);
    
    // Show results organized by confidence
    if (result.textRegions.length > 0) {
      console.log('\n📝 Text found on card (sorted by confidence):');
      
      // Sort by confidence descending
      const sortedRegions = result.textRegions.sort((a, b) => b.confidence - a.confidence);
      
      // Look for the expected text with better matching
      console.log('\n🎯 Looking for expected text:');
      
      // Look for the expected text with better matching
      const expectedTexts = ['Garganacl', '160', 'Energizing Rock Salt', 'Land Crush', '202/182'];
      console.log('\n🎯 Looking for expected text:');
      
      expectedTexts.forEach(expected => {
        const matches = sortedRegions.filter(region => {
          const regionText = region.text.toLowerCase().replace(/[^a-z0-9]/g, '');
          const expectedText = expected.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Exact match
          if (regionText === expectedText) return true;
          
          // Partial match (at least 70% of expected text or region contains expected)
          if (regionText.length >= 3 && expectedText.length >= 3) {
            return regionText.includes(expectedText) || expectedText.includes(regionText);
          }
          
          // For shorter text, be more strict
          return regionText === expectedText;
        });
        
        if (matches.length > 0) {
          const bestMatch = matches.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
          );
          console.log(`  ✅ Found "${expected}": "${bestMatch.text}" (${Math.round(bestMatch.confidence)}% confidence)`);
        } else {
          // Look for partial matches with lower threshold
          const partialMatches = sortedRegions.filter(region => {
            const regionText = region.text.toLowerCase();
            const expectedLower = expected.toLowerCase();
            
            // Check if any word from expected appears in region or vice versa
            const expectedWords = expectedLower.split(/\s+/);
            return expectedWords.some(word => 
              word.length >= 3 && (regionText.includes(word) || word.includes(regionText))
            );
          });
          
          if (partialMatches.length > 0) {
            const bestPartial = partialMatches.reduce((best, current) => 
              current.confidence > best.confidence ? current : best
            );
            console.log(`  🟡 Partial "${expected}": "${bestPartial.text}" (${Math.round(bestPartial.confidence)}% confidence)`);
          } else {
            console.log(`  ❌ Missing: "${expected}"`);
          }
        }
      });
      
      console.log('\n📋 All detected text regions:');
      sortedRegions.forEach((region, index) => {
        const confidence = Math.round(region.confidence);
        const confidenceIcon = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : '🔴';
        console.log(`  ${index + 1}. ${confidenceIcon} "${region.text}" (${confidence}% confidence)`);
      });
      
      // Show statistics
      const highConfidence = sortedRegions.filter(r => r.confidence >= 70).length;
      const mediumConfidence = sortedRegions.filter(r => r.confidence >= 50 && r.confidence < 70).length;
      const lowConfidence = sortedRegions.filter(r => r.confidence < 50).length;
      
      console.log('\n📊 Recognition Statistics:');
      console.log(`  🟢 High confidence (≥70%): ${highConfidence} regions`);
      console.log(`  🟡 Medium confidence (50-69%): ${mediumConfidence} regions`);
      console.log(`  🔴 Low confidence (<50%): ${lowConfidence} regions`);
      
    } else {
      console.log('⚠️  No text regions found');
    }

    // Cleanup
    console.log('\n4. Cleaning up...');
    await service.cleanup();
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVision();
