import type { Set, SetStructureValue } from '../types/set.js';
import * as cheerio from 'cheerio';

/**
 * Utility class for processing and extracting sets from hardcoded structure
 */
export class SetExtractor {
  private static readonly BASE_URL = 'https://bulbapedia.bulbagarden.net';

  /**
   * Extract sets from the hardcoded structure by finding their links on the page
   */
  static extractSetsFromStructure(
    structure: SetStructureValue,
    $: cheerio.CheerioAPI
  ): Set[] {
    const sets: Set[] = [];

    if (Array.isArray(structure)) {
      // This is an array that can contain either strings or objects
      for (const item of structure) {
        if (typeof item === 'string') {
          // Direct set name
          const link = SetLinkFinder.findSetLinkOnPage(item, $);
          if (link) {
            sets.push({
              name: SetNameCleaner.cleanSetName(item),
              link: `${SetExtractor.BASE_URL}${link}`,
            });
          } else {
            // Even if we don't find a link, include the set
            sets.push({
              name: SetNameCleaner.cleanSetName(item),
            });
          }
        } else if (typeof item === 'object') {
          // Nested object, recurse into it
          sets.push(...SetExtractor.extractSetsFromStructure(item, $));
        }
      }
    } else if (typeof structure === 'object') {
      // This is a nested structure, recurse into subsections
      for (const subStructure of Object.values(structure)) {
        sets.push(...SetExtractor.extractSetsFromStructure(subStructure, $));
      }
    }

    return sets;
  }
}

/**
 * Utility class for finding set links on Wikipedia pages
 */
export class SetLinkFinder {
  /**
   * Find a set's link on the page by searching for the set name
   */
  static findSetLinkOnPage(
    setName: string,
    $: cheerio.CheerioAPI
  ): string | null {
    const cleanName = SetNameCleaner.cleanSetName(setName);

    // Try to find a link that contains this set name
    let foundLink: string | null = null;

    $('a').each((_, element) => {
      const linkText = $(element).text().trim();
      const href = $(element).attr('href');

      if (href && SetLinkFinder.isSetNameMatch(cleanName, linkText)) {
        foundLink = href;
        return false; // Break the loop
      }
    });

    return foundLink;
  }

  /**
   * Check if a link text matches a set name
   */
  private static isSetNameMatch(setName: string, linkText: string): boolean {
    const normalizedSetName = setName
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    const normalizedLinkText = linkText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

    // Exact match
    if (normalizedSetName === normalizedLinkText) {
      return true;
    }

    // Check if the link text starts with the set name (handles cases like "McDonald's Collection 2013 — French print only")
    if (normalizedLinkText.startsWith(normalizedSetName)) {
      return true;
    }

    // Check if set name is contained in link text (for partial matches)
    if (
      normalizedLinkText.includes(normalizedSetName) &&
      normalizedSetName.length > 5
    ) {
      return true;
    }

    return false;
  }
}

/**
 * Utility class for cleaning and normalizing set names
 */
export class SetNameCleaner {
  /**
   * Clean set name by removing extra annotations
   */
  static cleanSetName(setName: string): string {
    // Remove annotations like "— Special Set", "— French print only", etc.
    return setName.replace(/\s*—\s*.*$/, '').trim();
  }
}
