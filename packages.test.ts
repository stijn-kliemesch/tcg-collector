import type { Card } from '@tcg-collector/api-types';
import { StringUtils, Validator } from '@tcg-collector/core';
import { describe, expect, it } from 'vitest';

describe('Core Package', () => {
  describe('StringUtils', () => {
    it('should format titles correctly', () => {
      expect(StringUtils.titleCase('pikachu lightning bolt')).toBe(
        'Pikachu Lightning Bolt'
      );
      expect(StringUtils.titleCase('CHARIZARD EX')).toBe('Charizard Ex');
      expect(StringUtils.titleCase('')).toBe('');
    });
  });

  describe('Validator', () => {
    it('should validate emails correctly', () => {
      const validEmail = Validator.email('test@example.com');
      expect(validEmail.isValid).toBe(true);
      expect(validEmail.errors).toHaveLength(0);

      const invalidEmail = Validator.email('invalid-email');
      expect(invalidEmail.isValid).toBe(false);
      expect(invalidEmail.errors.length).toBeGreaterThan(0);
    });

    it('should validate passwords correctly', () => {
      const validPassword = Validator.password('SecurePass123!');
      expect(validPassword.isValid).toBe(true);

      const weakPassword = Validator.password('123');
      expect(weakPassword.isValid).toBe(false);
    });
  });
});

describe('API Types', () => {
  it('should allow proper Card type usage', () => {
    const card: Partial<Card> = {
      name: 'Pikachu',
      set: 'Base Set',
      setNumber: '25/102',
      rarity: 'Common',
    };

    expect(card.name).toBe('Pikachu');
    expect(card.set).toBe('Base Set');
  });
});
