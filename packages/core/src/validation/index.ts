/**
 * Validation utilities for TCG Collector
 */

import type { CardCondition, CardRarity } from '@tcg-collector/api-types';
import { CARD_CONDITIONS, CARD_RARITIES, SUPPORTED_IMAGE_FORMATS, MAX_IMAGE_SIZE } from '../constants/index.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  /**
   * Validate email format
   */
  static email(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate password strength
   */
  static password(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate card condition
   */
  static cardCondition(condition: string): ValidationResult {
    const errors: string[] = [];
    
    if (!condition) {
      errors.push('Card condition is required');
    } else if (!CARD_CONDITIONS.includes(condition as CardCondition)) {
      errors.push(`Invalid card condition. Must be one of: ${CARD_CONDITIONS.join(', ')}`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate card rarity
   */
  static cardRarity(rarity: string): ValidationResult {
    const errors: string[] = [];
    
    if (!rarity) {
      errors.push('Card rarity is required');
    } else if (!CARD_RARITIES.includes(rarity as CardRarity)) {
      errors.push(`Invalid card rarity. Must be one of: ${CARD_RARITIES.join(', ')}`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate image file
   */
  static imageFile(file: File): ValidationResult {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('Image file is required');
    } else {
      if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
        errors.push(`Unsupported image format. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`);
      }
      
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`Image file too large. Maximum size: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate collection name
   */
  static collectionName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name?.trim()) {
      errors.push('Collection name is required');
    } else if (name.length < 2) {
      errors.push('Collection name must be at least 2 characters long');
    } else if (name.length > 100) {
      errors.push('Collection name must be less than 100 characters long');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate quantity
   */
  static quantity(quantity: number): ValidationResult {
    const errors: string[] = [];
    
    if (quantity === undefined || quantity === null) {
      errors.push('Quantity is required');
    } else if (!Number.isInteger(quantity)) {
      errors.push('Quantity must be a whole number');
    } else if (quantity < 0) {
      errors.push('Quantity cannot be negative');
    } else if (quantity > 9999) {
      errors.push('Quantity cannot exceed 9999');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
