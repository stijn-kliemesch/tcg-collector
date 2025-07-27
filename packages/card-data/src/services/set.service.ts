import axios from 'axios';
import * as cheerio from 'cheerio';
import { POKEMON_TCG_SET_STRUCTURE } from '../data/pokemon-tcg-structure.js';
import type {
  Generation,
  SetData,
  SetGroup,
  SetServiceConfig,
} from '../types/set.js';
import { Logger } from '../utils/logger.js';
import { SetExtractor } from '../utils/set-processing.js';

/**
 * Service for scraping and processing Pokemon Trading Card Game set data
 * Uses a hardcoded structure for comprehensive coverage and link discovery
 */
export class SetService {
  private readonly config: SetServiceConfig;

  constructor(config?: Partial<SetServiceConfig>) {
    this.config = {
      baseUrl: 'https://bulbapedia.bulbagarden.net',
      requestTimeout: 10000,
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Scrape sets from a Pokémon Trading Card Game expansion page
   * @param expansionUrl - The URL to the expansion page (e.g., from expansion data)
   * @returns Promise containing the structured set data
   */
  async scrapeSets(expansionUrl: string): Promise<SetData> {
    try {
      const response = await axios.get(expansionUrl, {
        timeout: this.config.requestTimeout,
      });
      const $ = cheerio.load(response.data);

      const expansionName = $('h1.firstHeading').text().trim();
      const groups: SetGroup[] = [];
      let totalSets = 0;

      Logger.target(`Fetching set data for ${expansionName}...`);

      // Process each group from our hardcoded structure
      for (const [groupName, groupData] of Object.entries(
        POKEMON_TCG_SET_STRUCTURE
      )) {
        Logger.processing(`Processing group: ${groupName}`);

        const group: SetGroup = {
          name: groupName,
          generations: [],
        };

        // Process each generation/category in the group
        for (const [genName, genData] of Object.entries(groupData)) {
          const generation: Generation = {
            name: genName,
            sets: [],
          };

          // Extract sets based on the data structure
          const sets = SetExtractor.extractSetsFromStructure(genData as any, $);
          generation.sets = sets;
          totalSets += sets.length;

          if (sets.length > 0) {
            group.generations.push(generation);
            Logger.success(`${genName}: ${sets.length} sets`);
          }
        }

        if (group.generations.length > 0) {
          groups.push(group);
        }
      }

      Logger.celebrate(
        `Total groups found: ${groups.length}, total sets: ${totalSets}\n`
      );

      return {
        expansionName,
        groups,
        totalSets,
      };
    } catch (error) {
      Logger.error('Error scraping sets:', error);
      throw new Error(
        `Failed to scrape sets from ${expansionUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
