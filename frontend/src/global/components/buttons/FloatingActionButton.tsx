import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";

interface FloatingActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
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
    ariaLabel = "Action",
    bottomOffset = 84,
    rightOffset = 24
}) => {
    const [visible, setVisible] = useState<boolean | null>(null);
    const lastScrollTop = useRef(0);

    const globalCtx = useGlobalContext();

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

    const visibilityClass = !visible
        ? "fab-hidden"
        : "fab-visible";

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
