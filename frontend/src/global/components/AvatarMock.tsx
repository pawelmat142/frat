import React from "react";

interface Props {
    letter: string;
    color: string;
    className?: string;
}

const AvatarMock: React.FC<Props> = ({
    letter,
    color,
    className = ""
}) => {
    return (
        <div 
            className={`flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ${className}`}
            style={{ 
                backgroundColor: color,
                width: '3.5rem',
                height: '3.5rem'
            }}
        >
            <span className="font-lora font-extrabold text-3xl select-none text-white">
                {letter.toUpperCase()}
            </span>
        </div>
    )
}

export default AvatarMock;