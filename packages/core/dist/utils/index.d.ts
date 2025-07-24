/**
 * Utility functions for TCG Collector
 */
export declare class StringUtils {
    /**
     * Capitalize first letter of each word
     */
    static titleCase(str: string): string;
    /**
     * Create URL-friendly slug from string
     */
    static slugify(str: string): string;
    /**
     * Truncate string to specified length
     */
    static truncate(str: string, length: number, suffix?: string): string;
    /**
     * Calculate similarity between two strings (0-1)
     */
    static similarity(str1: string, str2: string): number;
    /**
     * Calculate Levenshtein distance between two strings
     */
    private static levenshteinDistance;
}
export declare class NumberUtils {
    /**
     * Format number as currency
     */
    static formatCurrency(amount: number, currency?: string): string;
    /**
     * Format number with commas
     */
    static formatNumber(num: number): string;
    /**
     * Calculate percentage
     */
    static percentage(value: number, total: number): number;
    /**
     * Clamp number between min and max
     */
    static clamp(value: number, min: number, max: number): number;
}
export declare class DateUtils {
    /**
     * Format date for display
     */
    static formatDate(date: Date | string): string;
    /**
     * Format date and time for display
     */
    static formatDateTime(date: Date | string): string;
    /**
     * Get relative time string (e.g., "2 hours ago")
     */
    static timeAgo(date: Date | string): string;
}
export declare class ArrayUtils {
    /**
     * Group array items by a key
     */
    static groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]>;
    /**
     * Remove duplicates from array
     */
    static unique<T>(array: T[]): T[];
    /**
     * Sort array by multiple criteria
     */
    static sortBy<T>(array: T[], ...keyFns: Array<(item: T) => any>): T[];
    /**
     * Chunk array into smaller arrays
     */
    static chunk<T>(array: T[], size: number): T[][];
}
