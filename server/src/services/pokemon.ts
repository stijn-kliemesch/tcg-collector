const { PokemonTCG } = require('pokemon-tcg-sdk-typescript');

export class PokemonTCGService {
    constructor() {
        // API key is configured globally through environment variable
        process.env.POKEMONTCG_API_KEY = process.env.POKEMON_TCG_API_KEY;
    }

    async searchCards(query: string) {
        try {
            // Add wildcard if not already present
            const searchQuery = query.endsWith('*') ? query : `${query}*`;
            const cards = await PokemonTCG.findCardsByQueries([
                { name: searchQuery }
            ]);
            return cards;
        } catch (error) {
            console.error('Error searching cards:', error);
            throw error;
        }
    }

    async getSet(setId: string) {
        try {
            const set = await PokemonTCG.findSetByID(setId);
            return set;
        } catch (error) {
            console.error('Error getting set:', error);
            throw error;
        }
    }

    async getAllSets() {
        try {
            const sets = await PokemonTCG.getAllSets();
            return sets;
        } catch (error) {
            console.error('Error getting all sets:', error);
            throw error;
        }
    }

    async getCard(cardId: string) {
        try {
            const card = await PokemonTCG.findCardByID(cardId);
            return card;
        } catch (error) {
            console.error('Error getting card:', error);
            throw error;
        }
    }

    // Note: The Pokemon TCG API doesn't provide price history directly
    // We'll need to implement our own price tracking system later
}
