import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { MenuItem } from "global/interface/controls.interface";

interface Position {
    x: number;
    y: number;
}

interface Props {
    items: MenuItem[];
    position: Position;
    onClose: () => void;
}

const MENU_WIDTH = 180;
const ITEM_HEIGHT = 40;
const PADDING = 8;

const ContextMenu: React.FC<Props> = ({ items, position, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const visibleItems = items.filter(item => item.if === undefined || !!item.if);
    const menuHeight = visibleItems.length * ITEM_HEIGHT + PADDING * 2;

    const x = position.x + MENU_WIDTH > window.innerWidth
        ? window.innerWidth - MENU_WIDTH - PADDING
        : position.x;

    const y = position.y + menuHeight > window.innerHeight
        ? position.y - menuHeight
        : position.y;

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            style={{ top: y, left: x, width: MENU_WIDTH }}
            className="fixed z-50 rounded-xl shadow-xl bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 py-1 overflow-hidden
                        animate-[contextMenuIn_0.12s_ease-out]"
        >
            {visibleItems.map((item, i) => (
                <button
                    key={i}
                    type="button"
                    className="flex items-center gap-3 w-full px-4 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    style={{ height: ITEM_HEIGHT }}
                    onClick={() => {
                        item.onClick?.();
                        onClose();
                    }}
                >
                    {item.icon && <item.icon size={15} className="secondary-text flex-shrink-0" />}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>,
        document.body
    );
};

export default ContextMenu;
