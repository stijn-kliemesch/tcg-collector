import { JSONFile } from 'lowdb/node';
import { Low } from 'lowdb';
import { join } from 'path';
import type { Expansion } from '../../types/reference/expansion';

// Use process.cwd() for cross-platform path resolution
const projectRoot = process.cwd();
const dataDir = join(projectRoot, 'data', 'reference');

interface ReferenceDB {
  expansions: Expansion[];
  lastUpdated: {
    expansions: string | null;
  };
}

const defaultData: ReferenceDB = {
  expansions: [],
  lastUpdated: {
    expansions: null,
  },
};

export class ReferenceDataService {
  private db: Low<ReferenceDB>;
  private static instance: ReferenceDataService;

  private constructor() {
    const file = join(dataDir, 'reference-data.json');
    const adapter = new JSONFile<ReferenceDB>(file);
    this.db = new Low<ReferenceDB>(adapter, defaultData);
  }

  public static getInstance(): ReferenceDataService {
    if (!ReferenceDataService.instance) {
      ReferenceDataService.instance = new ReferenceDataService();
    }
    return ReferenceDataService.instance;
  }

  async init() {
    await this.db.read();
    this.db.data ||= defaultData;
    await this.db.write();
  }

  // Expansion operations
  async getAllExpansions(): Promise<Expansion[]> {
    return this.db.data.expansions;
  }

  async saveExpansions(expansions: Expansion[]): Promise<void> {
    this.db.data.expansions = expansions;
    this.db.data.lastUpdated.expansions = new Date().toISOString();
    await this.db.write();
  }

  async getExpansionByName(name: string): Promise<Expansion | null> {
    return this.db.data.expansions.find(exp => exp.name === name) || null;
  }

  async getLastUpdated(dataType: 'expansions'): Promise<string | null> {
    return this.db.data.lastUpdated[dataType];
  }

  // Check if data is stale (older than specified hours)
  async isDataStale(
    dataType: 'expansions',
    maxAgeHours: number = 24
  ): Promise<boolean> {
    const lastUpdated = await this.getLastUpdated(dataType);
    if (!lastUpdated) return true;

    const ageMs = Date.now() - new Date(lastUpdated).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  }

  // Bootstrap method to populate data
  async bootstrapExpansions(expansions: Expansion[]): Promise<void> {
    console.log(`Bootstrapping ${expansions.length} expansions...`);
    await this.saveExpansions(expansions);
    console.log('Expansions bootstrapped successfully');
  }
}

// Export singleton instance
export const referenceData = ReferenceDataService.getInstance();
export type { ReferenceDB };
