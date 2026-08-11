import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Markdown } from '@tiptap/markdown';

export function createBodyEditor(element: HTMLElement, initialMarkdown: string): Editor {
  return new Editor({
    element,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Markdown.configure({
        markedOptions: { gfm: true, breaks: false, pedantic: false },
      }),
    ],
    content: initialMarkdown,
    contentType: 'markdown',
    editorProps: { attributes: { class: 'admin-editor-body' } },
  });
}

export function getMarkdown(editor: Editor): string {
  return editor.getMarkdown();
}
