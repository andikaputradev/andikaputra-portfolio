import { describe, expect, it } from 'vitest';
import {
  calculateTelemetry,
  formatImageMarkdown,
  formatLinkMarkdown,
  getLineAndCol,
  insertCodeBlock,
  insertHorizontalRule,
  insertMdxAccordion,
  insertMdxCallout,
  insertTable,
  prefixLines,
  toggleHeading,
  validateUrl,
  wrapInline,
} from '../../src/scripts/admin/markdown-engine';

describe('markdown-engine — Inline Formatting & Wrapping Logic', () => {
  it('membungkus teks terseleksi dengan tanda bold (**)', () => {
    const text = 'Halo dunia yang cerah';
    const start = 5;
    const end = 10; // 'dunia'
    const result = wrapInline(text, start, end, '**');

    expect(result.text).toBe('Halo **dunia** yang cerah');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(12);
  });

  it('menyisipkan **** dan menempatkan caret persis di tengah saat seleksi kosong', () => {
    const text = 'Ketik di sini: ';
    const start = text.length;
    const end = text.length;
    const result = wrapInline(text, start, end, '**');

    expect(result.text).toBe('Ketik di sini: ****');
    expect(result.selectionStart).toBe(text.length + 2);
    expect(result.selectionEnd).toBe(text.length + 2);
  });

  it('melakukan toggle OFF (unwrap) jika teks terseleksi sudah berformat bold', () => {
    const text = 'Teks **tebal sekali** selesai';
    const start = 5;
    const end = 21; // '**tebal sekali**'
    const result = wrapInline(text, start, end, '**');

    expect(result.text).toBe('Teks tebal sekali selesai');
    expect(result.selectionStart).toBe(5);
    expect(result.selectionEnd).toBe(17);
  });

  it('melakukan toggle OFF jika seleksi berada di dalam wrapper bold sekelilingnya', () => {
    const text = 'Teks **tebal** selesai';
    const start = 7;
    const end = 12; // 'tebal' diapit oleh '**' dan '**'
    const result = wrapInline(text, start, end, '**');

    expect(result.text).toBe('Teks tebal selesai');
    expect(result.selectionStart).toBe(5);
    expect(result.selectionEnd).toBe(10);
  });

  it('bekerja presisi untuk italic (*), strikethrough (~~), dan inline code (`)', () => {
    const text = 'Coba kode ini';
    const start = 5;
    const end = 9; // 'kode'

    const italic = wrapInline(text, start, end, '*');
    expect(italic.text).toBe('Coba *kode* ini');

    const strike = wrapInline(text, start, end, '~~');
    expect(strike.text).toBe('Coba ~~kode~~ ini');

    const code = wrapInline(text, start, end, '`');
    expect(code.text).toBe('Coba `kode` ini');
  });
});

describe('markdown-engine — Heading Logic', () => {
  it('menambahkan prefix H2 pada baris tanpa heading', () => {
    const text = 'Judul Paragraf\nIsi paragraf berikutnya.';
    const result = toggleHeading(text, 3, 3, 2);

    expect(result.text).toBe('## Judul Paragraf\nIsi paragraf berikutnya.');
    expect(result.selectionStart).toBe(6);
  });

  it('mengganti level heading yang sudah ada (misal dari H2 ke H3)', () => {
    const text = '## Judul Lama\nParagraf';
    const result = toggleHeading(text, 5, 5, 3);

    expect(result.text).toBe('### Judul Lama\nParagraf');
  });

  it('melakukan toggle OFF jika level heading yang dipilih sama dengan yang aktif', () => {
    const text = '## Judul Sama\nParagraf';
    const result = toggleHeading(text, 5, 5, 2);

    expect(result.text).toBe('Judul Sama\nParagraf');
  });
});

describe('markdown-engine — Multi-line Block Logic & Indentation', () => {
  it('memberikan prefix bullet list (-) ke seluruh baris yang diseleksi', () => {
    const text = 'Baris satu\nBaris dua\nBaris tiga';
    const result = prefixLines(text, 0, text.length, 'bullet');

    expect(result.text).toBe('- Baris satu\n- Baris dua\n- Baris tiga');
  });

  it('melakukan toggle OFF pada bullet list jika seluruh baris telah memiliki bullet', () => {
    const text = '- Baris satu\n- Baris dua';
    const result = prefixLines(text, 0, text.length, 'bullet');

    expect(result.text).toBe('Baris satu\nBaris dua');
  });

  it('memberikan prefix ordered list (1., 2.) secara sekuensial', () => {
    const text = 'Langkah pertama\nLangkah kedua\nLangkah ketiga';
    const result = prefixLines(text, 0, text.length, 'ordered');

    expect(result.text).toBe('1. Langkah pertama\n2. Langkah kedua\n3. Langkah ketiga');
  });

  it('memberikan prefix task list (- [ ]) dan mendukung toggle off', () => {
    const text = 'Tugas A\nTugas B';
    const withTask = prefixLines(text, 0, text.length, 'task');
    expect(withTask.text).toBe('- [ ] Tugas A\n- [ ] Tugas B');

    const toggledOff = prefixLines(withTask.text, 0, withTask.text.length, 'task');
    expect(toggledOff.text).toBe('Tugas A\nTugas B');
  });

  it('memberikan prefix blockquote (>) dan mendukung toggle off', () => {
    const text = 'Kutipan penting\nBaris lanjutan';
    const withQuote = prefixLines(text, 0, text.length, 'quote');
    expect(withQuote.text).toBe('> Kutipan penting\n> Baris lanjutan');

    const toggledOff = prefixLines(withQuote.text, 0, withQuote.text.length, 'quote');
    expect(toggledOff.text).toBe('Kutipan penting\nBaris lanjutan');
  });

  it('mendukung indentasi Tab (tambah 2 spasi) dan Outdent Shift+Tab (hapus 2 spasi)', () => {
    const text = 'const a = 1;\nconst b = 2;';
    const indented = prefixLines(text, 0, text.length, 'indent');
    expect(indented.text).toBe('  const a = 1;\n  const b = 2;');

    const outdented = prefixLines(indented.text, 0, indented.text.length, 'outdent');
    expect(outdented.text).toBe('const a = 1;\nconst b = 2;');
  });
});

