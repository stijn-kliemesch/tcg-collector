import { CardRecognitionService } from './services/vision/card-recognition.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testPokemonCardRecognition() {
  console.log('🃏 Pokemon Card Text Recognition Test');
  console.log('====================================\n');
  
  const service = new CardRecognitionService();
  
  try {
    await service.initialize();
    console.log('✅ Service initialized\n');

    const exampleCardPath = path.join(__dirname, './data/example-card.png');
    const imageBuffer = fs.readFileSync(exampleCardPath);
    console.log(`📄 Loaded card: ${Math.round(imageBuffer.length / 1024)}KB\n`);

    // Expected text we want to find
    const targetTexts = ['Garganacl', '160', 'Energizing Rock Salt', 'Land Crush', '202/182'];
    
    // Try different OCR configurations
    const testConfigs = [
      {
        name: 'Aggressive Text Detection',
        config: {
          confidenceThreshold: 20,
          enhanceContrast: true,
          denoise: true,
          sharpen: true
        }
      },
      {
        name: 'Conservative High Quality',
        config: {
          confidenceThreshold: 60,
          enhanceContrast: true,
          denoise: false,
          sharpen: true
        }
      },
      {
        name: 'Balanced Approach',
        config: {
          confidenceThreshold: 35,
          enhanceContrast: true,
          denoise: true,
          sharpen: false
        }
      }
    ];

    for (const test of testConfigs) {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log('─'.repeat(50));
      
      const result = await service.recognizeCard(imageBuffer, test.config);
      
      // Sort by confidence
      const sortedRegions = result.textRegions.sort((a, b) => b.confidence - a.confidence);
      
      console.log(`📊 Found ${sortedRegions.length} text regions\n`);
      
      // Check for target texts
      let foundTargets = 0;
      
      for (const target of targetTexts) {
        // Look for exact and partial matches
        const matches = sortedRegions.filter(region => {
          const regionText = region.text.toLowerCase().replace(/[^a-z0-9]/g, '');
          const targetText = target.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // For numbers, be more strict
          if (/^\d+$/.test(target) || /^\d+\/\d+$/.test(target)) {
            return regionText === targetText || region.text.includes(target);
          }
          
          // For text, allow partial matches
          if (regionText.length >= 3 && targetText.length >= 3) {
            const similarity = Math.max(
              regionText.includes(targetText) ? targetText.length / regionText.length : 0,
              targetText.includes(regionText) ? regionText.length / targetText.length : 0
            );
            return similarity >= 0.5;
          }
          
          return regionText === targetText;
        });
        
        if (matches.length > 0) {
          const bestMatch = matches.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
          );
          console.log(`  ✅ ${target}: "${bestMatch.text}" (${Math.round(bestMatch.confidence)}%)`);
          foundTargets++;
        } else {
          console.log(`  ❌ ${target}: Not found`);
        }
      }
      
      console.log(`\n📈 Success Rate: ${foundTargets}/${targetTexts.length} (${Math.round(foundTargets/targetTexts.length*100)}%)`);
      
      // Show top 10 most confident results
      console.log('\n🔝 Top 10 recognized text:');
      sortedRegions.slice(0, 10).forEach((region, index) => {
        const confidence = Math.round(region.confidence);
        const icon = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : '🔴';
        console.log(`  ${index + 1}. ${icon} "${region.text}" (${confidence}%)`);
      });
    }
    
    console.log('\n🔍 Detailed Analysis of All Results:');
    console.log('─'.repeat(60));
    
    // Final comprehensive test
    const detailedResult = await service.recognizeCard(imageBuffer, {
      confidenceThreshold: 15, // Very low threshold to catch everything
      enhanceContrast: true,
      denoise: true,
      sharpen: true
    });
    
    const allRegions = detailedResult.textRegions.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`\n📋 All ${allRegions.length} detected text regions:`);
    allRegions.forEach((region, index) => {
      const confidence = Math.round(region.confidence);
      const icon = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : confidence >= 30 ? '🟠' : '🔴';
      const indexStr = (index + 1).toString().padStart(3, ' ');
      const confidenceStr = confidence.toString().padStart(3, ' ');
      console.log(`${indexStr}. ${icon} ${confidenceStr}% | "${region.text}"`);
    });

    await service.cleanup();
    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPokemonCardRecognition();
