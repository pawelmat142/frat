import React, { ReactNode } from "react";

export interface FloatingActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
    ariaLabel?: string;
    bottomOffset?: number;
    rightOffset?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onClick,
    icon,
    ariaLabel = "Action",
    bottomOffset = 84,
    rightOffset = 24,
}) => {
    const className = ["floating-action-btn", "bottom-bar-shadow"]
        .filter(Boolean)
        .join(" ");

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
