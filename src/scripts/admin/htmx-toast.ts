interface HtmxResponseErrorDetail {
  xhr: XMLHttpRequest;
}

interface ToastEventDetail {
  message: string;
  variant?: 'success' | 'error';
}

function extractErrorMessage(xhr: XMLHttpRequest): string {
  try {
    const parsed = JSON.parse(xhr.responseText);
    if (typeof parsed.error === 'string') return parsed.error;
    if (parsed.error?.properties) {
      const messages = Object.entries(parsed.error.properties as Record<string, { errors?: string[] }>)
        .filter(([, v]) => Array.isArray(v.errors) && v.errors.length > 0)
        .map(([field, v]) => `${field}: ${v.errors![0]}`);
      if (messages.length > 0) return messages.join('; ');
    }
  } catch {
    /* respons bukan JSON, pakai fallback status text */
  }
  return `Gagal (${xhr.status}): ${xhr.statusText || 'terjadi kesalahan'}`;
}

export function showToast(message: string, variant: 'success' | 'error' = 'error'): void {
  const region = document.getElementById('admin-toast');
  if (!region) return;

  region.textContent = message;
  region.dataset.variant = variant;
  region.dataset.state = 'hidden';

  void region.offsetWidth;
  region.dataset.state = 'visible';

  window.clearTimeout(Number(region.dataset.timeoutId));
  const timeoutId = window.setTimeout(() => {
    region.dataset.state = 'hidden';
  }, 4500);
  region.dataset.timeoutId = String(timeoutId);
}

export function initAdminToast(): void {
  document.body.addEventListener('htmx:responseError', ((event: CustomEvent<HtmxResponseErrorDetail>) => {
    showToast(extractErrorMessage(event.detail.xhr), 'error');
  }) as EventListener);

  document.body.addEventListener('htmx:sendError', () => {
    showToast('Gagal terhubung ke server. Periksa koneksi jaringan.', 'error');
  });

  document.body.addEventListener('toast', ((event: CustomEvent<ToastEventDetail>) => {
    showToast(event.detail.message, event.detail.variant ?? 'success');
  }) as EventListener);
}
