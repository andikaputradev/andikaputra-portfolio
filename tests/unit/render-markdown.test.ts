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

  it('menurunkan tag h1 menjadi h2 ketika opsi demoteH1 aktif', () => {
    const html = renderProjectBody('# Sub Judul\n\nKonten', { demoteH1: true });
    expect(html).toContain('<h2>Sub Judul</h2>');
    expect(html).not.toContain('<h1>');
  });

  it('menambahkan tabindex="0" pada tag <pre> untuk aksesibilitas keyboard (WCAG 2.1.1)', () => {
    const html = renderProjectBody('```js\nconsole.log(1);\n```');
    expect(html).toContain('<pre tabindex="0">');
  });

  it('menghasilkan id unik pada heading ketika opsi withHeadingIds aktif', () => {
    const html = renderProjectBody('## Arsitektur Sistem\n\n### Lapisan Keamanan', { withHeadingIds: true });
    expect(html).toContain('<h2 id="arsitektur-sistem">Arsitektur Sistem</h2>');
    expect(html).toContain('<h3 id="lapisan-keamanan">Lapisan Keamanan</h3>');
  });

  it('tidak menambahkan target="_blank" pada tautan internal atau anchor hash (#)', () => {
    const html = renderProjectBody('[Daftar Isi](#daftar-isi) dan [Artikel Lain](/artikel)');
    expect(html).toContain('href="#daftar-isi"');
    expect(html).not.toContain('href="#daftar-isi" target="_blank"');
    expect(html).toContain('href="/artikel"');
    expect(html).not.toContain('href="/artikel" target="_blank"');
  });
});
