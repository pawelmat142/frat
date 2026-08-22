import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { MenuGroup } from "global/interface/controls.interface";
import { AppConfig } from "@shared/AppConfig";

const GROUP_DIVIDER_HEIGHT = 9;
const GROUP_HEADER_HEIGHT = 29;
const MENU_ANCHOR_OVERLAP = 12;

interface Position {
    x: number;
    y: number;
}

interface Props {
    groups: MenuGroup[];
    position: Position;
    width?: number;
    closing: boolean;
    onClose: () => void;
}

const ContextMenu: React.FC<Props> = ({ groups, position, width, closing, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const menuWidth = width ?? AppConfig.CONTEXT_MENU.WIDTH;
    const visibleGroups = groups
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.if === undefined || !!item.if),
        }))
        .filter(group => group.items.length > 0);

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);
    const menuHeight = visibleGroups.reduce(
        (height, group, index) => height
            + group.items.length * AppConfig.CONTEXT_MENU.ITEM_HEIGHT
            + (index > 0 ? GROUP_DIVIDER_HEIGHT : 0)
            + (group.title ? GROUP_HEADER_HEIGHT : 0),
        AppConfig.CONTEXT_MENU.PADDING * 2,
    );
    const maxMenuHeight = window.innerHeight - AppConfig.CONTEXT_MENU.PADDING * 2;
    const renderedMenuHeight = Math.min(menuHeight, maxMenuHeight);

    const opensToLeft = position.x > window.innerWidth / 2;
    const idealX = opensToLeft
        ? position.x - menuWidth + MENU_ANCHOR_OVERLAP
        : position.x - MENU_ANCHOR_OVERLAP;
    const x = Math.min(
        Math.max(AppConfig.CONTEXT_MENU.PADDING, idealX),
        window.innerWidth - menuWidth - AppConfig.CONTEXT_MENU.PADDING,
    );

    const idealY = position.y + renderedMenuHeight > window.innerHeight
        ? position.y - renderedMenuHeight
        : position.y;
    const y = Math.min(
        Math.max(AppConfig.CONTEXT_MENU.PADDING, idealY),
        window.innerHeight - renderedMenuHeight - AppConfig.CONTEXT_MENU.PADDING,
    );

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
                width: menuWidth,
                maxHeight: maxMenuHeight,
                overflowY: "auto",
                opacity: closing || !mounted ? 0 : 1,
                transform: closing || !mounted ? "scale(0.92)" : "scale(1)",
                transformOrigin: "top left",
                transition: `opacity ${AppConfig.CONTEXT_MENU.ANIMATION_DURATION}ms ease, transform ${AppConfig.CONTEXT_MENU.ANIMATION_DURATION}ms ease`,
            }}
            className="fixed z-50 rounded-xl shadow-xl active-bg py-1 overflow-hidden select-none"
        >
            {visibleGroups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                    {groupIndex > 0 && <div className="mx-4 my-1 border-t border-[var(--border-color)]" role="separator" />}
                    {group.title && (
                        <div className="secondary-text px-4 pt-2 pb-1 text-xs font-medium">
                            {group.title}
                        </div>
                    )}
                    {group.items.map((item, itemIndex) => (
                        <button
                            key={itemIndex}
                            type="button"
                            className={`primary-text flex items-center gap-3 w-full px-4 text-sm text-left transition-colors hover-secondary-bg${item.className ? ` ${item.className}` : ""}`}
                            style={{ height: AppConfig.CONTEXT_MENU.ITEM_HEIGHT }}
                            onClick={() => {
                                item.onClick?.();
                                onClose();
                            }}
                        >
                            {item.icon && <item.icon size={15} className="flex-shrink-0" />}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </React.Fragment>
            ))}
        </div>,
        document.body
    );
};

export default ContextMenu;
