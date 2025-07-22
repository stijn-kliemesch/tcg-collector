#!/usr/bin/env node

/**
 * Bootstrap script to populate reference data
 * Usage: npm run bootstrap
 */

import { ExpansionService } from '../services/reference/expansion.service.js'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function bootstrap() {
  console.log('🚀 Starting reference data bootstrap...\n')

  try {
    // Create data directories if they don't exist
    const dataDir = join(process.cwd(), 'data', 'reference')
    mkdirSync(dataDir, { recursive: true })

    // Bootstrap expansions
    console.log('📦 Fetching expansion data...')
    const expansionService = new ExpansionService()
    const expansions = await expansionService.getExpansions()
    
    // Store to JSON file
    const expansionFile = join(dataDir, 'expansions.json')
    const referenceData = {
      expansions,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
    
    writeFileSync(expansionFile, JSON.stringify(referenceData, null, 2))
    
    console.log(`✅ Successfully bootstrapped ${expansions.length} expansions`)
    console.log(`📁 Data stored in: ${expansionFile}`)
    
    // Display summary
    console.log('\n📊 Bootstrap Summary:')
    console.log('─'.repeat(50))
    expansions.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.name} (${exp.languages.join(', ')}) - ${exp.cardSetCount+exp.promoSetCount} sets`)
    })
    
    console.log('\n🎉 Bootstrap completed successfully!')
    
  } catch (error) {
    console.error('❌ Bootstrap failed:', error)
    process.exit(1)
  }
}

// Run bootstrap if this file is executed directly
if (process.argv[1].includes('bootstrap')) {
  bootstrap()
}
