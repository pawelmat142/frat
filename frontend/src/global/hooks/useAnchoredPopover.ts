import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

const POPOVER_ANIMATION_DURATION = 160;
const DESKTOP_POPOVER_MAX_HEIGHT = 320;
const VIEWPORT_GUTTER = 16;

type PopoverPlacement = 'top' | 'bottom';

export const useAnchoredPopover = (
    isDesktop: boolean,
    triggerRef: MutableRefObject<HTMLDivElement | null>,
) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isPopoverMounted, setIsPopoverMounted] = useState(false);
    const [popoverPlacement, setPopoverPlacement] = useState<PopoverPlacement>('bottom');
    const popoverCloseTimeoutRef = useRef<number | null>(null);
    const popoverOpenFrameRef = useRef<number | null>(null);

    const updatePopoverPlacement = useCallback(() => {
        const triggerRect = triggerRef.current?.getBoundingClientRect();
        if (!triggerRect) return;

        const spaceAbove = triggerRect.top - VIEWPORT_GUTTER;
        const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_GUTTER;
        const shouldOpenUpward = spaceBelow < DESKTOP_POPOVER_MAX_HEIGHT && spaceAbove > spaceBelow;

        setPopoverPlacement(shouldOpenUpward ? 'top' : 'bottom');
    }, [triggerRef]);

    const openPopover = useCallback(() => {
        if (popoverCloseTimeoutRef.current) {
            window.clearTimeout(popoverCloseTimeoutRef.current);
            popoverCloseTimeoutRef.current = null;
        }
        if (popoverOpenFrameRef.current) {
            window.cancelAnimationFrame(popoverOpenFrameRef.current);
        }

        updatePopoverPlacement();
        setIsPopoverMounted(true);
        popoverOpenFrameRef.current = window.requestAnimationFrame(() => {
            setIsPopoverOpen(true);
            popoverOpenFrameRef.current = null;
        });
    }, [updatePopoverPlacement]);

    const closePopover = useCallback(() => {
        if (popoverOpenFrameRef.current) {
            window.cancelAnimationFrame(popoverOpenFrameRef.current);
            popoverOpenFrameRef.current = null;
        }

        setIsPopoverOpen(false);
        if (popoverCloseTimeoutRef.current) {
            window.clearTimeout(popoverCloseTimeoutRef.current);
        }
        popoverCloseTimeoutRef.current = window.setTimeout(() => {
            setIsPopoverMounted(false);
            popoverCloseTimeoutRef.current = null;
        }, POPOVER_ANIMATION_DURATION);
    }, []);

    const togglePopover = useCallback(() => {
        if (isPopoverOpen) {
            closePopover();
        } else {
            openPopover();
        }
    }, [closePopover, isPopoverOpen, openPopover]);

    useEffect(() => {
        if (!isDesktop || !isPopoverOpen) return;

        updatePopoverPlacement();

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!triggerRef.current?.contains(event.target as Node)) {
                closePopover();
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closePopover();
        };

        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        window.addEventListener('resize', updatePopoverPlacement);
        document.addEventListener('scroll', updatePopoverPlacement, true);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('resize', updatePopoverPlacement);
            document.removeEventListener('scroll', updatePopoverPlacement, true);
        };
    }, [closePopover, isDesktop, isPopoverOpen, triggerRef, updatePopoverPlacement]);

    useEffect(() => {
        if (!isDesktop) {
            setIsPopoverOpen(false);
            setIsPopoverMounted(false);
        }
    }, [isDesktop]);

    useEffect(() => () => {
        if (popoverCloseTimeoutRef.current) {
            window.clearTimeout(popoverCloseTimeoutRef.current);
        }
        if (popoverOpenFrameRef.current) {
            window.cancelAnimationFrame(popoverOpenFrameRef.current);
        }
    }, []);

    return { closePopover, isPopoverMounted, isPopoverOpen, popoverPlacement, togglePopover };
};