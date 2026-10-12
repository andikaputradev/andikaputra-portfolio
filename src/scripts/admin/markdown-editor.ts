import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import {
  calculateTelemetry,
  formatImageMarkdown,
  formatLinkMarkdown,
  insertCodeBlock,
  insertHorizontalRule,
  insertMdxAccordion,
  insertMdxCallout,
  insertTable,
  prefixLines,
  toggleHeading,
  validateUrl,
  wrapInline,
  type SelectionResult,
} from './markdown-engine';

export interface EditorHistoryState {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface MarkdownEditorOptions {
  uploadFolder?: string;
}

export class MarkdownEditor {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement;
  private previewEl: HTMLElement | null;
  private telemetryWords: HTMLElement | null;
  private telemetryChars: HTMLElement | null;
  private telemetryReading: HTMLElement | null;
  private telemetryCaret: HTMLElement | null;

  // Modals
  private linkModal: HTMLElement | null;
  private imageModal: HTMLElement | null;

  // Upload folder
  private uploadFolder: string;

  // History stack for Undo / Redo
  private historyStack: EditorHistoryState[] = [];
  private historyIndex = -1;
  private maxHistory = 50;
  private isApplyingHistory = false;

  // Saved selection when modal opens
  private savedSelection = { start: 0, end: 0 };

  // Current view mode: 'write' | 'split' | 'preview'
  private currentViewMode: 'write' | 'split' | 'preview' = 'write';

  constructor(container: HTMLElement, options?: MarkdownEditorOptions) {
    this.container = container;
    const ta = container.querySelector<HTMLTextAreaElement>('.js-editor-textarea');
    if (!ta) {
      throw new Error('Textarea .js-editor-textarea tidak ditemukan di MarkdownEditor');
    }
    this.textarea = ta;

    this.uploadFolder = options?.uploadFolder || container.dataset.uploadFolder || 'portfolio/articles';
    this.previewEl = container.querySelector<HTMLElement>('.js-editor-preview-content');

    // Telemetry elements
    this.telemetryWords = container.querySelector<HTMLElement>('.js-telemetry-words');
    this.telemetryChars = container.querySelector<HTMLElement>('.js-telemetry-chars');
    this.telemetryReading = container.querySelector<HTMLElement>('.js-telemetry-reading');
    this.telemetryCaret = container.querySelector<HTMLElement>('.js-telemetry-caret');

    // Modals
    this.linkModal = container.querySelector<HTMLElement>('.js-link-modal');
    this.imageModal = container.querySelector<HTMLElement>('.js-image-modal');

    // Teleport modal ke document.body jika berada di dalam form agar tidak merusak form DOM
    if (typeof document !== 'undefined' && document.body) {
      if (this.linkModal && this.linkModal.parentElement !== document.body) {
        document.body.appendChild(this.linkModal);
      }
      if (this.imageModal && this.imageModal.parentElement !== document.body) {
        document.body.appendChild(this.imageModal);
      }
    }

    this.initHistory();
    this.bindToolbar();
    this.bindKeyboardShortcuts();
    this.bindTelemetryAndPreview();
    this.bindLinkModal();
    this.bindImageModal();

    // Initial render
    this.updateTelemetry();
    this.updatePreview();
  }

  /* -------------------------------------------------------------------------
   * History (Undo / Redo)
   * ----------------------------------------------------------------------- */
  private initHistory(): void {
    this.historyStack = [
      {
        text: this.textarea.value,
        selectionStart: this.textarea.selectionStart,
        selectionEnd: this.textarea.selectionEnd,
      },
    ];
    this.historyIndex = 0;
  }

  private pushHistoryState(): void {
    if (this.isApplyingHistory) return;

    // Jika ada undo sebelumnya, potong cabang depan
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    }

    this.historyStack.push({
      text: this.textarea.value,
      selectionStart: this.textarea.selectionStart,
      selectionEnd: this.textarea.selectionEnd,
    });

    if (this.historyStack.length > this.maxHistory) {
      this.historyStack.shift();
    } else {
      this.historyIndex++;
    }
  }

