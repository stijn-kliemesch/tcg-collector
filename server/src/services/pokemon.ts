const pokemonTcg = require('pokemon-tcg-sdk-typescript');

export class PokemonTCGService {
    constructor() {
        // Set the API key from environment variable
        pokemonTcg.configure({ apiKey: process.env.POKEMON_TCG_API_KEY });
    }

    async searchCards(query: string) {
        try {
            const cards = await pokemonTcg.card.where([
                ['name', 'includes', query]
            ]);
            return cards;
        } catch (error) {
            console.error('Error searching cards:', error);
            throw error;
        }
    }

    async getSet(setId: string) {
        try {
            const set = await pokemonTcg.set.find(setId);
            return set;
        } catch (error) {
            console.error('Error getting set:', error);
            throw error;
        }
    }

    async getAllSets() {
        try {
            const sets = await pokemonTcg.set.all();
            return sets;
        } catch (error) {
            console.error('Error getting all sets:', error);
            throw error;
        }
    }

    async getCard(cardId: string) {
        try {
            const card = await pokemonTcg.card.find(cardId);
            return card;
        } catch (error) {
            console.error('Error getting card:', error);
            throw error;
        }
    }

    // Note: The Pokemon TCG API doesn't provide price history directly
    // We'll need to implement our own price tracking system later
}
