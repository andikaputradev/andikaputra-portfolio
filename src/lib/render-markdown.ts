import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: false });

export function renderProjectBody(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'p', 'br', 'hr', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['https', 'http'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener', target: '_blank' }),
    },
  });
}
