import Sortable from 'sortablejs';
import { CSRF_HEADER_NAME } from '../../lib/csrf';
import { showToast } from './htmx-toast';

interface ReorderConfig {
  containerId: string;
  endpoint: string;
}

export function initReorder({ containerId, endpoint }: ReorderConfig): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const csrfToken = container.dataset.csrf ?? '';

  Sortable.create(container, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'admin-row--ghost',
    onEnd: () => {
      const rows = [...container.querySelectorAll<HTMLElement>('[data-id]')];
      const total = rows.length;
      const payload = rows.map((row, index) => ({
        id: Number(row.dataset.id),
        displayOrder: total - index,
      }));

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken,
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            showToast('Gagal menyimpan urutan baru. Memuat ulang halaman.');
            window.setTimeout(() => window.location.reload(), 1500);
          }
        })
        .catch(() => {
          showToast('Gagal terhubung ke server. Memuat ulang halaman.');
          window.setTimeout(() => window.location.reload(), 1500);
        });
    },
  });
}
