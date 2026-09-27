import { marked, Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { slugify } from './article-toc';

marked.setOptions({ gfm: true, breaks: false });

export interface RenderMarkdownOptions {
  demoteH1?: boolean;
  withHeadingIds?: boolean;
}

export function renderProjectBody(
  markdown: string,
  options?: RenderMarkdownOptions
): string {
  let rawHtml: string;

  if (options?.withHeadingIds) {
    const slugCounts = new Map<string, number>();
    const renderer = {
      heading({ text, depth }: { text: string; depth: number }) {
        const cleanText = text
          .replace(/<[^>]*>/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/[*_~`]/g, '')
          .trim();
        const baseSlug = slugify(cleanText) || 'section';
        const count = slugCounts.get(baseSlug) || 0;
        slugCounts.set(baseSlug, count + 1);
        const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
        const targetDepth = options?.demoteH1 && depth === 1 ? 2 : depth;
        const tag = `h${targetDepth}`;
        return `<${tag} id="${slug}">${text}</${tag}>\n`;
      },
    };

    const instance = new Marked();
    instance.use({ renderer, gfm: true, breaks: false });
    rawHtml = instance.parse(markdown) as string;
  } else {
    rawHtml = marked.parse(markdown, { async: false }) as string;
  }

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'p', 'br', 'hr', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      pre: ['tabindex'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
    },
    allowedSchemes: ['https', 'http'],
    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href || '';
        const isInternal = href.startsWith('#') || href.startsWith('/');
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            ...(isInternal ? {} : { rel: 'noopener', target: '_blank' }),
          },
        };
      },
      pre: sanitizeHtml.simpleTransform('pre', { tabindex: '0' }),
      ...(options?.demoteH1 && !options.withHeadingIds ? { h1: 'h2' } : {}),
    },
  });
}
