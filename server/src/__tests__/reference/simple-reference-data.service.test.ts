import { simpleReferenceData } from '../../services/reference/simple-reference-data.service';

describe('SimpleReferenceDataService', () => {
  it('should be able to read bootstrapped data', () => {
    const cacheInfo = simpleReferenceData.getCacheInfo();

    if (cacheInfo.exists) {
      console.log(
        `✅ Found cached data: ${cacheInfo.count} expansions, last updated: ${cacheInfo.lastUpdated}`
      );

      const expansions = simpleReferenceData.getExpansions();
      expect(expansions.length).toBe(cacheInfo.count);
      expect(expansions.length).toBeGreaterThan(0);

      // Test search functionality
      const pokemonResults = simpleReferenceData.searchExpansions('pokémon');
      expect(pokemonResults.length).toBeGreaterThan(0);

      // Test exact name lookup
      const specific = simpleReferenceData.getExpansionByName(
        'Pokémon Trading Card Game'
      );
      expect(specific).toBeTruthy();
    } else {
      console.log('⚠️  No cached data found - run `npm run bootstrap` first');
      // Just verify the service handles missing data gracefully
      expect(simpleReferenceData.getExpansions()).toEqual([]);
    }
  });
});
