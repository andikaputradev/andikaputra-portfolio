import { describe, expect, it } from 'vitest';
import { formatPublishedDate } from '../../src/lib/format-date';

describe('formatPublishedDate', () => {
  it('formats a January date correctly', () => {
    expect(formatPublishedDate(new Date('2024-01-01'))).toBe('January 2024');
  });

  it('formats a July date correctly', () => {
    expect(formatPublishedDate(new Date('2025-07-01'))).toBe('July 2025');
  });

  it('formats each real project publishedAt value correctly', () => {
    expect(formatPublishedDate(new Date('2024-03-01'))).toBe('March 2024');
    expect(formatPublishedDate(new Date('2024-06-01'))).toBe('June 2024');
    expect(formatPublishedDate(new Date('2024-09-01'))).toBe('September 2024');
    expect(formatPublishedDate(new Date('2024-11-01'))).toBe('November 2024');
    expect(formatPublishedDate(new Date('2025-01-01'))).toBe('January 2025');
    expect(formatPublishedDate(new Date('2025-04-01'))).toBe('April 2025');
    expect(formatPublishedDate(new Date('2025-06-01'))).toBe('June 2025');
  });
});
