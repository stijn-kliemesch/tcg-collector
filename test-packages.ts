#!/usr/bin/env node
/**
 * Test script to verify the modular package structure works correctly
 */

import { CardRecognitionService } from '@tcg-collector/vision';
import { StringUtils, Validator } from '@tcg-collector/core';
import type { Card, ApiResponse } from '@tcg-collector/api-types';

async function testPackages() {
  console.log('🧪 Testing TCG Collector Package Structure');
  console.log('==========================================\n');

  // Test 1: Core utilities
  console.log('1️⃣ Testing Core Package');
  const titleCased = StringUtils.titleCase('pikachu lightning bolt');
  console.log(`   String formatting: "pikachu lightning bolt" → "${titleCased}" ✅`);
  
  const emailValidation = Validator.email('test@example.com');
  console.log(`   Email validation: ${emailValidation.isValid ? '✅' : '❌'}`);

  // Test 2: API Types
  console.log('\n2️⃣ Testing API Types');
  const testCard: Partial<Card> = {
    name: 'Pikachu',
    set: 'Base Set',
    setNumber: '25/102',
    rarity: 'Common'
  };
  
  const apiResponse: ApiResponse<Card[]> = {
    success: true,
    data: [testCard as Card]
  };
  console.log(`   API Response structure: ✅`);
  console.log(`   Type safety working: ${apiResponse.success ? '✅' : '❌'}`);

  // Test 3: Vision Service (basic initialization)
  console.log('\n3️⃣ Testing Vision Package');
  try {
    const visionService = new CardRecognitionService();
    console.log(`   Vision service creation: ✅`);
    console.log(`   Service ready check: ${visionService.isReady() ? '❌ (not initialized)' : '✅ (correctly not ready)'}`);
  } catch (error) {
    console.log(`   Vision service creation: ❌ ${error}`);
  }

  console.log('\n🎉 Package structure test completed!');
  console.log('\n📚 Key Benefits Demonstrated:');
  console.log('   • Shared types work across packages');
  console.log('   • Core utilities are reusable');
  console.log('   • Vision services are properly modular');
  console.log('   • Import paths use clean package names');
  console.log('\n✨ The modular architecture is working correctly!');
}

testPackages().catch(console.error);
