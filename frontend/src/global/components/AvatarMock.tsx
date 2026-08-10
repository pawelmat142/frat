import { AppConfig } from "@shared/AppConfig";
import React from "react";

interface Props {
    letter: string;
    color: string;
    className?: string;
    size?: number; 
}

const AvatarMock: React.FC<Props> = ({
    letter,
    color,
    className = "",
    size = AppConfig.DEFAULT_AVATAR_SIZE
}) => {
    return (
        <div 
            className={`flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ${className}`}
            style={{ 
                backgroundColor: color,
                width: `${size}rem`,
                height: `${size}rem`
            }}
        >
            <span className="font-lora font-extrabold select-none text-white" style={{ fontSize: `${size/1.8}rem` }}>
                {letter.toUpperCase()}
            </span>
        </div>
    )
}

export default AvatarMock;