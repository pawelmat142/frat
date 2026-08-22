import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ContextMenuGroup } from "global/interface/controls.interface";
import { AppConfig } from "@shared/AppConfig";

const GROUP_DIVIDER_HEIGHT = 9;
const GROUP_HEADER_HEIGHT = 29;

interface Position {
    x: number;
    y: number;
}

interface Props {
    groups: ContextMenuGroup[];
    position: Position;
    closing: boolean;
    onClose: () => void;
}

const ContextMenu: React.FC<Props> = ({ groups, position, closing, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
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

    const x = position.x + AppConfig.CONTEXT_MENU.WIDTH > window.innerWidth
        ? window.innerWidth - AppConfig.CONTEXT_MENU.WIDTH - AppConfig.CONTEXT_MENU.PADDING
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
                width: AppConfig.CONTEXT_MENU.WIDTH,
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
