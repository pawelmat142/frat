import React, { ReactNode, useEffect, useRef, useState } from "react";

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
    const lastScrollTop = useRef(0);

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

    const visibilityClass =
        forceVisible !== undefined
            ? forceVisible ? "fab-visible" : "fab-hidden"
            : visible === true ? "fab-visible" : visible === false ? "fab-hidden" : "";

    if (hidden) return null;

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
