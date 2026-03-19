import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface FloatingActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
    scrollContainer?: () => Window | HTMLElement | null | undefined;
    ariaLabel?: string;
    bottomOffset?: number;
    rightOffset?: number;
}

const getScrollTop = (container: Window | HTMLElement): number => {
    if (container === window) {
        return window.scrollY || document.documentElement.scrollTop || 0;
    }
    return (container as HTMLElement).scrollTop;
};

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onClick,
    icon,
    scrollContainer,
    ariaLabel = "Action",
    bottomOffset = 84,
    rightOffset = 24,
}) => {
    const [visible, setVisibleState] = useState(true);
    const [hasHidden, setHasHidden] = useState(false);
    const lastScrollRef = useRef(0);
    const rafRef = useRef<number>();
    const visibleRef = useRef(true);

    const setVisible = useCallback((next: boolean) => {
        visibleRef.current = next;
        setVisibleState(next);
        if (!next) setHasHidden(true);
    }, []);

    useEffect(() => {
        const container = scrollContainer?.() ?? window;
        if (!container) return;

        lastScrollRef.current = getScrollTop(container);

        const update = () => {
            const current = getScrollTop(container);
            const scrollingDown = current > lastScrollRef.current;

            if (scrollingDown && visibleRef.current) {
                setVisible(false);
            } else if (!scrollingDown && !visibleRef.current) {
                setVisible(true);
            }

            lastScrollRef.current = current;
        };

        const handleScroll = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = window.requestAnimationFrame(update);
        };

        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            container.removeEventListener("scroll", handleScroll as EventListener);
        };
    }, [scrollContainer, setVisible]);

    const className = [
        "floating-action-btn",
        visible ? "fab-visible" : hasHidden ? "fab-hidden" : "",
    ].filter(Boolean).join(" ") + " bottom-bar-shadow";

    return (
        <button
            type="button"
            className={className}
            style={{ bottom: bottomOffset, right: rightOffset }}
            aria-label={ariaLabel}
            onClick={onClick}
        >
            {icon}
        </button>
    );
};

export default FloatingActionButton;
