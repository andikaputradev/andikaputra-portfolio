export function initImageFallback(selector = '.js-cover-image'): void {
  document.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
    if (img.complete && img.naturalWidth === 0) {
      img.classList.add('is-broken');
      return;
    }

    img.addEventListener(
      'error',
      () => {
        img.classList.add('is-broken');
      },
      { once: true },
    );

    img.addEventListener(
      'load',
      () => {
        img.classList.remove('is-broken');
      },
      { once: true },
    );
  });
}
