import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { MenuItem } from "global/interface/controls.interface";

interface Position {
    x: number;
    y: number;
}

interface Props {
    items: MenuItem[];
    position: Position;
    closing: boolean;
    onClose: () => void;
}

const MENU_WIDTH = 180;
const ITEM_HEIGHT = 40;
const PADDING = 8;
const ANIM_DURATION = 120;

const ContextMenu: React.FC<Props> = ({ items, position, closing, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const visibleItems = items.filter(item => item.if === undefined || !!item.if);

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);
    const menuHeight = visibleItems.length * ITEM_HEIGHT + PADDING * 2;

    const x = position.x + MENU_WIDTH > window.innerWidth
        ? window.innerWidth - MENU_WIDTH - PADDING
        : position.x;

    const y = position.y + menuHeight > window.innerHeight
        ? position.y - menuHeight
        : position.y;

    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            style={{
                top: y,
                left: x,
                width: MENU_WIDTH,
                opacity: closing || !mounted ? 0 : 1,
                transform: closing || !mounted ? "scale(0.92)" : "scale(1)",
                transformOrigin: "top left",
                transition: `opacity ${ANIM_DURATION}ms ease, transform ${ANIM_DURATION}ms ease`,
            }}
            className="fixed z-50 rounded-xl shadow-xl active-bg py-1 overflow-hidden select-none"
        >
            {visibleItems.map((item, i) => (
                <button
                    key={i}
                    type="button"
                    className="primary-text flex items-center gap-3 w-full px-4 text-sm text-left transition-colors hover-secondary-bg"
                    style={{ height: ITEM_HEIGHT }}
                    onClick={() => {
                        item.onClick?.();
                        onClose();
                    }}
                >
                    {item.icon && <item.icon size={15} className="primary-text flex-shrink-0" />}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>,
        document.body
    );
};

export { ANIM_DURATION };
export default ContextMenu;
