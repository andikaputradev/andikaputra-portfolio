import { calculateReadingTime, countWords } from '../../lib/reading-time';

export interface SelectionResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface TelemetryStats {
  words: number;
  chars: number;
  readingTimeMinutes: number;
  line: number;
  col: number;
}

/**
 * Membungkus (wrap) teks terseleksi dengan prefix dan suffix inline (misal **bold**, *italic*).
 * Jika teks sudah terbungkus, fungsi akan melepaskannya (toggle off).
 * Jika tidak ada teks terseleksi (start === end), fungsi menyisipkan prefix + suffix dan
 * memposisikan kursor persis di tengah.
 */
export function wrapInline(
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string = prefix,
): SelectionResult {
  if (start === end) {
    const newText = text.slice(0, start) + prefix + suffix + text.slice(start);
    const caret = start + prefix.length;
    return {
      text: newText,
      selectionStart: caret,
      selectionEnd: caret,
    };
  }

  const selected = text.slice(start, end);

  // Kasus 1: Teks yang diseleksi sendiri sudah diawali prefix & diakhiri suffix
  if (
    selected.startsWith(prefix) &&
    selected.endsWith(suffix) &&
    selected.length >= prefix.length + suffix.length
  ) {
    const unwrapped = selected.slice(prefix.length, selected.length - suffix.length);
    const newText = text.slice(0, start) + unwrapped + text.slice(end);
    return {
      text: newText,
      selectionStart: start,
      selectionEnd: start + unwrapped.length,
    };
  }

  // Kasus 2: Karakter persis di luar seleksi adalah prefix dan suffix
  if (
    start >= prefix.length &&
    end + suffix.length <= text.length &&
    text.slice(start - prefix.length, start) === prefix &&
    text.slice(end, end + suffix.length) === suffix
  ) {
    const newText =
      text.slice(0, start - prefix.length) + selected + text.slice(end + suffix.length);
    const newStart = start - prefix.length;
    return {
      text: newText,
      selectionStart: newStart,
      selectionEnd: newStart + selected.length,
    };
  }

  // Kasus 3: Bungkus teks terseleksi
  const newText = text.slice(0, start) + prefix + selected + suffix + text.slice(end);
  const newStart = start + prefix.length;
  const newEnd = newStart + selected.length;
  return {
    text: newText,
    selectionStart: newStart,
    selectionEnd: newEnd,
  };
}

/**
 * Mengubah atau membatalkan format Heading (H2, H3, H4) pada baris kursor/seleksi.
 */
