import { PokemonTCGService } from '../services/pokemon';
import type { Card, Set } from 'pokemon-tcg-sdk-typescript/dist/sdk';

describe('PokemonTCGService Integration', () => {
  let service: PokemonTCGService;
  
  // Increase timeout for all tests since we're calling a real API
  jest.setTimeout(60000);

  beforeAll(() => {
    service = new PokemonTCGService();
  });

  describe('searchCards', () => {
    it('should find Pikachu cards', async () => {
      const cards = await service.searchCards('Pikachu*');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0]).toHaveProperty('name');
      expect(cards[0]).toHaveProperty('id');
      // Cards should contain Pikachu in their name
      expect(cards.every((card: Card) => card.name.includes('Pikachu'))).toBe(true);
    }, 10000); // Increase timeout for API call
  });

  describe('getSet', () => {
    it('should retrieve the Base Set', async () => {
      const set = await service.getSet('base1');
      expect(set).toHaveProperty('id', 'base1');
      expect(set).toHaveProperty('name', 'Base');
      expect(set).toHaveProperty('series', 'Base');
    }, 10000);
  });

  describe('getAllSets', () => {
    it('should retrieve all sets', async () => {
      const sets = await service.getAllSets();
      expect(sets.length).toBeGreaterThan(0);
      // Check if we have some well-known sets
      const setNames = sets.map((set: Set) => set.name);
      expect(setNames).toContain('Base');
      expect(setNames).toContain('Jungle');
    }, 10000);
  });

  describe('getCard', () => {
    it('should retrieve base set Charizard', async () => {
      // Base Set Charizard
      const card = await service.getCard('base1-4');
      expect(card).toHaveProperty('id', 'base1-4');
      expect(card).toHaveProperty('name', 'Charizard');
      expect(card).toHaveProperty('supertype', 'Pokémon');
    }, 10000);
  });
});
