import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Set {
    name: string;
    link?: string;
}

export interface Generation {
    name: string;
    sets: Set[];
}

export interface SetGroup {
    name: string; // "International sets" or "Japanese sets"
    generations: Generation[];
}

export interface SetData {
    expansionName: string;
    groups: SetGroup[];
    totalSets: number;
}

export class SetService {
    private static readonly BASE_URL = 'https://bulbapedia.bulbagarden.net';

    // Hardcoded dataset structure for all Pokemon TCG sets
    private static readonly SET_STRUCTURE = {
        'International sets': {
            'Generation I': {
                'Original Series': [
                    'Base Set',
                    'Jungle',
                    'Fossil',
                    'Base Set 2',
                    'Team Rocket',
                    'Gym Heroes',
                    'Gym Challenge'
                ]
            },
            'Generation II': {
                'Neo Series': [
                    'Neo Genesis',
                    'Neo Discovery',
                    'Neo Revelation',
                    'Neo Destiny'
                ],
                'Legendary Collection Series': [
                    'Legendary Collection'
                ],
                'e-Card Series': [
                    'Expedition Base Set',
                    'Aquapolis',
                    'Skyridge'
                ]
            },
            'Promotional series (Wizards of the Coasts era)': [
                'Southern Islands',
                'Sample Set',
                'Best of Game Cards',
                'Wizards Black Star Promos',
                'W Promotional cards',
                'Miscellaneous Promotional cards 1999-2002',
                'Error cards (until e-Card Series)'
            ],
            'Unreleased sets': [
                'Crosstrainer',
                'Unnamed Wizards Set',
                'Jamboree',
                'Legendary Collection 2'
            ],
            'Generation III': {
                'EX Series': [
                    'EX Ruby & Sapphire',
                    'EX Sandstorm',
                    'EX Dragon',
                    'EX Team Magma vs Team Aqua',
                    'EX Hidden Legends',
                    'EX FireRed & LeafGreen',
                    'EX Team Rocket Returns',
                    'EX Deoxys',
                    'EX Emerald',
                    'EX Unseen Forces',
                    'EX Delta Species',
                    'EX Legend Maker',
                    'EX Holon Phantoms',
                    'EX Crystal Guardians',
                    'EX Dragon Frontiers',
                    'EX Power Keepers'
                ]
            },
            'Generation IV': {
                'Diamond & Pearl Series': [
                    'Diamond & Pearl',
                    'Mysterious Treasures',
                    'Secret Wonders',
                    'Great Encounters',
                    'Majestic Dawn',
                    'Legends Awakened',
                    'Stormfront'
                ],
                'Platinum Series': [
                    'Platinum',
                    'Rising Rivals',
                    'Supreme Victors',
                    'Arceus'
                ],
                'HeartGold & SoulSilver Series': [
                    'HeartGold & SoulSilver',
                    'Unleashed',
                    'Undaunted',
                    'Triumphant'
                ],
                'Call of Legends Series': [
                    'Call of Legends'
                ]
            },
            'Generation V': {
                'Black & White Series': [
                    'Black & White',
                    'Emerging Powers',
                    'Noble Victories',
                    'Next Destinies',
                    'Dark Explorers',
                    'Dragons Exalted',
                    'Dragon Vault — Special Set',
                    'Boundaries Crossed',
                    'Plasma Storm',
                    'Plasma Freeze',
                    'Plasma Blast',
                    'Legendary Treasures'
                ]
            },
            'Generation VI': {
                'XY Series': [
                    'Kalos Starter Set — Special Set',
                    'XY',
                    'Flashfire',
                    'Furious Fists',
                    'Phantom Forces',
                    'Primal Clash',
                    'Double Crisis — Special Set',
                    'Roaring Skies',
                    'Ancient Origins',
                    'BREAKthrough',
                    'BREAKpoint',
                    'Generations — Special Set',
                    'Fates Collide',
                    'Steam Siege',
                    'Evolutions'
                ]
            },
            'Generation VII': {
                'Sun & Moon Series': [
                    'Sun & Moon',
                    'Guardians Rising',
                    'Burning Shadows',
                    'Shining Legends — Special Set',
                    'Crimson Invasion',
                    'Ultra Prism',
                    'Forbidden Light',
                    'Celestial Storm',
                    'Dragon Majesty — Special Set',
                    'Lost Thunder',
                    'Team Up',
                    'Detective Pikachu — Special Set',
                    'Unbroken Bonds',
                    'Unified Minds',
                    'Hidden Fates — Special Set',
                    'Cosmic Eclipse'
                ]
            },
            'Generation VIII': {
                'Sword & Shield Series': [
                    'Sword & Shield',
                    'Rebel Clash',
                    'Darkness Ablaze',
                    'Champion\'s Path — Special Set',
                    'Vivid Voltage',
                    'Shining Fates — Special Set',
                    'Battle Styles',
                    'Chilling Reign',
                    'Evolving Skies',
                    'Celebrations — Special Set',
                    'Fusion Strike',
                    'Brilliant Stars',
                    'Astral Radiance',
                    'Pokémon GO — Special Set',
                    'Lost Origin',
                    'Silver Tempest',
                    'Crown Zenith — Special Set'
                ]
            },
            'Generation IX': {
                'Scarlet & Violet Series': [
                    'Scarlet & Violet',
                    'Paldea Evolved',
                    'Obsidian Flames',
                    '151 — Special Set',
                    'Paradox Rift',
                    'Paldean Fates — Special Set',
                    'Temporal Forces',
                    'Twilight Masquerade',
                    'Shrouded Fable — Special Set',
                    'Stellar Crown',
                    'Surging Sparks',
                    'Prismatic Evolutions — Special Set',
                    'Journey Together',
                    'Destined Rivals',
                    'Black Bolt — Special Set',
                    'White Flare — Special Set'
                ]
            },
            'World Championships Decks': [
                '2004 World Championships',
                '2005 World Championships',
                '2006 World Championships',
                '2007 World Championships',
                '2008 World Championships',
                '2009 World Championships',
                '2010 World Championships',
                '2011 World Championships',
                '2012 World Championships',
                '2013 World Championships',
                '2014 World Championships',
                '2015 World Championships',
                '2016 World Championships',
                '2017 World Championships',
                '2018 World Championships',
                '2019 World Championships',
                '2022 World Championships',
                '2023 Pokémon World Championships'
            ],
            'Trainer Kits': [
                'EX Trainer Kit',
                'EX Trainer Kit 2',
                'Diamond & Pearl Trainer Kit',
                'HS Trainer Kit',
                'Black & White Trainer Kit',
                'XY Trainer Kit',
                'XY Trainer Kit: Bisharp & Wigglytuff',
                'XY Trainer Kit: Latias & Latios',
                'XY Trainer Kit: Pikachu Libre & Suicune',
                'Sun & Moon Trainer Kit: Lycanroc & Alolan Raichu',
                'Sun & Moon Trainer Kit: Alolan Sandslash & Alolan Ninetales'
            ],
            'Promotional series (Nintendo sets era)': [
                'Black Star Promos',
                'Nintendo Black Star Promos',
                'DP Black Star Promos',
                'HGSS Black Star Promos',
                'BW Black Star Promos',
                'XY Black Star Promos',
                'SM Black Star Promos',
                'SWSH Black Star Promos',
                'SVP Black Star Promos',
                {
                    'POP Series': [
                        'POP Series 1',
                        'POP Series 2',
                        'POP Series 3',
                        'POP Series 4',
                        'POP Series 5',
                        'POP Series 6',
                        'POP Series 7',
                        'POP Series 8',
                        'POP Series 9'
                    ]
                },
                {
                    'McDonald\'s Collection': [
                        'McDonald\'s Collection 2011',
                        'McDonald\'s Collection 2012',
                        'McDonald\'s Collection 2013',
                        'McDonald\'s Collection 2014',
                        'McDonald\'s Collection 2015',
                        'McDonald\'s Collection 2016',
                        'McDonald\'s Collection 2017',
                        'McDonald\'s Collection 2018',
                        'McDonald\'s Collection 2019',
                        'McDonald\'s Collection 2021',
                        'McDonald\'s Collection 2022',
                        'McDonald\'s Collection 2023',
                        'McDonald\'s Collection 2024'
                    ]
                },
                {
                    'Miscellaneous sets': [
                        'Winner cards — Neo and EX Series',
                        'Poké Card Creator Pack',
                        'Pokémon Rumble',
                        'Yellow A Alternate cards',
                        'Pokémon Futsal',
                        'Prerelease cards',
                        'Jumbo cards'
                    ]
                },
                {
                    'Miscellaneous cards': [
                        'Miscellaneous Promotional cards 2003-2008',
                        'Miscellaneous Promotional cards 2009-2014',
                        'Miscellaneous Promotional cards 2015-2018',
                        'Miscellaneous Promotional cards 2019-2024',
                        'Error cards (since EX Series)'
                    ]
                }]

        },
        'Japanese sets': {
            'Exclusive sets': {
                'Original era': [
                    'Vending Machine cards Series 1 (Blue)',
                    'Vending Machine cards Series 2 (Red)',
                    'Vending Machine cards Series 3 (Green)'
                ],
                'VS era': [
                    'Pokémon VS'
                ],
                'Web era': [
                    'Pokémon Web'
                ]
            },
            'Generation I': {
                'Original era': [
                    'Expansion Pack',
                    'Pokémon Jungle',
                    'Mystery of the Fossils',
                    'Rocket Gang',
                    'Leaders\' Stadium',
                    'Challenge from the Darkness'
                ]
            },
            'Generation II': {
                'Neo era': [
                    'Gold, Silver, to a New World...',
                    'Crossing the Ruins...',
                    'Awakening Legends',
                    'Darkness, and to Light...'
                ],
                'e-Series': [
                    'Base Expansion Pack',
                    'The Town on No Map',
                    'Wind from the Sea',
                    'Split Earth',
                    'Mysterious Mountains'
                ]
            },
            'Generation III': {
                'ADV era': [
                    'ADV Expansion Pack',
                    'Miracle of the Desert',
                    'Rulers of the Heavens',
                    'Magma VS Aqua: Two Ambitions',
                    'Undone Seal'
                ],
                'PCG era': [
                    'Flight of Legends',
                    'Clash of the Blue Sky',
                    'Rocket Gang Strikes Back',
                    'Golden Sky, Silvery Ocean',
                    'Mirage Forest',
                    'Holon Research Tower',
                    'Holon Phantom',
                    'Miracle Crystal',
                    'Offense and Defense of the Furthest Ends',
                    'World Champions Pack'
                ]
            },
            'Generation IV': {
                'DP era': [
                    'Space-Time Creation',
                    'Secret of the Lakes',
                    'Shining Darkness',
                    'Moonlit Pursuit',
                    'Dawn Dash',
                    'Cry from the Mysterious',
                    'Temple of Anger',
                    'Intense Fight in the Destroyed Sky'
                ],
                'DPt era': [
                    'Galactic\'s Conquest',
                    'Bonds to the End of Time',
                    'Beat of the Frontier',
                    'Advent of Arceus'
                ],
                'LEGEND era': [
                    'HeartGold Collection',
                    'SoulSilver Collection',
                    'Reviving Legends',
                    'Lost Link',
                    'Clash at the Summit'
                ]
            },
            'Generation V': {
                'BW era': [
                    'Black Collection',
                    'White Collection',
                    'Red Collection',
                    'Psycho Drive',
                    'Hail Blizzard',
                    'Dark Rush',
                    'Dragon Selection',
                    'Dragon Blast',
                    'Dragon Blade',
                    'Freeze Bolt',
                    'Cold Flare',
                    'Plasma Gale',
                    'Spiral Force',
                    'Thunder Knuckle',
                    'Shiny Collection',
                    'Megalo Cannon',
                    'EX Battle Boost'
                ]
            },
            'Generation VI': {
                'XY era': [
                    'Collection X',
                    'Collection Y',
                    'Wild Blaze',
                    'Rising Fist',
                    'Phantom Gate',
                    'Gaia Volcano',
                    'Tidal Storm',
                    'Magma Gang vs Aqua Gang: Double Crisis',
                    'Emerald Break',
                    'Bandit Ring',
                    'Legendary Shine Collection'
                ],
                'XY BREAK era': [
                    'Blue Shock',
                    'Red Flash',
                    'Rage of the Broken Heavens',
                    'PokéKyun Collection',
                    'Starter Pack',
                    'Awakening Psychic King',
                    'Premium Champion Pack',
                    'Fever-Burst Fighter',
                    'Cruel Traitor',
                    'Mythical & Legendary Dream Shine Collection',
                    'Expansion Pack 20th Anniversary',
                    'The Best of XY'
                ]
            },
            'Generation VII': {
                'SM era': [
                    'Collection Sun',
                    'Collection Moon',
                    'Sun & Moon',
                    'Islands Await You',
                    'Alolan Moonlight',
                    'Facing a New Trial',
                    'To Have Seen the Battle Rainbow',
                    'Darkness that Consumes Light',
                    'Shining Legends',
                    'Awakened Heroes',
                    'Ultradimensional Beasts',
                    'GX Battle Boost',
                    'Ultra Sun',
                    'Ultra Moon',
                    'Ultra Force',
                    'Forbidden Light',
                    'Dragon Storm',
                    'Champion Road',
                    'Sky-Splitting Charisma',
                    'Thunderclap Spark',
                    'Fairy Rise',
                    'Super-Burst Impact',
                    'Dark Order',
                    'GX Ultra Shiny',
                    'Tag Bolt',
                    'Night Unison',
                    'Full Metal Wall',
                    'Double Blaze',
                    'GG End',
                    'Sky Legend',
                    'Miracle Twin',
                    'Remix Bout',
                    'Dream League',
                    'Alter Genesis',
                    'Tag All Stars'
                ]
            },
            'Generation VIII': {
                'SWSH era': [
                    'Sword',
                    'Shield',
                    'VMAX Rising',
                    'Rebellion Crash',
                    'Explosive Walker',
                    'Infinity Zone',
                    'Legendary Heartbeat',
                    'Amazing Volt Tackle',
                    'Shiny Star V',
                    'Single Strike Master',
                    'Rapid Strike Master',
                    'Peerless Fighters',
                    'Silver Lance',
                    'Jet-Black Spirit',
                    'Eevee Heroes',
                    'Skyscraping Perfection',
                    'Blue Sky Stream',
                    'Fusion Arts',
                    '25th Anniversary Collection',
                    'VMAX Climax',
                    'Star Birth',
                    'Battle Region',
                    'Time Gazer',
                    'Space Juggler',
                    'Dark Phantasma',
                    'Pokémon GO',
                    'Lost Abyss',
                    'Incandescent Arcana',
                    'Paradigm Trigger',
                    'VSTAR Universe'
                ]
            },
            'Generation IX': {
                'SV era': [
                    'Scarlet ex',
                    'Violet ex',
                    'Triplet Beat',
                    'Snow Hazard',
                    'Clay Burst',
                    'Pokémon Card 151',
                    'Ruler of the Black Flame',
                    'Raging Surf',
                    'Ancient Roar',
                    'Future Flash',
                    'Shiny Treasure ex',
                    'Wild Force',
                    'Cyber Judge',
                    'Crimson Haze',
                    'Transformation Mask',
                    'Night Wanderer',
                    'Stellar Miracle',
                    'Paradise Dragona',
                    'Super Electric Breaker'
                ]
            },
            'Promotional sets': {
                'Original era': [
                    'Unnumbered Promotional cards',
                    'Expansion Sheet',
                    'Southern Islands'
                ],
                'e-Card era': [
                    'P Promotional cards',
                    'T Promotional cards',
                    'J Promotional cards',
                    'McDonald\'s Pokémon-e Minimum Pack'
                ],
                'ADV era': [
                    'ADV-P Promotional cards',
                    'PLAY Promotional cards'
                ],
                'PCG era': [
                    'PCG-P Promotional cards',
                    'PokéPark Blue',
                    'PokéPark Forest'
                ],
                'DP era': [
                    'DP-P Promotional cards',
                    'PPP Promotional cards',
                    '10th Movie Commemoration Set',
                    '11th Movie Commemoration Set'
                ],
                'DPt era': [
                    'DPt-P Promotional cards',
                    'Melee! Pokémon Scramble',
                    'Movie Commemoration Random Pack'
                ],
                'LEGEND era': [
                    'L-P Promotional cards',
                    'World Collection - Pikachu World 2010'
                ],
                'BW era': [
                    'BW-P Promotional cards',
                    'Journey Partners'
                ],
                'XY era': [
                    'XY-P Promotional cards'
                ],
                'SM era': [
                    'SM-P Promotional cards',
                    'Great Detective Pikachu'
                ],
                'S&S era': [
                    'S-P Promotional cards'
                ],
                'SV era': [
                    'SV-P Promotional cards'
                ],
                'Miscellaneous': [
                    'Unreleased cards'
                ]
            }
        }
    };

