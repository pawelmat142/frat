import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

type ScrollContainer = Window | HTMLElement;

const isWindow = (container: ScrollContainer): container is Window =>
    typeof window !== "undefined" && container === window;

const SHOW_THRESHOLD_RATIO = 0.55;
const HIDE_THRESHOLD_RATIO = 0.12;

interface FloatingScrollTopButtonProps {
    scrollContainer?: () => ScrollContainer | null | undefined;
    className?: string;
    bottomOffset?: number;
    rightOffset?: number;
    ariaLabel?: string;
}

const getScrollTop = (container: ScrollContainer): number => {
    if (isWindow(container)) {
        return window.scrollY || document.documentElement.scrollTop || 0;
    }
    return (container as HTMLElement).scrollTop;
};

const getViewportHeight = (container: ScrollContainer): number => {
    if (isWindow(container)) {
        return window.innerHeight;
    }
    return (container as HTMLElement).clientHeight;
};

const scrollToTop = (container: ScrollContainer) => {
    if (isWindow(container)) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    }
};

const FloatingScrollTopButton: React.FC<FloatingScrollTopButtonProps> = ({
    scrollContainer,
    className = "",
    bottomOffset = 84,
    rightOffset = 44,
    ariaLabel = "Scroll to top",
}) => {
    const [visible, setVisibleState] = useState(false);
    const containerRef = useRef<ScrollContainer | null>(null);
    const lastScrollRef = useRef(0);
    const rafRef = useRef<number>();
    const visibleRef = useRef(false);

    const setButtonVisible = useCallback((nextVisible: boolean) => {
        visibleRef.current = nextVisible;
        setVisibleState(nextVisible);
    }, []);

    useEffect(() => {
        const container = scrollContainer?.() ?? window;
        if (!container) {
            return;
        }
        containerRef.current = container;
        lastScrollRef.current = getScrollTop(container);

        const updateVisibility = () => {
            const viewportHeight = getViewportHeight(container);
            const current = getScrollTop(container);
            const isScrollingUp = current < lastScrollRef.current;
            const scrolledPastThreshold = current > viewportHeight * SHOW_THRESHOLD_RATIO;
            const nearTop = current <= viewportHeight * HIDE_THRESHOLD_RATIO;

            if (nearTop) {
                if (visibleRef.current) {
                    setButtonVisible(false);
                }
            } else if (scrolledPastThreshold && (isScrollingUp || !visibleRef.current)) {
                if (!visibleRef.current) {
                    setButtonVisible(true);
                }
            }

            lastScrollRef.current = current;
        };

        const handleScroll = () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = window.requestAnimationFrame(updateVisibility);
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        updateVisibility();

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            container.removeEventListener("scroll", handleScroll as EventListener);
        };
    }, [scrollContainer, setButtonVisible]);

    const handleClick = useCallback(() => {
        if (!containerRef.current) {
            return;
        }
        scrollToTop(containerRef.current);
        setButtonVisible(false);
    }, [setButtonVisible]);

    const combinedClassName = `floating-scroll-top-btn ${visible ? "is-visible" : "is-hidden"} ${className}`.trim();

    return (
        <button
            type="button"
            className={combinedClassName}
            style={{ bottom: bottomOffset, right: rightOffset }}
            aria-label={ariaLabel}
            onClick={handleClick}
        >
            <FaArrowUp size={22} />
        </button>
    );
};

export default FloatingScrollTopButton;
