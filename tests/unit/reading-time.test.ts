import { describe, expect, it } from 'vitest';
import { calculateReadingTime } from '../../src/lib/reading-time';

describe('calculateReadingTime', () => {
  it('returns 1 for null, undefined, or empty string', () => {
    expect(calculateReadingTime(null)).toBe(1);
    expect(calculateReadingTime(undefined)).toBe(1);
    expect(calculateReadingTime('')).toBe(1);
    expect(calculateReadingTime('   \n\t  ')).toBe(1);
  });

  it('calculates reading time based on standard 200 words per minute', () => {
    // 200 kata -> 1 menit
    const words200 = Array(200).fill('kata').join(' ');
    expect(calculateReadingTime(words200)).toBe(1);

    // 201 kata -> dibulatkan ke atas jadi 2 menit
    const words201 = Array(201).fill('kata').join(' ');
    expect(calculateReadingTime(words201)).toBe(2);

    // 600 kata -> 3 menit
    const words600 = Array(600).fill('kata').join(' ');
    expect(calculateReadingTime(words600)).toBe(3);
  });

  it('ignores code blocks when counting words for readable text', () => {
    const markdownWithCode = `
# Tutorial Keamanan

Berikut adalah penjelasan konsep:
${Array(50).fill('penjelasan').join(' ')}

\`\`\`typescript
${Array(500).fill('const x = 1;').join('\n')}
\`\`\`

Kesimpulan:
${Array(50).fill('kesimpulan').join(' ')}
`;
    // Hanya ~200 kata teks biasa di luar blok kode
    expect(calculateReadingTime(markdownWithCode)).toBe(1);
  });

  it('strips markdown syntax such as headers, links, and bold text', () => {
    const md = '# Judul\n\n**Teks tebal** dan [tautan penting](https://example.com) untuk *pembaca*.';
    expect(calculateReadingTime(md)).toBe(1);
  });

  // Property-based test simulation with random/fuzz data
  describe('property-based testing invariants', () => {
    it('always returns an integer >= 1 for any generated string', () => {
      const sampleTokens = [
        'lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        '```ts\nconsole.log(1);\n```',
        '# Header',
        '[Link](url)',
        '**bold**',
        '12345',
        '🚀',
        '日本語',
        '   ',
      ];

      for (let run = 0; run < 100; run++) {
        const tokenCount = Math.floor(Math.random() * 2000);
        const tokens: string[] = [];
        for (let i = 0; i < tokenCount; i++) {
          tokens.push(sampleTokens[Math.floor(Math.random() * sampleTokens.length)]);
        }
        const text = tokens.join(' ');
        const result = calculateReadingTime(text);

        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
      }
    });

    it('is monotonically non-decreasing with increasing word count', () => {
      let previousTime = 1;
      for (let words = 50; words <= 2000; words += 100) {
        const text = Array(words).fill('kata').join(' ');
        const time = calculateReadingTime(text);
        expect(time).toBeGreaterThanOrEqual(previousTime);
        previousTime = time;
      }
    });
  });
});