  public undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.applyHistoryState(this.historyStack[this.historyIndex]);
    }
  }

  public redo(): void {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      this.applyHistoryState(this.historyStack[this.historyIndex]);
    }
  }

  private applyHistoryState(state: EditorHistoryState): void {
    this.isApplyingHistory = true;
    this.textarea.value = state.text;
    this.textarea.setSelectionRange(state.selectionStart, state.selectionEnd);
    this.textarea.focus();
    this.isApplyingHistory = false;

    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    this.updateTelemetry();
    this.updatePreview();
  }

  /* -------------------------------------------------------------------------
   * Selection Application
   * ----------------------------------------------------------------------- */
  private applySelectionResult(result: SelectionResult): void {
    this.textarea.value = result.text;
    this.textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    this.textarea.focus();
    this.pushHistoryState();

    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    this.updateTelemetry();
    this.updatePreview();
  }

  /* -------------------------------------------------------------------------
   * Toolbar Wiring
   * ----------------------------------------------------------------------- */
  private bindToolbar(): void {
    const toolbar = this.container.querySelector<HTMLElement>('.js-editor-toolbar');
    if (!toolbar) return;

    toolbar.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('button[data-action]');
      if (!button) return;

      event.preventDefault();
      const action = button.dataset.action;
      if (!action) return;

      this.executeAction(action);
    });

    // View mode buttons
    const viewButtons = toolbar.querySelectorAll<HTMLButtonElement>('button[data-view]');
    viewButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.dataset.view as 'write' | 'split' | 'preview';
        if (mode) this.setViewMode(mode);
      });
    });
  }

  private executeAction(action: string): void {
    const text = this.textarea.value;
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;

    switch (action) {
      case 'undo':
        this.undo();
        break;
      case 'redo':
        this.redo();
        break;
      case 'bold':
        this.applySelectionResult(wrapInline(text, start, end, '**'));
        break;
      case 'italic':
        this.applySelectionResult(wrapInline(text, start, end, '*'));
        break;
      case 'strike':
        this.applySelectionResult(wrapInline(text, start, end, '~~'));
        break;
      case 'inline-code':
        this.applySelectionResult(wrapInline(text, start, end, '`'));
        break;
      case 'heading-2':
        this.applySelectionResult(toggleHeading(text, start, end, 2));
        break;
      case 'heading-3':
        this.applySelectionResult(toggleHeading(text, start, end, 3));
        break;
      case 'heading-4':
        this.applySelectionResult(toggleHeading(text, start, end, 4));
        break;
      case 'bullet-list':
        this.applySelectionResult(prefixLines(text, start, end, 'bullet'));
        break;
      case 'ordered-list':
        this.applySelectionResult(prefixLines(text, start, end, 'ordered'));
        break;
      case 'task-list':
        this.applySelectionResult(prefixLines(text, start, end, 'task'));
        break;
      case 'quote':
        this.applySelectionResult(prefixLines(text, start, end, 'quote'));
        break;
      case 'code-block': {
        const langSelect = this.container.querySelector<HTMLSelectElement>('.js-code-lang');
        const lang = langSelect?.value || 'typescript';
        this.applySelectionResult(insertCodeBlock(text, start, end, lang));
        break;
      }
      case 'divider':
        this.applySelectionResult(insertHorizontalRule(text, start, end));
        break;
      case 'table':
        this.applySelectionResult(insertTable(text, start, end));
        break;
      case 'mdx-callout':
        this.applySelectionResult(insertMdxCallout(text, start, end, 'info', 'Catatan'));
        break;
      case 'mdx-accordion':
        this.applySelectionResult(insertMdxAccordion(text, start, end, 'Judul Bagian'));
        break;
      case 'link':
        this.openLinkModal();
        break;
      case 'image':
        this.openImageModal();
        break;
      default:
        break;
    }
  }

  /* -------------------------------------------------------------------------
   * Keyboard Shortcuts
   * ----------------------------------------------------------------------- */
  private bindKeyboardShortcuts(): void {
    this.textarea.addEventListener('keydown', (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? event.metaKey : event.ctrlKey;

      if (mod && !event.shiftKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        this.executeAction('bold');
        return;
      }

      if (mod && !event.shiftKey && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        this.executeAction('italic');
        return;
      }

      if (mod && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.executeAction('link');
        return;
      }

      if (mod && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        this.executeAction('code-block');
        return;
      }

      if (mod && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.undo();
        return;
      }

      if ((mod && event.shiftKey && event.key.toLowerCase() === 'z') || (mod && event.key.toLowerCase() === 'y')) {
        event.preventDefault();
        this.redo();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        const text = this.textarea.value;
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        if (event.shiftKey) {
          this.applySelectionResult(prefixLines(text, start, end, 'outdent'));
        } else {
          this.applySelectionResult(prefixLines(text, start, end, 'indent'));
        }
      }
    });
  }

  /* -------------------------------------------------------------------------
   * View Mode Toggle
   * ----------------------------------------------------------------------- */
  public setViewMode(mode: 'write' | 'split' | 'preview'): void {
    this.currentViewMode = mode;
    const bodyGrid = this.container.querySelector<HTMLElement>('.js-editor-body-grid');
    const writeCol = this.container.querySelector<HTMLElement>('.js-editor-write-col');
    const previewCol = this.container.querySelector<HTMLElement>('.js-editor-preview-col');
    const viewButtons = this.container.querySelectorAll<HTMLButtonElement>('button[data-view]');

    viewButtons.forEach((btn) => {
      const isCurrent = btn.dataset.view === mode;
      btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      if (isCurrent) {
        btn.classList.add('bg-slate-800', 'text-cyan-400', 'border-cyan-500/80', 'shadow-[0_0_10px_rgba(6,182,212,0.25)]');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('bg-slate-800', 'text-cyan-400', 'border-cyan-500/80', 'shadow-[0_0_10px_rgba(6,182,212,0.25)]');
        btn.classList.add('text-slate-400');
      }
    });

    if (!bodyGrid || !writeCol || !previewCol) return;

    if (mode === 'write') {
      bodyGrid.classList.remove('grid-cols-1', 'lg:grid-cols-2');
      bodyGrid.classList.add('grid-cols-1');
      writeCol.classList.remove('hidden');
      previewCol.classList.add('hidden');
    } else if (mode === 'split') {
      bodyGrid.classList.remove('grid-cols-1');
      bodyGrid.classList.add('grid-cols-1', 'lg:grid-cols-2');
      writeCol.classList.remove('hidden');
      previewCol.classList.remove('hidden');
      this.updatePreview();
    } else if (mode === 'preview') {
      bodyGrid.classList.remove('grid-cols-1', 'lg:grid-cols-2');
      bodyGrid.classList.add('grid-cols-1');
      writeCol.classList.add('hidden');
      previewCol.classList.remove('hidden');
      this.updatePreview();
    }
  }

  /* -------------------------------------------------------------------------
   * Telemetry & Live Preview
   * ----------------------------------------------------------------------- */
  private bindTelemetryAndPreview(): void {
    let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    let historyDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    this.textarea.addEventListener('input', () => {
      this.updateTelemetry();

      // Debounce history push
      if (historyDebounceTimer) clearTimeout(historyDebounceTimer);
      historyDebounceTimer = setTimeout(() => {
        this.pushHistoryState();
      }, 500);

      // Debounce preview update if preview is active
      if (this.currentViewMode !== 'write') {
        if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
        previewDebounceTimer = setTimeout(() => {
          this.updatePreview();
        }, 150);
      }
    });

    this.textarea.addEventListener('keyup', () => this.updateTelemetry());
    this.textarea.addEventListener('click', () => this.updateTelemetry());
    this.textarea.addEventListener('select', () => this.updateTelemetry());
  }

  private updateTelemetry(): void {
    const text = this.textarea.value;
    const caret = this.textarea.selectionStart;
    const stats = calculateTelemetry(text, caret);

    if (this.telemetryWords) this.telemetryWords.textContent = `${stats.words} kata`;
    if (this.telemetryChars) this.telemetryChars.textContent = `${stats.chars} karakter`;
    if (this.telemetryReading) this.telemetryReading.textContent = `~${stats.readingTimeMinutes} mnt baca`;
    if (this.telemetryCaret) this.telemetryCaret.textContent = `Ln ${stats.line}, Col ${stats.col}`;
  }

  public updatePreview(): void {
    if (!this.previewEl) return;
    const markdown = this.textarea.value;
    if (!markdown.trim()) {
      this.previewEl.innerHTML = '<p class="text-slate-500 italic">Belum ada konten untuk dipratinjau.</p>';
      return;
    }

    const html = this.renderMarkdownWithMdxComponents(markdown);
    this.previewEl.innerHTML = html;
  }

  /**
   * Render Markdown ke HTML dan lakukan substitusi komponen custom MDX (<Callout> & <Accordion>).
   */
  private renderMarkdownWithMdxComponents(markdown: string): string {
    // 1. Ganti tag <Callout type="..." title="...">...</Callout>
    let processed = markdown.replace(
      /<Callout\s+type="([^"]+)"(?:\s+title="([^"]*)")?>([\s\S]*?)<\/Callout>/g,
      (_match, type, title, content) => {
        const colorClasses: Record<string, string> = {
          info: 'bg-blue-950/40 border-blue-500 text-blue-200',
          warning: 'bg-amber-950/40 border-amber-500 text-amber-200',
          danger: 'bg-rose-950/40 border-rose-500 text-rose-200',
          success: 'bg-emerald-950/40 border-emerald-500 text-emerald-200',
        };
        const icons: Record<string, string> = {
          info: 'ℹ️',
          warning: '⚠️',
          danger: '🚨',
          success: '✅',
        };
        const classes = colorClasses[type] || colorClasses.info;
        const icon = icons[type] || icons.info;
        const titleHtml = title ? `<h4 class="font-bold text-sm mb-1 !mt-0">${title}</h4>` : '';
        return `\n<div class="my-6 border-l-4 rounded-r-lg p-4 flex gap-3 ${classes}">
  <div class="text-xl flex-shrink-0">${icon}</div>
  <div class="flex-1">
    ${titleHtml}
    <div class="prose prose-sm prose-invert max-w-none !mb-0 [&>p:last-child]:mb-0 [&>p:first-child]:mt-0">
      ${content.trim()}
    </div>
  </div>
</div>\n`;
      },
    );

    // 2. Ganti tag <Accordion title="...">...</Accordion>
    processed = processed.replace(
      /<Accordion(?:\s+title="([^"]*)")?>([\s\S]*?)<\/Accordion>/g,
      (_match, title, content) => {
        const safeTitle = title || 'Detail Informasi';
        return `\n<details class="group my-6 border border-slate-700/80 rounded-lg bg-slate-900/60 open:bg-slate-800/40 transition-colors">
  <summary class="flex items-center justify-between px-4 py-3 font-semibold cursor-pointer text-slate-200 rounded-lg select-none">
    <span>${safeTitle}</span>
    <span class="transition-transform group-open:rotate-180 text-xs">▼</span>
  </summary>
  <div class="px-4 pb-4 pt-2 text-slate-300 border-t border-slate-700/80 prose prose-invert max-w-none">
    ${content.trim()}
  </div>
</details>\n`;
      },
    );

    const rawHtml = marked.parse(processed, { async: false, gfm: true }) as string;

    return sanitizeHtml(rawHtml, {
      allowedTags: [
        'p', 'br', 'hr', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'details', 'summary',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel', 'class'],
        img: ['src', 'alt', 'width', 'height', 'loading', 'class', 'title'],
        pre: ['tabindex', 'class'],
        code: ['class'],
        h1: ['id', 'class'],
        h2: ['id', 'class'],
        h3: ['id', 'class'],
        h4: ['id', 'class'],
        h5: ['id', 'class'],
        h6: ['id', 'class'],
        div: ['class'],
        span: ['class'],
        details: ['class', 'open'],
        summary: ['class'],
        table: ['class'],
      },
      allowedSchemes: ['https', 'http', 'mailto', 'data'],
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
      },
    });
  }

  /* -------------------------------------------------------------------------
   * Modal Focus Trap & Esc Handler
   * ----------------------------------------------------------------------- */
  private trapFocus(modal: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /* -------------------------------------------------------------------------
   * Link Modal
   * ----------------------------------------------------------------------- */
  private openLinkModal(): void {
    if (!this.linkModal) return;

    this.savedSelection = {
      start: this.textarea.selectionStart,
      end: this.textarea.selectionEnd,
    };

    const selectedText = this.textarea.value.slice(
      this.savedSelection.start,
      this.savedSelection.end,
    );

    const textInput = this.linkModal.querySelector<HTMLInputElement>('.js-link-text');
    const urlInput = this.linkModal.querySelector<HTMLInputElement>('.js-link-url');
    const targetCheckbox = this.linkModal.querySelector<HTMLInputElement>('.js-link-target');
    const errorMsg = this.linkModal.querySelector<HTMLElement>('.js-link-error');

    if (errorMsg) errorMsg.textContent = '';

    if (textInput && urlInput) {
      if (validateUrl(selectedText)) {
        urlInput.value = selectedText;
        textInput.value = '';
      } else {
        textInput.value = selectedText;
        urlInput.value = '';
      }
    }

    if (targetCheckbox) targetCheckbox.checked = false;

    this.linkModal.classList.remove('hidden');
    this.linkModal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (urlInput && urlInput.value) {
        textInput?.focus();
      } else {
        urlInput?.focus();
      }
    }, 50);
  }

  private closeLinkModal(): void {
    if (!this.linkModal) return;
    this.linkModal.classList.add('hidden');
    this.linkModal.setAttribute('aria-hidden', 'true');
    this.textarea.focus();
    this.textarea.setSelectionRange(this.savedSelection.start, this.savedSelection.end);
  }

  private bindLinkModal(): void {
    if (!this.linkModal) return;

    this.linkModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeLinkModal();
      } else {
        this.trapFocus(this.linkModal!, e);
      }
    });

    const backdrop = this.linkModal.querySelector<HTMLElement>('.js-modal-backdrop');
    backdrop?.addEventListener('click', () => this.closeLinkModal());

    const cancelBtn = this.linkModal.querySelector<HTMLButtonElement>('.js-link-cancel');
    cancelBtn?.addEventListener('click', () => this.closeLinkModal());

    const formContainer = this.linkModal.querySelector<HTMLElement>('.js-link-form');
    const submitBtn = this.linkModal.querySelector<HTMLButtonElement>('.js-link-submit-btn');

    const handleLinkSubmit = () => {
      const textInput = this.linkModal!.querySelector<HTMLInputElement>('.js-link-text');
      const urlInput = this.linkModal!.querySelector<HTMLInputElement>('.js-link-url');
      const targetCheckbox = this.linkModal!.querySelector<HTMLInputElement>('.js-link-target');
      const errorMsg = this.linkModal!.querySelector<HTMLElement>('.js-link-error');

      const url = urlInput?.value.trim() || '';
      const text = textInput?.value.trim() || '';
      const openInNewTab = Boolean(targetCheckbox?.checked);

      if (!validateUrl(url)) {
        if (errorMsg) {
          errorMsg.textContent = 'Format URL tidak valid. Gunakan https://, http://, /, #, atau mailto:';
        }
        urlInput?.focus();
        return;
      }

      const formatted = formatLinkMarkdown(text, url, openInNewTab);
      const originalText = this.textarea.value;
      const { start, end } = this.savedSelection;

      const newText = originalText.slice(0, start) + formatted + originalText.slice(end);
      const newPos = start + formatted.length;

      this.closeLinkModal();
      this.applySelectionResult({
        text: newText,
        selectionStart: newPos,
        selectionEnd: newPos,
      });
    };

    submitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handleLinkSubmit();
    });

    formContainer?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLinkSubmit();
      }
    });
  }

  /* -------------------------------------------------------------------------
   * Image Modal
   * ----------------------------------------------------------------------- */
  private openImageModal(): void {
    if (!this.imageModal) return;

    this.savedSelection = {
      start: this.textarea.selectionStart,
      end: this.textarea.selectionEnd,
    };

    const selectedText = this.textarea.value.slice(
      this.savedSelection.start,
      this.savedSelection.end,
    );

    const altInputs = this.imageModal.querySelectorAll<HTMLInputElement>('.js-image-alt');
    altInputs.forEach((input) => {
      input.value = selectedText;
    });

    const urlInput = this.imageModal.querySelector<HTMLInputElement>('.js-image-url');
    if (urlInput) urlInput.value = '';

    const captionInputs = this.imageModal.querySelectorAll<HTMLInputElement>('.js-image-caption');
    captionInputs.forEach((input) => {
      input.value = '';
    });

    const errorMsg = this.imageModal.querySelector<HTMLElement>('.js-image-error');
    if (errorMsg) errorMsg.textContent = '';

    // Reset tab ke tab 1 (Direct URL)
    this.switchImageTab('url');

    this.imageModal.classList.remove('hidden');
    this.imageModal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      urlInput?.focus();
    }, 50);
  }

  private closeImageModal(): void {
    if (!this.imageModal) return;
    this.imageModal.classList.add('hidden');
    this.imageModal.setAttribute('aria-hidden', 'true');
    this.textarea.focus();
    this.textarea.setSelectionRange(this.savedSelection.start, this.savedSelection.end);
  }

  private switchImageTab(tabName: 'url' | 'upload'): void {
    if (!this.imageModal) return;

    const tabUrlBtn = this.imageModal.querySelector<HTMLButtonElement>('.js-tab-url-btn');
    const tabUploadBtn = this.imageModal.querySelector<HTMLButtonElement>('.js-tab-upload-btn');
    const panelUrl = this.imageModal.querySelector<HTMLElement>('.js-panel-url');
    const panelUpload = this.imageModal.querySelector<HTMLElement>('.js-panel-upload');

    if (tabName === 'url') {
      tabUrlBtn?.setAttribute('aria-selected', 'true');
      tabUrlBtn?.classList.add('text-cyan-400', 'border-cyan-500');
      tabUrlBtn?.classList.remove('text-slate-400', 'border-transparent');

      tabUploadBtn?.setAttribute('aria-selected', 'false');
      tabUploadBtn?.classList.remove('text-cyan-400', 'border-cyan-500');
      tabUploadBtn?.classList.add('text-slate-400', 'border-transparent');

      panelUrl?.classList.remove('hidden');
      panelUpload?.classList.add('hidden');
    } else {
      tabUploadBtn?.setAttribute('aria-selected', 'true');
      tabUploadBtn?.classList.add('text-cyan-400', 'border-cyan-500');
      tabUploadBtn?.classList.remove('text-slate-400', 'border-transparent');

      tabUrlBtn?.setAttribute('aria-selected', 'false');
      tabUrlBtn?.classList.remove('text-cyan-400', 'border-cyan-500');
      tabUrlBtn?.classList.add('text-slate-400', 'border-transparent');

      panelUpload?.classList.remove('hidden');
      panelUrl?.classList.add('hidden');
    }
  }

  private bindImageModal(): void {
    if (!this.imageModal) return;

    this.imageModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeImageModal();
      } else {
        this.trapFocus(this.imageModal!, e);
      }
    });

    const backdrop = this.imageModal.querySelector<HTMLElement>('.js-modal-backdrop');
    backdrop?.addEventListener('click', () => this.closeImageModal());

    const cancelButtons = this.imageModal.querySelectorAll<HTMLButtonElement>('.js-image-cancel');
    cancelButtons.forEach((btn) => btn.addEventListener('click', () => this.closeImageModal()));

    // Tab buttons
    const tabUrlBtn = this.imageModal.querySelector<HTMLButtonElement>('.js-tab-url-btn');
    const tabUploadBtn = this.imageModal.querySelector<HTMLButtonElement>('.js-tab-upload-btn');
    tabUrlBtn?.addEventListener('click', () => this.switchImageTab('url'));
    tabUploadBtn?.addEventListener('click', () => this.switchImageTab('upload'));

    // Direct URL submit
    const urlContainer = this.imageModal.querySelector<HTMLElement>('.js-image-url-form');
    const urlSubmitBtn = this.imageModal.querySelector<HTMLButtonElement>('.js-image-url-submit-btn');

    const handleUrlSubmit = () => {
      const urlInput = this.imageModal!.querySelector<HTMLInputElement>('.js-image-url');
      const altInput = this.imageModal!.querySelector<HTMLInputElement>('.js-panel-url .js-image-alt');
      const captionInput = this.imageModal!.querySelector<HTMLInputElement>('.js-panel-url .js-image-caption');
      const errorMsg = this.imageModal!.querySelector<HTMLElement>('.js-image-error');

      const url = urlInput?.value.trim() || '';
      const alt = altInput?.value.trim() || '';
      const caption = captionInput?.value.trim();

      if (!url) {
        if (errorMsg) errorMsg.textContent = 'URL gambar wajib diisi.';
        urlInput?.focus();
        return;
      }

      if (!alt) {
        if (errorMsg) errorMsg.textContent = 'Alt text gambar wajib diisi untuk standar SEO dan aksesibilitas.';
        altInput?.focus();
        return;
      }

      const formatted = formatImageMarkdown(alt, url, caption);
      this.insertContentAtSavedSelection(formatted);
      this.closeImageModal();
    };

    urlSubmitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handleUrlSubmit();
    });

    urlContainer?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUrlSubmit();
      }
    });

    // Cloudinary upload dropzone
    this.bindDropzone();
  }

  private bindDropzone(): void {
    if (!this.imageModal) return;

    const dropzone = this.imageModal.querySelector<HTMLElement>('.js-dropzone');
    const fileInput = this.imageModal.querySelector<HTMLInputElement>('.js-file-input');
    const statusText = this.imageModal.querySelector<HTMLElement>('.js-upload-status');
    const uploadContainer = this.imageModal.querySelector<HTMLElement>('.js-image-upload-form');
    const uploadSubmitBtn = this.imageModal.querySelector<HTMLButtonElement>('.js-image-upload-submit-btn');
    const errorMsg = this.imageModal.querySelector<HTMLElement>('.js-image-upload-error');

    if (!dropzone || !fileInput) return;

    let selectedFile: File | null = null;

    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-cyan-500', 'bg-slate-800/60');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-cyan-500', 'bg-slate-800/60');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt?.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFileSelection(fileInput.files[0]);
      }
    });

    const handleFileSelection = (file: File) => {
      if (!file.type.startsWith('image/')) {
        if (errorMsg) errorMsg.textContent = 'Hanya berkas gambar (JPEG, PNG, WebP, SVG) yang diperbolehkan.';
        return;
      }
      if (file.size > 5_242_880) {
        if (errorMsg) errorMsg.textContent = 'Ukuran gambar melebihi batas 5MB.';
        return;
      }
      selectedFile = file;
      if (errorMsg) errorMsg.textContent = '';
      if (statusText) statusText.textContent = `Berkas terpilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

      const altInput = this.imageModal!.querySelector<HTMLInputElement>('.js-panel-upload .js-image-alt');
      if (altInput && !altInput.value) {
        altInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      }
    };

    const handleUploadSubmit = async () => {
      const altInput = this.imageModal!.querySelector<HTMLInputElement>('.js-panel-upload .js-image-alt');
      const captionInput = this.imageModal!.querySelector<HTMLInputElement>('.js-panel-upload .js-image-caption');
      const submitBtn = uploadSubmitBtn;

      if (!selectedFile) {
        if (errorMsg) errorMsg.textContent = 'Silakan pilih gambar terlebih dahulu.';
        return;
      }

      const alt = altInput?.value.trim() || '';
      if (!alt) {
        if (errorMsg) errorMsg.textContent = 'Alt text gambar wajib diisi untuk standar SEO dan aksesibilitas.';
        altInput?.focus();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (statusText) statusText.textContent = 'Mengunggah ke Cloudinary...';

      try {
        const sigRes = await fetch(
          `/api/admin/cloudinary-signature?folder=${encodeURIComponent(this.uploadFolder)}&resource_type=image`,
        );
        if (!sigRes.ok) {
          throw new Error('Gagal mengambil signature Cloudinary. Gunakan tab URL jika endpoint dibatasi.');
        }
        const sig = await sigRes.json();

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('api_key', sig.apiKey);
        formData.append('timestamp', String(sig.timestamp));
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => null);
          throw new Error(errBody?.error?.message ?? 'Gagal mengunggah gambar ke Cloudinary');
        }

        const uploadedData = await uploadRes.json();
        const imageUrl = uploadedData.secure_url;
        const caption = captionInput?.value.trim();

        const formatted = formatImageMarkdown(alt, imageUrl, caption);
        this.insertContentAtSavedSelection(formatted);
        this.closeImageModal();
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = err instanceof Error ? err.message : 'Terjadi kesalahan saat upload.';
        }
        if (statusText) statusText.textContent = '';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    uploadSubmitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      void handleUploadSubmit();
    });

    uploadContainer?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleUploadSubmit();
      }
    });
  }

  private insertContentAtSavedSelection(content: string): void {
    const originalText = this.textarea.value;
    const { start, end } = this.savedSelection;

    const newText = originalText.slice(0, start) + content + originalText.slice(end);
    const newPos = start + content.length;

    this.applySelectionResult({
      text: newText,
      selectionStart: newPos,
      selectionEnd: newPos,
    });
  }
}

/**
 * Inisialisasi seluruh komponen MarkdownEditor di halaman yang memiliki class .js-markdown-editor.
 */
export function initAllMarkdownEditors(): MarkdownEditor[] {
  const instances: MarkdownEditor[] = [];
  const editorEls = document.querySelectorAll<HTMLElement>('.js-markdown-editor');
  editorEls.forEach((el) => {
    instances.push(new MarkdownEditor(el));
  });
  return instances;
}
