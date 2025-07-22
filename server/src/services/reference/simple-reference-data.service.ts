import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Expansion } from '../../types/reference/expansion'

interface StoredReferenceData {
  expansions: Expansion[]
  lastUpdated: string
  version: string
}

export class SimpleReferenceDataService {
  private dataFile = join(process.cwd(), 'data', 'reference', 'expansions.json')

  /**
   * Get all expansions from stored JSON file
   */
  getExpansions(): Expansion[] {
    if (!existsSync(this.dataFile)) {
      console.warn('⚠️  No expansion data found. Run `npm run bootstrap` first.')
      return []
    }

    try {
      const data = readFileSync(this.dataFile, 'utf-8')
      const parsed: StoredReferenceData = JSON.parse(data)
      return parsed.expansions
    } catch (error) {
      console.error('❌ Failed to read expansion data:', error)
      return []
    }
  }

  /**
   * Get expansion by name
   */
  getExpansionByName(name: string): Expansion | null {
    const expansions = this.getExpansions()
    return expansions.find(exp => exp.name === name) || null
  }

  /**
   * Search expansions by partial name or language
   */
  searchExpansions(query: string): Expansion[] {
    const expansions = this.getExpansions()
    const lowerQuery = query.toLowerCase()
    
    return expansions.filter(exp => 
      exp.name.toLowerCase().includes(lowerQuery) ||
      exp.languages.some((lang: string) => lang.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get cache info
   */
  getCacheInfo(): { exists: boolean; lastUpdated: string | null; count: number } {
    if (!existsSync(this.dataFile)) {
      return { exists: false, lastUpdated: null, count: 0 }
    }

    try {
      const data = readFileSync(this.dataFile, 'utf-8')
      const parsed: StoredReferenceData = JSON.parse(data)
      return {
        exists: true,
        lastUpdated: parsed.lastUpdated,
        count: parsed.expansions.length
      }
    } catch {
      return { exists: false, lastUpdated: null, count: 0 }
    }
  }
}

// Export singleton instance
export const simpleReferenceData = new SimpleReferenceDataService()
