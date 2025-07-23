import { CardRecognitionService } from './services/vision/card-recognition.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function focusedGarganaclTest() {
  console.log('🎯 Focused Garganacl Recognition Test');
  console.log('====================================\n');
  
  const service = new CardRecognitionService();
  
  try {
    await service.initialize();
    console.log('✅ Service initialized\n');

    const exampleCardPath = path.join(__dirname, './data/example-card.png');
    const imageBuffer = fs.readFileSync(exampleCardPath);
    console.log(`📄 Loaded card: ${Math.round(imageBuffer.length / 1024)}KB\n`);

    // Try multiple configurations specifically optimized for card names
    const testConfigs = [
      {
        name: 'Large Text Optimized (Mode 6)',
        config: {
          confidenceThreshold: 15,
          enhanceContrast: true,
          denoise: false,
          sharpen: true,
          maxImageSize: 1600 // Keep it large for better text recognition
        }
      },
      {
        name: 'Single Word Focus (Mode 8)',
        config: {
          confidenceThreshold: 20,
          enhanceContrast: true,
          denoise: true,
          sharpen: true,
          maxImageSize: 1400
        }
      },
      {
        name: 'Ultra Low Threshold',
        config: {
          confidenceThreshold: 10,
          enhanceContrast: true,
          denoise: false,
          sharpen: false,
          maxImageSize: 2000
        }
      }
    ];

    for (const test of testConfigs) {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log('─'.repeat(50));
      
      const result = await service.recognizeCard(imageBuffer, test.config);
      const sortedRegions = result.textRegions.sort((a, b) => b.confidence - a.confidence);
      
      console.log(`📊 Found ${sortedRegions.length} text regions\n`);
      
      // Look specifically for Garganacl or similar text
      console.log('🔍 Scanning for Pokemon name candidates:');
      
      const pokemonNameCandidates = sortedRegions.filter(region => {
        const text = region.text.toLowerCase().replace(/[^a-z]/g, '');
        
        // Look for text that could be "Garganacl"
        if (text.length >= 6) {
          // Check for partial matches or similar patterns
          const garganacl = 'garganacl';
          
          // Exact match
          if (text === garganacl) return true;
          
          // Contains significant portions
          if (text.includes('garg') || text.includes('anacl') || text.includes('ganacl')) return true;
          
          // Character similarity check
          let matches = 0;
          const minLen = Math.min(text.length, garganacl.length);
          for (let i = 0; i < minLen; i++) {
            if (text[i] === garganacl[i]) matches++;
          }
          
          if (matches >= 4) return true; // At least 4 matching characters
        }
        
        return false;
      });
      
      if (pokemonNameCandidates.length > 0) {
        pokemonNameCandidates.forEach((candidate, index) => {
          const conf = Math.round(candidate.confidence);
          const icon = conf >= 50 ? '🟢' : conf >= 30 ? '🟡' : '🟠';
          console.log(`  ${index + 1}. ${icon} "${candidate.text}" (${conf}% confidence)`);
          console.log(`      Size: ${Math.round(candidate.bbox.width)}x${Math.round(candidate.bbox.height)}px`);
          console.log(`      Position: (${Math.round(candidate.bbox.x)}, ${Math.round(candidate.bbox.y)})`);
        });
      } else {
        console.log('  ❌ No Pokemon name candidates found');
      }
      
      // Show all text with substantial length
      console.log('\n📝 All substantial text (≥5 characters):');
      const substantialText = sortedRegions.filter(r => r.text.replace(/[^a-zA-Z]/g, '').length >= 5);
      
      if (substantialText.length > 0) {
        substantialText.slice(0, 10).forEach((region, index) => {
          const conf = Math.round(region.confidence);
          const icon = conf >= 50 ? '🟢' : conf >= 30 ? '🟡' : '🟠';
          const cleanText = region.text.replace(/[^a-zA-Z]/g, '');
          console.log(`  ${index + 1}. ${icon} "${region.text}" [${cleanText}] (${conf}%)`);
        });
      }
      
      // Show very large text (likely card name area)
      console.log('\n📏 Large text regions (potentially card name):');
      const largeText = sortedRegions.filter(r => r.bbox.height > 30 || r.bbox.width > 100);
      
      if (largeText.length > 0) {
        largeText.slice(0, 5).forEach((region, index) => {
          const conf = Math.round(region.confidence);
          const icon = conf >= 30 ? '🟢' : conf >= 15 ? '🟡' : '🟠';
          console.log(`  ${index + 1}. ${icon} "${region.text}" (${conf}% conf, ${Math.round(region.bbox.width)}x${Math.round(region.bbox.height)}px)`);
        });
      } else {
        console.log('  ❌ No large text regions detected');
      }
    }

    await service.cleanup();
    console.log('\n✅ Focused test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

focusedGarganaclTest();
