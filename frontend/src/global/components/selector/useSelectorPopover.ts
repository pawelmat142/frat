import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

const POPOVER_ANIMATION_DURATION = 160;

export const useSelectorPopover = (
    isDesktop: boolean,
    triggerRef: MutableRefObject<HTMLDivElement | null>,
) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isPopoverMounted, setIsPopoverMounted] = useState(false);
    const popoverCloseTimeoutRef = useRef<number | null>(null);
    const popoverOpenFrameRef = useRef<number | null>(null);

    const openPopover = useCallback(() => {
        if (popoverCloseTimeoutRef.current) {
            window.clearTimeout(popoverCloseTimeoutRef.current);
            popoverCloseTimeoutRef.current = null;
        }
        if (popoverOpenFrameRef.current) {
            window.cancelAnimationFrame(popoverOpenFrameRef.current);
        }

        setIsPopoverMounted(true);
        popoverOpenFrameRef.current = window.requestAnimationFrame(() => {
            setIsPopoverOpen(true);
            popoverOpenFrameRef.current = null;
        });
    }, []);

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
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [closePopover, isDesktop, isPopoverOpen, triggerRef]);

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

    return { closePopover, isPopoverMounted, isPopoverOpen, togglePopover };
};