export function toggleHeading(
  text: string,
  start: number,
  end: number,
  level: 2 | 3 | 4,
): SelectionResult {
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const nextNewline = text.indexOf('\n', end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const currentLine = text.slice(lineStart, lineEnd);
  const headingMarker = '#'.repeat(level) + ' ';

  const existingMatch = currentLine.match(/^(#{1,6})\s*(.*)$/);
  let newLine: string;

  if (existingMatch) {
    const currentHashes = existingMatch[1];
    const rest = existingMatch[2];
    if (currentHashes.length === level) {
      // Toggle off: kembalikan ke teks biasa tanpa marker heading
      newLine = rest;
    } else {
      // Ganti level heading yang ada dengan level yang dipilih
      newLine = headingMarker + rest;
    }
  } else {
    // Tambahkan heading marker ke baris
    newLine = headingMarker + currentLine;
  }

  const newText = text.slice(0, lineStart) + newLine + text.slice(lineEnd);
  const lengthDiff = newLine.length - currentLine.length;
  const newStart = Math.max(lineStart, start + lengthDiff);
  const newEnd = Math.max(newStart, end + lengthDiff);

  return {
    text: newText,
    selectionStart: newStart,
    selectionEnd: newEnd,
  };
}

export type LinePrefixMode =
  | 'bullet'
  | 'ordered'
  | 'task'
  | 'quote'
  | 'indent'
  | 'outdent';

/**
 * Menambahkan atau menghapus prefix baris (bullet list, ordered list, task list, quote, indent, outdent).
 * Mencegah off-by-one bug pada seleksi multiline.
 */
export function prefixLines(
  text: string,
  start: number,
  end: number,
  mode: LinePrefixMode,
): SelectionResult {
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const nextNewline = text.indexOf('\n', end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const block = text.slice(lineStart, lineEnd);
  const lines = block.split('\n');

  let newLines: string[];

  if (mode === 'bullet') {
    const allHaveBullet = lines.every(
      (line) => line.trim().length === 0 || /^[-*]\s+/.test(line),
    );
    if (allHaveBullet && lines.some((line) => /^[-*]\s+/.test(line))) {
      newLines = lines.map((line) => line.replace(/^[-*]\s+/, ''));
    } else {
      newLines = lines.map((line) => (line.length === 0 ? '- ' : `- ${line}`));
    }
  } else if (mode === 'ordered') {
    const allHaveNumbered = lines.every(
      (line) => line.trim().length === 0 || /^\d+\.\s+/.test(line),
    );
    if (allHaveNumbered && lines.some((line) => /^\d+\.\s+/.test(line))) {
      newLines = lines.map((line) => line.replace(/^\d+\.\s+/, ''));
    } else {
      let counter = 1;
      newLines = lines.map((line) => {
        if (line.trim().length === 0) return `${counter++}. `;
        return `${counter++}. ${line}`;
      });
    }
  } else if (mode === 'task') {
    const allHaveTask = lines.every(
      (line) => line.trim().length === 0 || /^-\s+\[[ xX]\]\s+/.test(line),
    );
    if (allHaveTask && lines.some((line) => /^-\s+\[[ xX]\]\s+/.test(line))) {
      newLines = lines.map((line) => line.replace(/^-\s+\[[ xX]\]\s+/, ''));
    } else {
      newLines = lines.map((line) => (line.length === 0 ? '- [ ] ' : `- [ ] ${line}`));
    }
  } else if (mode === 'quote') {
    const allHaveQuote = lines.every(
      (line) => line.trim().length === 0 || /^>\s?/.test(line),
    );
    if (allHaveQuote && lines.some((line) => /^>\s?/.test(line))) {
      newLines = lines.map((line) => line.replace(/^>\s?/, ''));
    } else {
      newLines = lines.map((line) => (line.length === 0 ? '> ' : `> ${line}`));
    }
  } else if (mode === 'indent') {
    newLines = lines.map((line) => '  ' + line);
  } else if (mode === 'outdent') {
    newLines = lines.map((line) => line.replace(/^( {1,2}|\t)/, ''));
  } else {
    newLines = lines;
  }

  const newBlock = newLines.join('\n');
  const newText = text.slice(0, lineStart) + newBlock + text.slice(lineEnd);

  // Jika seleksi awal mencakup banyak baris, pertahankan seleksi seluruh blok yang dimodifikasi
  if (start !== end) {
    return {
      text: newText,
      selectionStart: lineStart,
      selectionEnd: lineStart + newBlock.length,
    };
  }

  // Jika single cursor, hitung pergeseran posisi kursor
  const lengthDiff = newBlock.length - block.length;
  const newCursor = Math.max(lineStart, Math.min(newText.length, start + lengthDiff));
  return {
    text: newText,
    selectionStart: newCursor,
    selectionEnd: newCursor,
  };
}

/**
 * Menyisipkan blok kode dengan bahasa yang dipilih.
 */
export function insertCodeBlock(
  text: string,
  start: number,
  end: number,
  language = 'typescript',
): SelectionResult {
  const selected = text.slice(start, end);
  const codeContent = selected.length > 0 ? selected : '// Tulis kode di sini';
  const block = `\`\`\`${language}\n${codeContent}\n\`\`\`\n`;

  const newText = text.slice(0, start) + block + text.slice(end);
  const insideStart = start + language.length + 4; // setelah ```lang\n
  const insideEnd = insideStart + codeContent.length;

  return {
    text: newText,
    selectionStart: insideStart,
    selectionEnd: insideEnd,
  };
}

/**
 * Menyisipkan tabel GFM (GitHub Flavored Markdown) terstruktur.
 */
export function insertTable(
  text: string,
  start: number,
  end: number,
  rows = 3,
  cols = 3,
): SelectionResult {
  const headerCols = Array.from({ length: cols }, (_, i) => `Kolom ${i + 1}`);
  const separatorCols = Array.from({ length: cols }, () => ':---');

  const headerLine = `| ${headerCols.join(' | ')} |`;
  const separatorLine = `| ${separatorCols.join(' | ')} |`;

  const dataRows: string[] = [];
  for (let r = 1; r <= rows; r++) {
    const rowCols = Array.from({ length: cols }, (_, c) => `Item ${r}.${c + 1}`);
    dataRows.push(`| ${rowCols.join(' | ')} |`);
  }

  const tableMarkdown = `\n${headerLine}\n${separatorLine}\n${dataRows.join('\n')}\n\n`;
  const newText = text.slice(0, start) + tableMarkdown + text.slice(end);
  const caret = start + tableMarkdown.length;

  return {
    text: newText,
    selectionStart: caret,
    selectionEnd: caret,
  };
}

/**
 * Menyisipkan garis pemisah horizontal (horizontal divider).
 */
export function insertHorizontalRule(
  text: string,
  start: number,
  end: number,
): SelectionResult {
  const divider = '\n\n---\n\n';
  const newText = text.slice(0, start) + divider + text.slice(end);
  const caret = start + divider.length;
  return {
    text: newText,
    selectionStart: caret,
    selectionEnd: caret,
  };
}

/**
 * Menyisipkan komponen custom MDX Callout.
 */
export function insertMdxCallout(
  text: string,
  start: number,
  end: number,
  type: 'info' | 'warning' | 'danger' | 'success' = 'info',
  title = 'Catatan',
): SelectionResult {
  const selected = text.slice(start, end);
  const body = selected.trim().length > 0 ? selected : 'Tulis isi catatan di sini.';
  const snippet = `<Callout type="${type}" title="${title}">\n${body}\n</Callout>\n`;

  const newText = text.slice(0, start) + snippet + text.slice(end);
  const caretStart = start + snippet.indexOf(body);
  const caretEnd = caretStart + body.length;

  return {
    text: newText,
    selectionStart: caretStart,
    selectionEnd: caretEnd,
  };
}

/**
 * Menyisipkan komponen custom MDX Accordion.
 */
export function insertMdxAccordion(
  text: string,
  start: number,
  end: number,
  title = 'Judul Accordion',
): SelectionResult {
  const selected = text.slice(start, end);
  const body = selected.trim().length > 0 ? selected : 'Tulis konten tersembunyi di sini.';
  const snippet = `<Accordion title="${title}">\n${body}\n</Accordion>\n`;

  const newText = text.slice(0, start) + snippet + text.slice(end);
  const caretStart = start + snippet.indexOf(body);
  const caretEnd = caretStart + body.length;

  return {
    text: newText,
    selectionStart: caretStart,
    selectionEnd: caretEnd,
  };
}

/**
 * Memformat tautan Markdown atau HTML (jika openInNewTab aktif).
 */
export function formatLinkMarkdown(
  text: string,
  url: string,
  openInNewTab = false,
): string {
  const safeText = text.trim() || url.trim();
  const safeUrl = url.trim();
  if (openInNewTab) {
    return `<a href="${safeUrl}" target="_blank" rel="noopener">${safeText}</a>`;
  }
  return `[${safeText}](${safeUrl})`;
}

/**
 * Memformat gambar Markdown dengan alt text dan optional caption.
 */
export function formatImageMarkdown(
  alt: string,
  url: string,
  caption?: string,
): string {
  const safeAlt = alt.trim() || 'Gambar';
  const safeUrl = url.trim();
  const safeCaption = caption?.trim();
  if (safeCaption) {
    return `![${safeAlt}](${safeUrl} "${safeCaption}")`;
  }
  return `![${safeAlt}](${safeUrl})`;
}

/**
 * Validasi sintaks URL tujuan tautan.
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Mendukung HTTPS, HTTP, relative root URL (/...), anchor (#...), dan mailto
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:')
  ) {
    return true;
  }
  return false;
}

/**
 * Menghitung nomor baris dan kolom posisi kursor saat ini (1-indexed).
 */
export function getLineAndCol(
  text: string,
  pos: number,
): { line: number; col: number } {
  const clampedPos = Math.max(0, Math.min(text.length, pos));
  const before = text.slice(0, clampedPos);
  const lines = before.split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

/**
 * Menghitung seluruh statistik telemetri untuk status bar editor.
 */
export function calculateTelemetry(
  text: string,
  caretPos: number,
): TelemetryStats {
  const words = countWords(text);
  const chars = text.length;
  const readingTimeMinutes = calculateReadingTime(text);
  const { line, col } = getLineAndCol(text, caretPos);

  return {
    words,
    chars,
    readingTimeMinutes,
    line,
    col,
  };
}
