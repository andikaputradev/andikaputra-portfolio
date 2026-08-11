interface HtmxConfirmDetail {
  question?: string;
  issueRequest: (skipConfirmation?: boolean) => void;
}

export function initConfirmDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#confirm-dialog');
  const textEl = document.querySelector<HTMLElement>('#confirm-dialog-text');
  const okBtn = document.querySelector<HTMLButtonElement>('#confirm-dialog-ok');
  const cancelBtn = document.querySelector<HTMLButtonElement>('#confirm-dialog-cancel');
  if (!dialog || !textEl || !okBtn || !cancelBtn) return;

  document.body.addEventListener('htmx:confirm', ((event: CustomEvent<HtmxConfirmDetail>) => {
    if (!event.detail.question) return;
    event.preventDefault();

    textEl.textContent = event.detail.question;
    dialog.showModal();

    const cleanup = (): void => {
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('cancel', onCancel);
    };
    const onOk = (): void => {
      dialog.close();
      cleanup();
      event.detail.issueRequest(true);
    };
    const onCancel = (): void => {
      dialog.close();
      cleanup();
    };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    dialog.addEventListener('cancel', onCancel);
  }) as EventListener);
}
