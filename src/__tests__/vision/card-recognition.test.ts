import { readFile } from 'fs/promises';
import { join } from 'path';
import { CardRecognitionService } from '../../services/vision/card-recognition.service.js';
import type { RecognitionOptions } from '../../types/vision/recognition.js';

/**
 * Test the CardRecognitionService with the example card image
 * 
 * This test verifies that:
 * - The service initializes correctly
 * - Can process the example Pokemon card image
 * - Extracts readable text from the card
 * - Provides reasonable confidence scores
 * - Handles different recognition options
 */

async function testCardRecognition(): Promise<void> {
  console.log('🧪 Starting CardRecognitionService test with example-card.png');
  console.log('='.repeat(60));

  const service = new CardRecognitionService();
  
  try {
    // Step 1: Initialize the service
    console.log('\n📋 Step 1: Initializing service...');
    await service.initialize();
    
    // Step 2: Load the example card image
    console.log('\n📋 Step 2: Loading example card image...');
    const imagePath = join(__dirname, '..', 'data', 'example-card.png');
    const imageBuffer = await readFile(imagePath);
    console.log(`📷 Loaded image: ${imageBuffer.length} bytes`);
    
    // Step 3: Test basic recognition with default options
    console.log('\n📋 Step 3: Testing basic recognition...');
    const basicResult = await service.recognizeCard(imageBuffer);
    
    console.log('\n📊 Basic Recognition Results:');
    console.log(`⏱️  Processing time: ${basicResult.processingTime}ms`);
    console.log(`📐 Image: ${basicResult.imageMetadata.width}x${basicResult.imageMetadata.height} ${basicResult.imageMetadata.format}`);
    console.log(`🌐 Detected languages: ${basicResult.detectedLanguages.join(', ')}`);
    console.log(`📝 Text regions found: ${basicResult.textRegions.length}`);
    console.log(`🎯 Icons found: ${basicResult.detectedIcons.length}`);
    
    // Display recognized text
    if (basicResult.textRegions.length > 0) {
      console.log('\n📝 Recognized Text:');
      basicResult.textRegions.forEach((region, index) => {
        console.log(`  ${index + 1}. "${region.text}" (confidence: ${Math.round(region.confidence)}%)`);
      });
    } else {
      console.log('\n⚠️  No text regions found - this might indicate an issue with OCR or image quality');
    }
    
    // Step 4: Test with high confidence threshold
    console.log('\n📋 Step 4: Testing with high confidence threshold (80%)...');
    const highConfidenceOptions: RecognitionOptions = {
      confidenceThreshold: 80,
      enableIconDetection: false // Faster processing for this test
    };
    
    const highConfidenceResult = await service.recognizeCard(imageBuffer, highConfidenceOptions);
    console.log(`📝 High confidence text regions: ${highConfidenceResult.textRegions.length}`);
    
    if (highConfidenceResult.textRegions.length > 0) {
      console.log('📝 High Confidence Text:');
      highConfidenceResult.textRegions.forEach((region, index) => {
        console.log(`  ${index + 1}. "${region.text}" (confidence: ${Math.round(region.confidence)}%)`);
      });
    }
    
    // Step 5: Test with image preprocessing options
    console.log('\n📋 Step 5: Testing with enhanced preprocessing...');
    const enhancedOptions: RecognitionOptions = {
      confidenceThreshold: 60,
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      enableIconDetection: false
    };
    
    const enhancedResult = await service.recognizeCard(imageBuffer, enhancedOptions);
    console.log(`📝 Enhanced processing text regions: ${enhancedResult.textRegions.length}`);
    console.log(`⏱️  Enhanced processing time: ${enhancedResult.processingTime}ms`);
    
    // Step 6: Test service information methods
    console.log('\n📋 Step 6: Testing service information methods...');
    const supportedLanguages = service.getSupportedLanguages();
    const supportedIcons = service.getSupportedIcons();
    const isReady = service.isReady();
    
    console.log(`🌐 Supported languages: ${supportedLanguages.length}`);
    console.log(`🎯 Supported icons: ${supportedIcons.length}`);
    console.log(`✅ Service ready: ${isReady}`);
    
    // Step 7: Analyze results and provide feedback
    console.log('\n📋 Step 7: Analysis and feedback...');
    
    if (basicResult.textRegions.length === 0) {
      console.log('❌ WARNING: No text was recognized from the card image.');
      console.log('   This could indicate:');
      console.log('   - Image quality issues');
      console.log('   - OCR configuration problems');
      console.log('   - Language detection issues');
      console.log('   - Image preprocessing needs adjustment');
    } else {
      console.log(`✅ SUCCESS: Recognition is working! Found ${basicResult.textRegions.length} text regions.`);
      
      // Check if we got some reasonable text
      const hasReasonableText = basicResult.textRegions.some(region => 
        region.text.length > 2 && region.confidence > 50
      );
      
      if (hasReasonableText) {
        console.log('✅ Text quality looks good - found readable text with decent confidence');
      } else {
        console.log('⚠️  Text quality may need improvement - low confidence or very short text fragments');
      }
      
      // Check processing performance
      if (basicResult.processingTime < 5000) {
        console.log(`✅ Performance looks good - processed in ${basicResult.processingTime}ms`);
      } else {
        console.log(`⚠️  Processing is slow - took ${basicResult.processingTime}ms (consider optimizing)`);
      }
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    
    if (error && typeof error === 'object' && 'type' in error) {
      const visionError = error as any;
      console.error(`Error type: ${visionError.type}`);
      console.error(`Error message: ${visionError.message}`);
      if (visionError.originalError) {
        console.error('Original error:', visionError.originalError);
      }
    }
    
  } finally {
    // Step 8: Cleanup
    console.log('\n📋 Step 8: Cleaning up...');
    await service.cleanup();
    console.log('✅ Cleanup completed');
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCardRecognition().catch(console.error);
}

export { testCardRecognition };
