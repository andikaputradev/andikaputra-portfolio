import { register } from 'swiper/element/bundle';

export function ensureSwiperRegistered(): void {
  if (customElements.get('swiper-container')) return;
  register();
}