describe('markdown-engine — Block Inserts & Custom MDX Components', () => {
  it('menyisipkan code block berpagar dengan bahasa yang dipilih', () => {
    const text = 'console.log("hello");';
    const result = insertCodeBlock(text, 0, text.length, 'typescript');

    expect(result.text).toBe('```typescript\nconsole.log("hello");\n```\n');
  });

  it('menyisipkan tabel GFM terstruktur dengan baris dan kolom yang rapi', () => {
    const result = insertTable('', 0, 0, 2, 2);

    expect(result.text).toContain('| Kolom 1 | Kolom 2 |');
    expect(result.text).toContain('| :--- | :--- |');
    expect(result.text).toContain('| Item 1.1 | Item 1.2 |');
    expect(result.text).toContain('| Item 2.1 | Item 2.2 |');
  });

  it('menyisipkan horizontal divider (---) dengan spasi baris baru yang aman', () => {
    const text = 'Bagian atas';
    const result = insertHorizontalRule(text, text.length, text.length);

    expect(result.text).toBe('Bagian atas\n\n---\n\n');
  });

  it('menyisipkan custom MDX <Callout> dengan tipe dan judul', () => {
    const selected = 'Peringatan keamanan API key';
    const result = insertMdxCallout(selected, 0, selected.length, 'warning', 'Penting');

    expect(result.text).toBe(
      '<Callout type="warning" title="Penting">\nPeringatan keamanan API key\n</Callout>\n',
    );
  });

  it('menyisipkan custom MDX <Accordion> dengan judul', () => {
    const selected = 'Detail konfigurasi server';
    const result = insertMdxAccordion(selected, 0, selected.length, 'Konfigurasi');

    expect(result.text).toBe(
      '<Accordion title="Konfigurasi">\nDetail konfigurasi server\n</Accordion>\n',
    );
  });
});

describe('markdown-engine — Link, Image, & URL Formatter', () => {
  it('memformat tautan Markdown standar [text](url)', () => {
    expect(formatLinkMarkdown('Dokumentasi', 'https://example.com')).toBe(
      '[Dokumentasi](https://example.com)',
    );
  });

  it('memformat tautan HTML jika openInNewTab bernilai true', () => {
    expect(formatLinkMarkdown('Portal', 'https://portal.com', true)).toBe(
      '<a href="https://portal.com" target="_blank" rel="noopener">Portal</a>',
    );
  });

  it('memformat gambar dengan alt text dan optional caption', () => {
    expect(formatImageMarkdown('Diagram Arsitektur', 'https://img.com/arch.png')).toBe(
      '![Diagram Arsitektur](https://img.com/arch.png)',
    );
    expect(
      formatImageMarkdown('Diagram Arsitektur', 'https://img.com/arch.png', 'Gambar 1'),
    ).toBe('![Diagram Arsitektur](https://img.com/arch.png "Gambar 1")');
  });

  it('memvalidasi URL secara akurat', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://insecure.com')).toBe(true);
    expect(validateUrl('/artikel/keamanan')).toBe(true);
    expect(validateUrl('#heading-1')).toBe(true);
    expect(validateUrl('mailto:admin@example.com')).toBe(true);

    expect(validateUrl('')).toBe(false);
    expect(validateUrl('javascript:alert(1)')).toBe(false);
    expect(validateUrl('file:///etc/passwd')).toBe(false);
  });
});

describe('markdown-engine — Telemetry Calculations', () => {
  it('menghitung posisi baris dan kolom secara akurat (1-indexed)', () => {
    const text = 'Baris 1\nBaris 2 panjang\nBaris 3';
    // Indeks 0: 'B' di baris 1
    expect(getLineAndCol(text, 0)).toEqual({ line: 1, col: 1 });
    // Indeks 8: 'B' di baris 2 ('Baris 1\n' = 8 karakter)
    expect(getLineAndCol(text, 8)).toEqual({ line: 2, col: 1 });
    // Indeks 13: karakter ke-6 di baris 2
    expect(getLineAndCol(text, 13)).toEqual({ line: 2, col: 6 });
  });

  it('menghitung statistik lengkap (kata, karakter, waktu baca, line, col)', () => {
    const text = '# Judul\n\nParagraf pertama terdiri dari lima kata.';
    const telemetry = calculateTelemetry(text, 15);

    expect(telemetry.chars).toBe(text.length);
    expect(telemetry.words).toBeGreaterThan(0);
    expect(telemetry.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(telemetry.line).toBeGreaterThanOrEqual(1);
    expect(telemetry.col).toBeGreaterThanOrEqual(1);
  });
});
