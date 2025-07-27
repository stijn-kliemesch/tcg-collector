import { ExpansionService } from './expansion.service';
import { referenceData } from './reference-data.service';
import type { Expansion } from '../../types/reference/expansion';

export class ExpansionDataService {
  private expansionService: ExpansionService;
  private static instance: ExpansionDataService;

  private constructor() {
    this.expansionService = new ExpansionService();
  }

  public static getInstance(): ExpansionDataService {
    if (!ExpansionDataService.instance) {
      ExpansionDataService.instance = new ExpansionDataService();
    }
    return ExpansionDataService.instance;
  }

  /**
   * Get expansions from cache, or fetch and cache if stale/missing
   */
  async getExpansions(forceRefresh: boolean = false): Promise<Expansion[]> {
    await referenceData.init();

    // Check if we should use cached data
    if (!forceRefresh && !(await referenceData.isDataStale('expansions'))) {
      const cached = await referenceData.getAllExpansions();
      if (cached.length > 0) {
        console.log('Using cached expansion data');
        return cached;
      }
    }

    // Fetch fresh data
    console.log('Fetching fresh expansion data from Bulbapedia...');
    const freshExpansions = await this.expansionService.getExpansions();

    // Cache the fresh data
    await referenceData.saveExpansions(freshExpansions);

    return freshExpansions;
  }

  /**
   * Force refresh expansion data from source
   */
  async refreshExpansions(): Promise<Expansion[]> {
    return this.getExpansions(true);
  }

  /**
   * Get a specific expansion by name
   */
  async getExpansionByName(name: string): Promise<Expansion | null> {
    const expansions = await this.getExpansions();
    return expansions.find(exp => exp.name === name) || null;
  }

  /**
   * Search expansions by partial name match
   */
  async searchExpansions(query: string): Promise<Expansion[]> {
    const expansions = await this.getExpansions();
    const lowerQuery = query.toLowerCase();

    return expansions.filter(
      exp =>
        exp.name.toLowerCase().includes(lowerQuery) ||
        exp.languages.some(lang => lang.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<{
    hasCache: boolean;
    lastUpdated: string | null;
    isStale: boolean;
    count: number;
  }> {
    await referenceData.init();

    const expansions = await referenceData.getAllExpansions();
    const lastUpdated = await referenceData.getLastUpdated('expansions');
    const isStale = await referenceData.isDataStale('expansions');

    return {
      hasCache: expansions.length > 0,
      lastUpdated,
      isStale,
      count: expansions.length,
    };
  }
}

// Export singleton instance
export const expansionData = ExpansionDataService.getInstance();
