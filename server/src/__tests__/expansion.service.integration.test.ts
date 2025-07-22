import { ExpansionService } from '../services/reference/expansion.service';

describe('ExpansionService Integration', () => {
  let service: ExpansionService;

  // Increase timeout for web scraping
  jest.setTimeout(30000);

  beforeAll(() => {
    service = new ExpansionService();
  });

  it('should fetch and parse expansions from Bulbapedia', async () => {
    const expansions = await service.getExpansions();
    
    console.log('Found expansions:', expansions.length);
    
    // Should find around 8 expansions (could be more or less depending on page updates)
    expect(expansions.length).toBeGreaterThan(0);
    expect(expansions.length).toBeLessThanOrEqual(15); // reasonable upper bound
    
    // Verify structure of first expansion
    expect(expansions[0]).toMatchObject({
      name: expect.any(String),
      languages: expect.any(Array<String>),
      cardSetCount: expect.any(Number),
      promoSetCount: expect.any(Number)
    });

    // Verify we have some expected expansion names
    const names = expansions.map(exp => exp.name.toLowerCase());
    expect(names.some(name => name.includes('pokémon trading card game') || name.includes('pokemon trading card game'))).toBe(true);
  });
});
