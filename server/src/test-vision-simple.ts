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

    // Test OCR
    console.log('\n3. Running OCR...');
    const result = await service.recognizeCard(imageBuffer);
    
    console.log(`✅ OCR complete - found ${result.textRegions.length} text regions`);
    
    // Show results
    if (result.textRegions.length > 0) {
      console.log('\n📝 Text found on card:');
      result.textRegions.forEach((region, index) => {
        console.log(`  ${index + 1}. "${region.text}" (${Math.round(region.confidence)}% confidence)`);
      });
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
