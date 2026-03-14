import { useEffect } from 'react';

/**
 * Global ripple effect via event delegation.
 * Mobile: expanding circle from touch point.
 * Desktop: handled purely via CSS hover (see _variables.scss).
 * Call once at the app root level.
 */
export function useRippleEffect() {
  useEffect(() => {
    function handleTouch(e: TouchEvent) {
      const target = (e.target as HTMLElement).closest('.ripple') as HTMLElement | null;
      if (!target) return;

      const touch = e.touches[0];
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.5;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-span';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${touch.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${touch.clientY - rect.top - size / 2}px`;

      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    }

    document.addEventListener('touchstart', handleTouch, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouch);
  }, []);
}
