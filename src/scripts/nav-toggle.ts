export function initNavToggle(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-nav-menu]');
  if (!toggle || !menu) return;

  const close = (): void => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('data-open', 'false');
  };

  const open = (): void => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('data-open', 'true');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });

  document.addEventListener('astro:before-preparation', close);
}
