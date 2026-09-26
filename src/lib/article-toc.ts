export interface HeadingItem {
  depth: 2 | 3;
  text: string;
  slug: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractHeadings(markdown: string | null | undefined): HeadingItem[] {
  if (!markdown || typeof markdown !== 'string') return [];

  // Hapus blok kode fenced agar syntax di dalam kode tidak dideteksi sebagai heading
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '');

  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: HeadingItem[] = [];
  const slugCounts = new Map<string, number>();

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(withoutCodeBlocks)) !== null) {
    const depth = match[1].length as 2 | 3;
    const rawText = match[2].trim();
    const text = rawText
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .trim();

    if (!text) continue;

    const baseSlug = slugify(text) || 'section';
    const count = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, count + 1);

    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    headings.push({ depth, text, slug });
  }

  return headings;
}
