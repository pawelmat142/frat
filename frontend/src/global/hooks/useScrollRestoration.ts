import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig } from '@shared/AppConfig';

const scrollKey = (pathname: string) => `scroll:${pathname}`;

/**
 * Restores scroll position of `.app-main` when navigating back to a previously visited route.
 * Positions are saved in sessionStorage per pathname in real-time (on scroll),
 * and restored after the exit animation completes so the outgoing page doesn't jump.
 *
 * Call once at the App level.
 */
export function useScrollRestoration() {
    const { pathname } = useLocation();

    useEffect(() => {
        const container = document.querySelector('.app-main') as HTMLElement | null;
        if (!container) return;

        // Save scroll position in real-time while user is on this route
        const saveScroll = () => {
            sessionStorage.setItem(scrollKey(pathname), String(container.scrollTop));
        };
        container.addEventListener('scroll', saveScroll, { passive: true });

        // Restore after the exit animation of the previous page finishes
        // (ROUTER_ANIMATION_DURATION matches AnimatePresence mode="wait" timing)
        const timer = setTimeout(() => {
            const saved = sessionStorage.getItem(scrollKey(pathname));
            container.scrollTop = saved ? parseInt(saved, 10) : 0;
        }, AppConfig.ROUTER_ANIMATION_DURATION);

        return () => {
            container.removeEventListener('scroll', saveScroll);
            clearTimeout(timer);
        };
    }, [pathname]);
}
