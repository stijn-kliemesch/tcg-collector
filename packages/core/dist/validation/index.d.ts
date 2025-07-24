/**
 * Validation utilities for TCG Collector
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare class Validator {
    /**
     * Validate email format
     */
    static email(email: string): ValidationResult;
    /**
     * Validate password strength
     */
    static password(password: string): ValidationResult;
    /**
     * Validate card condition
     */
    static cardCondition(condition: string): ValidationResult;
    /**
     * Validate card rarity
     */
    static cardRarity(rarity: string): ValidationResult;
    /**
     * Validate image file
     */
    static imageFile(file: File): ValidationResult;
    /**
     * Validate collection name
     */
    static collectionName(name: string): ValidationResult;
    /**
     * Validate quantity
     */
    static quantity(quantity: number): ValidationResult;
}
