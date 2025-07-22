import { SimpleSetDataService } from '../../services/reference/simple-set-data.service';
import { existsSync } from 'fs';

describe('SimpleSetDataService', () => {
  const setDataService = new SimpleSetDataService();

  describe('getSetsData', () => {
    it('should return sets data if file exists', async () => {
      // This test assumes bootstrap has been run
      const data = await setDataService.getSetsData();
      
      if (existsSync('data/reference/sets.json')) {
        expect(data).toBeDefined();
        expect(data?.expansionName).toBe('Pokémon Trading Card Game');
        expect(data?.groups).toBeInstanceOf(Array);
        expect(data?.totalSets).toBeGreaterThan(0);
        
        console.log('Set Data Structure:');
        console.log(`Expansion: ${data?.expansionName}`);
        console.log(`Total Sets: ${data?.totalSets}`);
        console.log(`Groups: ${data?.groups.length}`);
        
        data?.groups.forEach(group => {
          console.log(`\n${group.name}:`);
          group.generations.forEach(generation => {
            console.log(`  ${generation.name}: ${generation.sets.length} sets`);
            generation.sets.slice(0, 2).forEach(set => {
              console.log(`    - ${set.name}`);
            });
          });
        });
      } else {
        expect(data).toBeNull();
        console.log('Sets data file not found - run bootstrap first');
      }
    });
  });

  describe('searchSets', () => {
    it('should find sets matching search query', async () => {
      const results = await setDataService.searchSets('Vending');
      
      if (existsSync('data/reference/sets.json')) {
        expect(results).toBeInstanceOf(Array);
        console.log(`Found ${results.length} sets matching "Vending":`);
        results.forEach(set => {
          console.log(`- ${set.name}`);
        });
      }
    });
  });

  describe('getSetsByGroup', () => {
    it('should find Japanese sets group', async () => {
      const japaneseGroup = await setDataService.getSetsByGroup('Japanese');
      
      if (existsSync('data/reference/sets.json')) {
        expect(japaneseGroup).toBeDefined();
        expect(japaneseGroup?.name).toContain('Japanese');
        console.log(`Found group: ${japaneseGroup?.name}`);
        console.log(`Generations: ${japaneseGroup?.generations.length}`);
      }
    });
  });

  describe('getCacheInfo', () => {
    it('should return cache information', async () => {
      const cacheInfo = await setDataService.getCacheInfo();
      
      if (existsSync('data/reference/sets.json')) {
        expect(cacheInfo).toBeDefined();
        expect(cacheInfo?.totalSets).toBeGreaterThan(0);
        expect(cacheInfo?.groups).toBeGreaterThan(0);
        expect(cacheInfo?.lastUpdated).toBeTruthy();
        expect(cacheInfo?.version).toBeTruthy();
        
        console.log('Cache Info:', cacheInfo);
      } else {
        expect(cacheInfo).toBeNull();
        console.log('Cache file not found');
      }
    });
  });
});
