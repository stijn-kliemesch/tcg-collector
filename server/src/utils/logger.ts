/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
    /**
     * Log informational messages with emojis for better visibility
     */
    static info(message: string, ...args: any[]): void {
        console.log(`ℹ️  ${message}`, ...args);
    }

    /**
     * Log success messages
     */
    static success(message: string, ...args: any[]): void {
        console.log(`✅ ${message}`, ...args);
    }

    /**
     * Log warning messages
     */
    static warn(message: string, ...args: any[]): void {
        console.warn(`⚠️  ${message}`, ...args);
    }

    /**
     * Log error messages
     */
    static error(message: string, error?: Error | any): void {
        console.error(`❌ ${message}`, error);
    }

    /**
     * Log target/goal messages
     */
    static target(message: string, ...args: any[]): void {
        console.log(`🎯 ${message}`, ...args);
    }

    /**
     * Log processing messages
     */
    static processing(message: string, ...args: any[]): void {
        console.log(`📋 ${message}`, ...args);
    }

    /**
     * Log celebration/completion messages
     */
    static celebrate(message: string, ...args: any[]): void {
        console.log(`🎉 ${message}`, ...args);
    }
}
