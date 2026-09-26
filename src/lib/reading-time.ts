/**
 * Menghitung estimasi waktu baca (dalam menit) dari teks markdown.
 * Standar kecepatan membaca rata-rata: ~200 kata per menit.
 * Menghapus blok kode dan markup sebelum perhitungan kata agar waktu baca realistis.
 * Hasil dibulatkan ke atas (Math.ceil), dengan batas minimum 1 menit jika konten tidak kosong.
 */
export function calculateReadingTime(markdown: string | null | undefined, wordsPerMinute = 200): number {
  if (!markdown || typeof markdown !== 'string') {
    return 1;
  }

  // Bersihkan blok kode fenced (```...```) dan inline code (`...`)
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    // Bersihkan format markdown (gambar, link, header, bold, italic)
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, ' ')
    .replace(/[*_~>]/g, ' ')
    .trim();

  if (!cleaned) {
    return 1;
  }

  // Hitung jumlah kata berdasarkan spasi/pemisah kata
  const words = cleaned.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return 1;
  }

  const speed = wordsPerMinute > 0 ? wordsPerMinute : 200;
  return Math.max(1, Math.ceil(wordCount / speed));
}

/**
 * Menghitung total jumlah kata bersih dari teks markdown.
 */
export function countWords(markdown: string | null | undefined): number {
  if (!markdown || typeof markdown !== 'string') {
    return 0;
  }

  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, ' ')
    .replace(/[*_~>]/g, ' ')
    .trim();

  if (!cleaned) {
    return 0;
  }

  return cleaned.split(/\s+/).filter((word) => word.length > 0).length;
}

