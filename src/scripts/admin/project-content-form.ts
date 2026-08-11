import type { Editor } from '@tiptap/core';
import { createBodyEditor, getMarkdown } from './project-editor';
import { insertImage } from './project-editor-image';
import { CSRF_HEADER_NAME } from '../../lib/csrf';
import { showToast } from './htmx-toast';

function wireToolbar(toolbar: HTMLElement, editor: Editor): void {
  toolbar.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-command]');
    if (!button) return;
    event.preventDefault();

    const chain = editor.chain().focus();
    switch (button.dataset.command) {
      case 'bold':
        chain.toggleBold().run();
        break;
      case 'italic':
        chain.toggleItalic().run();
        break;
      case 'h2':
        chain.toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        chain.toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        chain.toggleBulletList().run();
        break;
      case 'orderedList':
        chain.toggleOrderedList().run();
        break;
      case 'blockquote':
        chain.toggleBlockquote().run();
        break;
      case 'code':
        chain.toggleCodeBlock().run();
        break;
      case 'link': {
        const url = window.prompt('URL tautan:');
        if (url) chain.setLink({ href: url }).run();
        break;
      }
      case 'image': {
        toolbar.querySelector<HTMLInputElement>('[data-image-input]')?.click();
        break;
      }
      default:
        break;
    }
  });

  toolbar.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.matches('[data-image-input]')) return;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    insertImage(editor, file).catch((error) => {
      showToast(error instanceof Error ? error.message : 'Gagal menyisipkan gambar');
    });
  });
}

function initEditorSyncOnUpdate(editor: Editor, syncTargetId: string): void {
  const hidden = document.getElementById(syncTargetId) as HTMLInputElement | null;
  if (!hidden) return;
  editor.on('update', () => {
    hidden.value = getMarkdown(editor);
  });
  hidden.value = getMarkdown(editor);
}

export function initProjectContentForm(): void {
  const form = document.getElementById('project-content-form') as HTMLFormElement | null;
  const editorEl = document.getElementById('body-editor');
  const toolbar = document.getElementById('editor-toolbar');
  if (!form || !editorEl || !toolbar) return;

  const editor = createBodyEditor(editorEl, editorEl.dataset.initial ?? '');
  wireToolbar(toolbar, editor);
  initEditorSyncOnUpdate(editor, 'bodyMarkdown-sync');

  const csrfToken = form.dataset.csrf ?? '';
  const projectId = form.dataset.projectId ?? '';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
    const saveMode = submitter?.dataset.saveMode === 'publish' ? 'publish' : 'draft';
    const fd = new FormData(form);

    const buttons = form.querySelectorAll<HTMLButtonElement>('button[type="submit"]');
    buttons.forEach((btn) => (btn.disabled = true));

    fetch(`/api/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        [CSRF_HEADER_NAME]: csrfToken,
      },
      body: JSON.stringify({
        saveMode,
        data: {
          title: fd.get('title'),
          summary: fd.get('summary'),
          bodyMarkdown: getMarkdown(editor),
          liveUrl: fd.get('liveUrl') || undefined,
          repoUrl: fd.get('repoUrl') || undefined,
        },
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Gagal menyimpan (${res.status})`);
        }
        const flash = saveMode === 'publish' ? 'published' : 'draft-saved';
        window.location.href = `/admin/projects?flash=${flash}`;
      })
      .catch((error) => {
        showToast(error instanceof Error ? error.message : 'Gagal menyimpan proyek');
        buttons.forEach((btn) => (btn.disabled = false));
      });
  });
}
