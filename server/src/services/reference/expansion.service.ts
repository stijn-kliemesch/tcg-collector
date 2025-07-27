import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Expansion } from '../../types/reference/expansion';

export class ExpansionService {
  private static readonly BULBAPEDIA_DOMAIN =
    'https://bulbapedia.bulbagarden.net';
  private static readonly BULBAPEDIA_URL =
    ExpansionService.BULBAPEDIA_DOMAIN + '/wiki/Pokémon_card';

  async getExpansions(): Promise<Expansion[]> {
    try {
      const { data } = await axios.get(ExpansionService.BULBAPEDIA_URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(data, {}, false);
      const expansions: Expansion[] = [];

      // Find the table with "Pokémon card multiple sets" header
      $('h2').each((_, element) => {
        const $header = $(element);
        if ($header.text().includes('Pokémon card multiple sets')) {
          // Find the next table after this header
          const $table = $header.nextAll('table').first();

          // Process each row (skip header row)
          $table
            .find('tr')
            .slice(1)
            .each((_, row) => {
              const $row = $(row);
              const cells = $row.find('td');

              if (cells.length >= 6) {
                // Extract data from table columns:

                // Column 0: Logo (ignore)

                // Column 1: Name (with link)
                const nameCell = $(cells[1]);
                const name =
                  nameCell.find('a').text().trim() || nameCell.text().trim();
                const link = nameCell.find('a').attr('href');

                // Column 2: Language (1 or multiple)
                const language = $(cells[2]).text().trim();

                // Column 3: Number of card sets
                const cardSetsText = $(cells[3]).text().trim();
                const cardSetCount = parseInt(cardSetsText, 10) || 0;

                // Column 4: Number of promo sets
                const promoSetsText = $(cells[4]).text().trim();
                const promoSetCount = parseInt(promoSetsText, 10) || 0;

                // Column 5: Years active (ignore)
                // Columns 6+: example cards (ignore)

                if (name && language) {
                  expansions.push({
                    name,
                    link: ExpansionService.BULBAPEDIA_DOMAIN + link,
                    languages: language.split(' '), // Use language as shorthand
                    cardSetCount,
                    promoSetCount,
                  });
                }
              }
            });
        }
      });

      if (expansions.length === 0) {
        throw new Error('Failed to find expansion data on Bulbapedia');
      }

      return expansions;
    } catch (error) {
      console.error('Error fetching expansions:', error);
      throw new Error('Failed to fetch expansions from Bulbapedia');
    }
  }
}
