import { PokemonTCGService } from '../services/pokemon';

// Mock the pokemon-tcg-sdk-typescript module
jest.mock('pokemon-tcg-sdk-typescript', () => ({
  configure: jest.fn(),
  card: {
    where: jest.fn(),
    find: jest.fn(),
  },
  set: {
    find: jest.fn(),
    all: jest.fn(),
  },
}));

describe('PokemonTCGService', () => {
  let service: PokemonTCGService;
  const pokemonTcg = require('pokemon-tcg-sdk-typescript');

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    service = new PokemonTCGService();
  });

  describe('constructor', () => {
    it('should configure the Pokemon TCG SDK with the API key', () => {
      expect(pokemonTcg.configure).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });
    });
  });

  describe('searchCards', () => {
    it('should search cards by name', async () => {
      const mockCards = [{ id: '1', name: 'Pikachu' }];
      pokemonTcg.card.where.mockResolvedValue(mockCards);

      const result = await service.searchCards('Pikachu');

      expect(pokemonTcg.card.where).toHaveBeenCalledWith([
        ['name', 'includes', 'Pikachu'],
      ]);
      expect(result).toEqual(mockCards);
    });

    it('should handle errors when searching cards', async () => {
      const error = new Error('API Error');
      pokemonTcg.card.where.mockRejectedValue(error);

      await expect(service.searchCards('Pikachu')).rejects.toThrow(error);
    });
  });

  describe('getSet', () => {
    it('should get a set by ID', async () => {
      const mockSet = { id: 'base1', name: 'Base Set' };
      pokemonTcg.set.find.mockResolvedValue(mockSet);

      const result = await service.getSet('base1');

      expect(pokemonTcg.set.find).toHaveBeenCalledWith('base1');
      expect(result).toEqual(mockSet);
    });

    it('should handle errors when getting a set', async () => {
      const error = new Error('API Error');
      pokemonTcg.set.find.mockRejectedValue(error);

      await expect(service.getSet('base1')).rejects.toThrow(error);
    });
  });

  describe('getAllSets', () => {
    it('should get all sets', async () => {
      const mockSets = [
        { id: 'base1', name: 'Base Set' },
        { id: 'base2', name: 'Jungle' },
      ];
      pokemonTcg.set.all.mockResolvedValue(mockSets);

      const result = await service.getAllSets();

      expect(pokemonTcg.set.all).toHaveBeenCalled();
      expect(result).toEqual(mockSets);
    });

    it('should handle errors when getting all sets', async () => {
      const error = new Error('API Error');
      pokemonTcg.set.all.mockRejectedValue(error);

      await expect(service.getAllSets()).rejects.toThrow(error);
    });
  });

  describe('getCard', () => {
    it('should get a card by ID', async () => {
      const mockCard = { id: 'xy1-1', name: 'Pikachu' };
      pokemonTcg.card.find.mockResolvedValue(mockCard);

      const result = await service.getCard('xy1-1');

      expect(pokemonTcg.card.find).toHaveBeenCalledWith('xy1-1');
      expect(result).toEqual(mockCard);
    });

    it('should handle errors when getting a card', async () => {
      const error = new Error('API Error');
      pokemonTcg.card.find.mockRejectedValue(error);

      await expect(service.getCard('xy1-1')).rejects.toThrow(error);
    });
  });
});
