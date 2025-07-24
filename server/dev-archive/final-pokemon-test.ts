import { CardRecognitionService } from './services/vision/card-recognition.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function finalPokemonTest() {
  console.log('🏆 Final Pokemon Card Recognition Test');
  console.log('=====================================\n');
  
  const service = new CardRecognitionService();
  
  try {
    await service.initialize();
    console.log('✅ Service initialized\n');

    const exampleCardPath = path.join(__dirname, './data/example-card.png');
    const imageBuffer = fs.readFileSync(exampleCardPath);
    console.log(`📄 Loaded card: ${Math.round(imageBuffer.length / 1024)}KB\n`);

    // Run OCR with optimized settings
    console.log('🔍 Running optimized OCR...');
    const result = await service.recognizeCard(imageBuffer, {
      confidenceThreshold: 15, // Very low to catch everything
      enhanceContrast: true,
      denoise: true,
      sharpen: true
    });

    const sortedRegions = result.textRegions.sort((a, b) => b.confidence - a.confidence);
    console.log(`📊 Found ${sortedRegions.length} text regions\n`);

    // Target text we're looking for
    const targets = [
      { text: 'Garganacl', type: 'pokemon_name' },
      { text: '160', type: 'hp_or_damage' }, 
      { text: 'Energizing Rock Salt', type: 'attack_name' },
      { text: 'Land Crush', type: 'attack_name' },
      { text: '202/182', type: 'set_number' }
    ];

    console.log('🎯 Advanced Text Matching Results:');
    console.log('─'.repeat(50));

    let totalFound = 0;

    for (const target of targets) {
      console.log(`\n🔍 Looking for "${target.text}" (${target.type}):`);
      
      // Find potential matches with improved fuzzy logic
      const matches = sortedRegions.map(region => {
        const regionText = region.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetText = target.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        let score = 0;
        
        // Skip very short regions unless they're numbers
        if (regionText.length < 2 && target.type !== 'hp_or_damage' && target.type !== 'set_number') {
          return { region, score: 0, match: false };
        }
        
        // Exact match
        if (regionText === targetText) {
          score = 100;
        }
        // Contains full target
        else if (regionText.includes(targetText) && targetText.length >= 3) {
          score = 90;
        }
        // Target contains region (partial match) - but region must be substantial
        else if (targetText.includes(regionText) && regionText.length >= 3) {
          score = 80;
        }
        // Fuzzy matching for similar text - more strict criteria
        else {
          // Split into words and check partial matches
          const targetWords = target.text.toLowerCase().split(/\s+/);
          let hasSignificantMatch = false;
          
          for (const word of targetWords) {
            if (word.length >= 4) { // Only consider longer words
              if (regionText.includes(word)) {
                score = Math.max(score, 70);
                hasSignificantMatch = true;
              } else if (word.includes(regionText) && regionText.length >= 3) {
                score = Math.max(score, 60);
                hasSignificantMatch = true;
              }
            }
          }
          
          // Special case for numbers and set numbers - be more precise
          if (target.type === 'hp_or_damage' || target.type === 'set_number') {
            // Reset score for number matching
            score = 0;
            
            if (region.text.includes('/') && target.text.includes('/')) {
              // Both have slashes, check if numbers match
              const regionNumbers: string[] = region.text.match(/\d+/g) || [];
              const targetNumbers: string[] = target.text.match(/\d+/g) || [];
              
              const hasMatchingNumber = regionNumbers.some((num: string) => targetNumbers.includes(num));
              if (hasMatchingNumber) {
                score = 80;
              }
            } else if (/^\d+$/.test(regionText) && target.text.includes(regionText)) {
              // Pure number match
              score = 85;
            } else if (regionText.length >= 2 && targetText.includes(regionText)) {
              // Partial number match
              score = 70;
            }
          }
        }
        
        return { region, score, match: score > 0 };
      }).filter(m => m.score > 0).sort((a, b) => b.score - a.score);
      
      if (matches.length > 0) {
        const bestMatch = matches[0];
        const confidence = Math.round(bestMatch.region.confidence);
        const icon = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : '🟠';
        
        console.log(`  ✅ ${icon} FOUND: "${bestMatch.region.text}" (${confidence}% confidence, ${bestMatch.score}% match)`);
        
        // Show additional matches if available
        if (matches.length > 1) {
          console.log(`     Other matches:`);
          matches.slice(1, 3).forEach(match => {
            const conf = Math.round(match.region.confidence);
            const ic = conf >= 70 ? '🟢' : conf >= 50 ? '🟡' : '🟠';
            console.log(`       ${ic} "${match.region.text}" (${conf}%, ${match.score}% match)`);
          });
        }
        
        totalFound++;
      } else {
        console.log(`  ❌ NOT FOUND`);
      }
    }

    console.log(`\n📈 Final Results: ${totalFound}/${targets.length} targets found (${Math.round(totalFound/targets.length*100)}%)`);

    // Show all significant text for manual inspection
    console.log('\n📋 All Significant Text (≥40% confidence):');
    console.log('─'.repeat(60));
    
    const significantText = sortedRegions.filter(r => r.confidence >= 40);
    significantText.forEach((region, index) => {
      const confidence = Math.round(region.confidence);
      const icon = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : '🟠';
      console.log(`${(index + 1).toString().padStart(2)}.${icon} ${confidence.toString().padStart(3)}% | "${region.text}"`);
    });

    await service.cleanup();
    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

finalPokemonTest();
