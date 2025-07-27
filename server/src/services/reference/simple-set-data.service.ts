import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  SetData,
  SetGroup,
  Generation,
  Set,
} from '../../types/reference/set.js';

export interface SetCacheInfo {
  totalSets: number;
  groups: number;
  generations: number;
  lastUpdated: string;
  version: string;
}

export class SimpleSetDataService {
  private static readonly DATA_FILE = join(
    process.cwd(),
    'data',
    'reference',
    'sets.json'
  );
  private cachedData: SetData | null = null;

  /**
   * Get all sets data
   */
  async getSetsData(): Promise<SetData | null> {
    if (!this.cachedData) {
      this.loadSetsData();
    }
    return this.cachedData;
  }

  /**
   * Search sets by name
   */
  async searchSets(query: string): Promise<Set[]> {
    const data = await this.getSetsData();
    if (!data) return [];

    const results: Set[] = [];
    const searchTerm = query.toLowerCase();

    data.groups.forEach(group => {
      group.generations.forEach(generation => {
        generation.sets.forEach(set => {
          if (set.name.toLowerCase().includes(searchTerm)) {
            results.push(set);
          }
        });
      });
    });

    return results;
  }

  /**
   * Get sets by group (e.g., "International sets", "Japanese sets")
   */
  async getSetsByGroup(groupName: string): Promise<SetGroup | null> {
    const data = await this.getSetsData();
    if (!data) return null;

    return (
      data.groups.find(group =>
        group.name.toLowerCase().includes(groupName.toLowerCase())
      ) || null
    );
  }

  /**
   * Get sets by generation within a group
   */
  async getSetsByGeneration(
    groupName: string,
    generationName: string
  ): Promise<Generation | null> {
    const group = await this.getSetsByGroup(groupName);
    if (!group) return null;

    return (
      group.generations.find(gen =>
        gen.name.toLowerCase().includes(generationName.toLowerCase())
      ) || null
    );
  }

  /**
   * Get cache information
   */
  async getCacheInfo(): Promise<SetCacheInfo | null> {
    if (!existsSync(SimpleSetDataService.DATA_FILE)) return null;

    try {
      const rawData = readFileSync(SimpleSetDataService.DATA_FILE, 'utf-8');
      const data = JSON.parse(rawData);

      const totalGenerations = data.groups.reduce(
        (total: number, group: SetGroup) => total + group.generations.length,
        0
      );

      return {
        totalSets: data.totalSets || 0,
        groups: data.groups?.length || 0,
        generations: totalGenerations,
        lastUpdated: data.lastUpdated || 'unknown',
        version: data.version || 'unknown',
      };
    } catch (error) {
      console.error('Error reading sets cache info:', error);
      return null;
    }
  }

  private loadSetsData(): void {
    if (!existsSync(SimpleSetDataService.DATA_FILE)) {
      console.warn('Sets data file not found. Run bootstrap to create it.');
      return;
    }

    try {
      const rawData = readFileSync(SimpleSetDataService.DATA_FILE, 'utf-8');
      const data = JSON.parse(rawData);

      this.cachedData = {
        expansionName: data.expansionName,
        groups: data.groups || [],
        totalSets: data.totalSets || 0,
      };
    } catch (error) {
      console.error('Error loading sets data:', error);
      this.cachedData = null;
    }
  }
}

// Export singleton instance
export const simpleSetData = new SimpleSetDataService();