    /**
     * Scrape sets from a Pokémon Trading Card Game expansion page
     * @param expansionUrl - The URL to the expansion page (e.g., from expansion data)
     * @returns Promise containing the structured set data
     */
    async scrapeSets(expansionUrl: string): Promise<SetData> {
        try {
            const response = await axios.get(expansionUrl);
            const $ = cheerio.load(response.data);

            const expansionName = $('h1.firstHeading').text().trim();
            const groups: SetGroup[] = [];
            let totalSets = 0;

            console.log(`🎯 Fetching set data for ${expansionName}...`);

            // Process each group from our hardcoded structure
            for (const [groupName, groupData] of Object.entries(SetService.SET_STRUCTURE)) {
                console.log(`📋 Processing group: ${groupName}`);

                const group: SetGroup = {
                    name: groupName,
                    generations: []
                };

                // Process each generation/category in the group
                for (const [genName, genData] of Object.entries(groupData)) {
                    const generation: Generation = {
                        name: genName,
                        sets: []
                    };

                    // Extract sets based on the data structure
                    const sets = this.extractSetsFromStructure(genData, $);
                    generation.sets = sets;
                    totalSets += sets.length;

                    if (sets.length > 0) {
                        group.generations.push(generation);
                        console.log(`  ✅ ${genName}: ${sets.length} sets`);
                    }
                }

                if (group.generations.length > 0) {
                    groups.push(group);
                }
            }

            console.log(`🎉 Total groups found: ${groups.length}, total sets: ${totalSets}\n`);

            return {
                expansionName,
                groups,
                totalSets
            };
        } catch (error) {
            console.error('Error scraping sets:', error);
            throw new Error(`Failed to scrape sets from ${expansionUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract sets from the hardcoded structure by finding their links on the page
     */
    private extractSetsFromStructure(structure: any, $: cheerio.CheerioAPI): Set[] {
        const sets: Set[] = [];

        if (Array.isArray(structure)) {
            // This is an array that can contain either strings or objects
            for (const item of structure) {
                if (typeof item === 'string') {
                    // Direct set name
                    const link = this.findSetLinkOnPage(item, $);
                    if (link) {
                        sets.push({
                            name: this.cleanSetName(item),
                            link: `${SetService.BASE_URL}${link}`
                        });
                    } else {
                        // Even if we don't find a link, include the set
                        sets.push({
                            name: this.cleanSetName(item)
                        });
                    }
                } else if (typeof item === 'object') {
                    // Nested object, recurse into it
                    sets.push(...this.extractSetsFromStructure(item, $));
                }
            }
        } else if (typeof structure === 'object') {
            // This is a nested structure, recurse into subsections
            for (const subStructure of Object.values(structure)) {
                sets.push(...this.extractSetsFromStructure(subStructure, $));
            }
        }

        return sets;
    }

    /**
     * Find a set's link on the page by searching for the set name
     */
    private findSetLinkOnPage(setName: string, $: cheerio.CheerioAPI): string | null {
        const cleanName = this.cleanSetName(setName);

        // Try to find a link that contains this set name
        let foundLink: string | null = null;

        $('a').each((_, element) => {
            const linkText = $(element).text().trim();
            const href = $(element).attr('href');

            if (href && this.isSetNameMatch(cleanName, linkText)) {
                foundLink = href;
                return false; // Break the loop
            }
        });

        return foundLink;
    }

    /**
     * Check if a link text matches a set name
     */
    private isSetNameMatch(setName: string, linkText: string): boolean {
        const normalizedSetName = setName.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalizedLinkText = linkText.toLowerCase().replace(/[^\w\s]/g, '').trim();

        // Exact match
        if (normalizedSetName === normalizedLinkText) {
            return true;
        }

        // Check if the link text starts with the set name (handles cases like "McDonald's Collection 2013 — French print only")
        if (normalizedLinkText.startsWith(normalizedSetName)) {
            return true;
        }

        // Check if set name is contained in link text (for partial matches)
        if (normalizedLinkText.includes(normalizedSetName) && normalizedSetName.length > 5) {
            return true;
        }

        return false;
    }

    /**
     * Clean set name by removing extra annotations
     */
    private cleanSetName(setName: string): string {
        // Remove annotations like "— Special Set", "— French print only", etc.
        return setName.replace(/\s*—\s*.*$/, '').trim();
    }
}