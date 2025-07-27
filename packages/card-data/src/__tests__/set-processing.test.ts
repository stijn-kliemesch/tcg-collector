import { SetNameCleaner } from '../utils/set-processing.js';

describe('SetNameCleaner', () => {
  it('should clean set names by removing annotations', () => {
    expect(SetNameCleaner.cleanSetName('Base Set — Special Set')).toBe(
      'Base Set'
    );
    expect(SetNameCleaner.cleanSetName('Dragon Vault — Special Set')).toBe(
      'Dragon Vault'
    );
    expect(
      SetNameCleaner.cleanSetName(
        "McDonald's Collection 2013 — French print only"
      )
    ).toBe("McDonald's Collection 2013");
  });

  it('should return unchanged name if no annotations present', () => {
    expect(SetNameCleaner.cleanSetName('Base Set')).toBe('Base Set');
    expect(SetNameCleaner.cleanSetName('Jungle')).toBe('Jungle');
  });

  it('should handle empty strings', () => {
    expect(SetNameCleaner.cleanSetName('')).toBe('');
  });

  it('should trim whitespace', () => {
    expect(SetNameCleaner.cleanSetName('  Base Set  ')).toBe('Base Set');
    expect(SetNameCleaner.cleanSetName(' Base Set — Special Set ')).toBe(
      'Base Set'
    );
  });
});
