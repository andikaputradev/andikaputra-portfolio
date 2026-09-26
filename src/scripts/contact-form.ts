const FIELD_ERROR_MESSAGES: Record<string, string> = {
  name: 'Name must be between 2 and 100 characters.',
  email: 'Please enter a valid email address.',
  message: 'Message must be between 10 and 2000 characters.',
};

const STATUS_MESSAGES: Record<string, string> = {
  turnstile_unavailable: 'Verification is temporarily unavailable — please email directly instead.',
  turnstile_failed: 'Security verification failed — reload the page and try again.',
  email_unavailable: 'Message service is temporarily unavailable — please email directly instead.',
  email_failed: 'Message could not be sent — please email directly instead.',
};

function clearFieldErrors(form: HTMLFormElement): void {
  for (const field of Object.keys(FIELD_ERROR_MESSAGES)) {
    const input = form.querySelector<HTMLElement>(`#contact-${field}`);
    const errorEl = form.querySelector<HTMLElement>(`#contact-${field}-error`);
    if (errorEl) errorEl.textContent = '';
    input?.removeAttribute('aria-invalid');
  }
}

function showFieldErrors(form: HTMLFormElement, fields: Record<string, string[]>): void {
  let firstInvalid: HTMLElement | null = null;

  for (const field of Object.keys(FIELD_ERROR_MESSAGES)) {
    if (!fields[field]?.length) continue;
    const input = form.querySelector<HTMLElement>(`#contact-${field}`);
    const errorEl = form.querySelector<HTMLElement>(`#contact-${field}-error`);
    if (errorEl) errorEl.textContent = FIELD_ERROR_MESSAGES[field];
    input?.setAttribute('aria-invalid', 'true');
    firstInvalid ??= input;
  }

  firstInvalid?.focus();
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  const statusEl = document.querySelector<HTMLElement>('#contact-form-status');
  if (!form || !statusEl) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
      honeypot: String(formData.get('honeypot') ?? ''),
      turnstileToken: String(formData.get('cf-turnstile-response') ?? ''),
    };

    submitBtn?.setAttribute('disabled', 'true');
    clearFieldErrors(form);
    statusEl.textContent = 'Sending…';
    statusEl.dataset.state = 'pending';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        statusEl.textContent = 'Message sent — thank you.';
        statusEl.dataset.state = 'success';
        form.reset();
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.status === 422 && data?.error === 'validation' && data.fields) {
        const fields = data.fields as Record<string, string[]>;
        const hasKnownFieldError = Object.keys(FIELD_ERROR_MESSAGES).some((f) => fields[f]?.length);
        if (hasKnownFieldError) {
          showFieldErrors(form, fields);
          statusEl.textContent = 'Please correct the highlighted fields.';
        } else {
          // Kegagalan pada honeypot/turnstileToken sengaja tidak ditampilkan
          // per-field agar tidak memberi sinyal diagnostik ke bot.
          statusEl.textContent = 'Please complete the verification challenge above and try again.';
        }
      } else if (typeof data?.error === 'string' && STATUS_MESSAGES[data.error]) {
        statusEl.textContent = STATUS_MESSAGES[data.error];
      } else {
        statusEl.textContent = 'Something went wrong. Please email directly instead.';
      }
      statusEl.dataset.state = 'error';
    } catch {
      statusEl.textContent = 'Network error. Please email directly instead.';
      statusEl.dataset.state = 'error';
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });
}
