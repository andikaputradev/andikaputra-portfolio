import { describe, expect, it } from 'vitest';
import { renderProjectBody } from '../../src/lib/render-markdown';

describe('renderProjectBody — sanitasi XSS', () => {
  it('menghapus tag <script> sepenuhnya', () => {
    const html = renderProjectBody('Halo <script>alert(1)</script> dunia');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(1)');
  });

  it('menghapus atribut onerror pada gambar', () => {
    const html = renderProjectBody('![alt](https://example.com/x.png "onerror=alert(1)")');
    expect(html).not.toContain('onerror');
  });

  it('menghapus atribut onerror ketika disisipkan lewat HTML mentah dalam markdown', () => {
    const html = renderProjectBody('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('menghapus javascript: URL pada link', () => {
    const html = renderProjectBody('[klik](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });

  it('tetap merender markdown aman dengan benar', () => {
    const html = renderProjectBody('# Judul\n\nParagraf **tebal** dan [tautan](https://example.com).');
    expect(html).toContain('<h1>Judul</h1>');
    expect(html).toContain('<strong>tebal</strong>');
    expect(html).toContain('href="https://example.com"');
  });

  it('menambahkan rel="noopener" dan target="_blank" pada link', () => {
    const html = renderProjectBody('[external](https://example.com)');
    expect(html).toContain('rel="noopener"');
    expect(html).toContain('target="_blank"');
  });

  it('menghapus tag <iframe>', () => {
    const html = renderProjectBody('<iframe src="https://evil.example.com"></iframe>');
    expect(html).not.toContain('<iframe');
  });

  it('menghapus event handler onclick pada elemen mana pun', () => {
    const html = renderProjectBody('<p onclick="alert(1)">teks</p>');
    expect(html).not.toContain('onclick');
  });
});
