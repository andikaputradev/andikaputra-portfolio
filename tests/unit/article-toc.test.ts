import { describe, expect, it } from 'vitest';
import { slugify, extractHeadings } from '../../src/lib/article-toc';

describe('article-toc — slugify', () => {
  it('mengonversi teks heading menjadi slug URL yang bersih', () => {
    expect(slugify('Arsitektur Sistem')).toBe('arsitektur-sistem');
    expect(slugify('Apa itu Web3 & Smart Contract?')).toBe('apa-itu-web3-smart-contract');
    expect(slugify('Target API Level 36 di Android 16')).toBe('target-api-level-36-di-android-16');
  });

  it('menghapus tag HTML dan formatting markdown dalam heading', () => {
    expect(slugify('**Tebal** dan *Miring*')).toBe('tebal-dan-miring');
    expect(slugify('Kode `inline` dan [Link](https://example.com)')).toBe('kode-inline-dan-link');
    expect(slugify('<span>Tag HTML</span> Heading')).toBe('tag-html-heading');
  });

  it('menangani string kosong atau hanya karakter khusus', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
    expect(slugify('!@#$%^&*()')).toBe('');
  });
});

describe('article-toc — extractHeadings', () => {
  it('mengekstrak heading h2 dan h3 dengan kedalaman dan slug yang benar', () => {
    const md = `
# Judul Utama (h1 diabaikan dari daftar isi)

Pengantar artikel.

## Arsitektur Sistem
Penjelasan arsitektur.

### Lapisan Database
Detail database.

### Lapisan Keamanan
Detail keamanan.

## Metodologi Pengujian
Langkah pengujian.
`;

    const headings = extractHeadings(md);
    expect(headings).toHaveLength(4);
    expect(headings[0]).toEqual({ depth: 2, text: 'Arsitektur Sistem', slug: 'arsitektur-sistem' });
    expect(headings[1]).toEqual({ depth: 3, text: 'Lapisan Database', slug: 'lapisan-database' });
    expect(headings[2]).toEqual({ depth: 3, text: 'Lapisan Keamanan', slug: 'lapisan-keamanan' });
    expect(headings[3]).toEqual({ depth: 2, text: 'Metodologi Pengujian', slug: 'metodologi-pengujian' });
  });

  it('mengabaikan heading yang berada di dalam fenced code blocks', () => {
    const md = `
## Heading Asli

\`\`\`markdown
## Ini di dalam code block bukan heading
### Ini juga code block
\`\`\`

## Heading Kedua
`;

    const headings = extractHeadings(md);
    expect(headings).toHaveLength(2);
    expect(headings[0].slug).toBe('heading-asli');
    expect(headings[1].slug).toBe('heading-kedua');
  });

  it('menangani heading dengan nama duplikat dengan menambahkan nomor unik', () => {
    const md = `
## Analisis Risiko
Detail 1.

## Analisis Risiko
Detail 2.

## Analisis Risiko
Detail 3.
`;

    const headings = extractHeadings(md);
    expect(headings).toHaveLength(3);
    expect(headings[0].slug).toBe('analisis-risiko');
    expect(headings[1].slug).toBe('analisis-risiko-1');
    expect(headings[2].slug).toBe('analisis-risiko-2');
  });

  it('mengembalikan array kosong jika markdown kosong atau null', () => {
    expect(extractHeadings('')).toEqual([]);
    expect(extractHeadings(null as unknown as string)).toEqual([]);
    expect(extractHeadings(undefined as unknown as string)).toEqual([]);
  });
});
