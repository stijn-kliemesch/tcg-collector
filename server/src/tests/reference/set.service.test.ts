import { SetService } from '../../services/reference/set.service';

describe('SetService', () => {
  const setService = new SetService();
  const pokemonTcgUrl =
    'https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Trading_Card_Game';

  describe('scrapeSets', () => {
    it('should scrape sets from Pokemon TCG expansion page', async () => {
      const result = await setService.scrapeSets(pokemonTcgUrl);

      expect(result).toBeDefined();
      expect(result.expansionName).toBeTruthy();
      expect(result.groups).toBeInstanceOf(Array);
      expect(result.totalSets).toBeGreaterThan(0);

      // Should find at least one group
      const groupNames = result.groups.map((g: any) => g.name);
      expect(groupNames.length).toBeGreaterThan(0);
      console.log('Found groups:', groupNames);

      // Each group should have generations
      result.groups.forEach((group: any) => {
        expect(group.generations).toBeInstanceOf(Array);
        expect(group.generations.length).toBeGreaterThan(0);

        // Each generation should have sets
        group.generations.forEach((generation: any) => {
          expect(generation.name).toBeTruthy();
          expect(generation.sets).toBeInstanceOf(Array);

          // Each set should have a name
          generation.sets.forEach((set: any) => {
            expect(set.name).toBeTruthy();
            expect(typeof set.name).toBe('string');
            if (set.link) {
              expect(set.link).toMatch(
                /^https:\/\/bulbapedia\.bulbagarden\.net/
              );
            }
          });
        });
      });

      console.log('Scraped Set Data Structure:');
      console.log(`Expansion: ${result.expansionName}`);
      console.log(`Total Sets: ${result.totalSets}`);
      result.groups.forEach(group => {
        console.log(`\n${group.name}:`);
        group.generations.forEach(generation => {
          console.log(`  ${generation.name}: ${generation.sets.length} sets`);
          generation.sets.slice(0, 3).forEach(set => {
            console.log(`    - ${set.name}`);
          });
          if (generation.sets.length > 3) {
            console.log(`    ... and ${generation.sets.length - 3} more sets`);
          }
        });
      });
    }, 30000); // Longer timeout for web scraping

    it('should handle invalid URLs gracefully', async () => {
      const invalidUrl = 'https://example.com/nonexistent';

      await expect(setService.scrapeSets(invalidUrl)).rejects.toThrow();
    });
  });
});
