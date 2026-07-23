import { describe, expect, it } from 'vitest';
import { flightSearchSchema } from './index.js';

describe('flightSearchSchema', () => {
  it('requires returnDate for round trips', () => {
    expect(() => flightSearchSchema.parse({ tripType: 'ROUND_TRIP', origin: 'jfk', destination: 'lhr', departureDate: '2026-10-01', adults: 1 })).toThrow();
  });

  it('normalizes airport and currency codes', () => {
    const parsed = flightSearchSchema.parse({ tripType: 'ONE_WAY', origin: 'jfk', destination: 'lhr', departureDate: '2026-10-01', adults: 1 });
    expect(parsed.origin).toBe('JFK');
    expect(parsed.currency).toBe('USD');
  });
});
