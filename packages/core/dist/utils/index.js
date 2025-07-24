/**
 * Utility functions for TCG Collector
 */
export class StringUtils {
    /**
     * Capitalize first letter of each word
     */
    static titleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    /**
     * Create URL-friendly slug from string
     */
    static slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    /**
     * Truncate string to specified length
     */
    static truncate(str, length, suffix = '...') {
        if (str.length <= length)
            return str;
        return str.substring(0, length - suffix.length) + suffix;
    }
    /**
     * Calculate similarity between two strings (0-1)
     */
    static similarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    /**
     * Calculate Levenshtein distance between two strings
     */
    static levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
}
export class NumberUtils {
    /**
     * Format number as currency
     */
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount);
    }
    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    /**
     * Calculate percentage
     */
    static percentage(value, total) {
        if (total === 0)
            return 0;
        return Math.round((value / total) * 100);
    }
    /**
     * Clamp number between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}
export class DateUtils {
    /**
     * Format date for display
     */
    static formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    /**
     * Format date and time for display
     */
    static formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    /**
     * Get relative time string (e.g., "2 hours ago")
     */
    static timeAgo(date) {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 30)
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        return this.formatDate(d);
    }
}
export class ArrayUtils {
    /**
     * Group array items by a key
     */
    static groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            groups[key] = groups[key] || [];
            groups[key].push(item);
            return groups;
        }, {});
    }
    /**
     * Remove duplicates from array
     */
    static unique(array) {
        return [...new Set(array)];
    }
    /**
     * Sort array by multiple criteria
     */
    static sortBy(array, ...keyFns) {
        return array.sort((a, b) => {
            for (const keyFn of keyFns) {
                const aVal = keyFn(a);
                const bVal = keyFn(b);
                if (aVal < bVal)
                    return -1;
                if (aVal > bVal)
                    return 1;
            }
            return 0;
        });
    }
    /**
     * Chunk array into smaller arrays
     */
    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
