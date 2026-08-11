export function toastTrigger(message: string, variant: 'success' | 'error' = 'success'): string {
  return JSON.stringify({ toast: { message, variant } });
}
