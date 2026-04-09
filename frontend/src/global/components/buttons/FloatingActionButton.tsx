import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useIsPresent } from "framer-motion";
import { useGlobalContext } from "global/providers/GlobalProvider";

interface FloatingActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
    ariaLabel?: string;
    bottomOffset?: number;
    rightOffset?: number;
    forceVisible?: boolean;
    hidden?: boolean;
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
    ariaLabel = "Action",
    bottomOffset = 84,
    rightOffset = 24,
    forceVisible,
    hidden = false,
}) => {
    // null = not yet interacted (no animation class applied)
    const [visible, setVisible] = useState<boolean | null>(null);
    const [mounted, setMounted] = useState(false);
    const lastScrollTop = useRef(0);
    const isPresent = useIsPresent();

    const globalCtx = useGlobalContext();
    
    // Delay initial render to avoid flash during router navigation
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Scroll happens on .app-main, not window
        const container = document.querySelector<HTMLElement>(".app-main") ?? window;

        const handleScroll = () => {
            const current = getScrollTop(container);
            if (current < lastScrollTop.current) {
                setVisible(true);
            } else if (current > lastScrollTop.current) {
                setVisible(false);
            }
            lastScrollTop.current = current;
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setVisible(!globalCtx.hideFloatingButton);
    }, [globalCtx.hideFloatingButton])

    // When AnimatePresence starts exit transition, immediately hide the FAB
    const visibilityClass = !isPresent || !visible
        ? "fab-hidden"
        : (forceVisible)
            ? "fab-visible"
            : "";

    if (hidden || !mounted) return null;

    const className = ["floating-action-btn", visibilityClass]
        .filter(Boolean)
        .join(" ") + " bottom-bar-shadow";

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
