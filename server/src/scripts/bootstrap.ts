#!/usr/bin/env node

/**
 * Bootstrap script to populate reference data
 * Usage: npm run bootstrap
 */

import { expansionData } from '../services/reference/index.js'

async function bootstrap() {
  console.log('🚀 Starting reference data bootstrap...\n')

  try {
    // Bootstrap expansions
    console.log('📦 Fetching expansion data...')
    const expansions = await expansionData.refreshExpansions()
    
    console.log(`✅ Successfully bootstrapped ${expansions.length} expansions`)
    
    // Display summary
    console.log('\n📊 Bootstrap Summary:')
    console.log('─'.repeat(50))
    expansions.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.name} (${exp.languages.join(', ')}) - ${exp.cardSetCount} sets`)
    })
    
    console.log('\n🎉 Bootstrap completed successfully!')
    
  } catch (error) {
    console.error('❌ Bootstrap failed:', error)
    process.exit(1)
  }
}

// Run bootstrap if this file is executed directly
if (process.argv[1].includes('bootstrap.js')) {
  bootstrap()
}
