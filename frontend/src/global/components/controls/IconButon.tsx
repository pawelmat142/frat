import { BtnMode, BtnModes, BtnSize, BtnSizes } from '../../interface/controls.interface';
import { MouseEventHandler } from 'react';

export interface IconBtnInterface {
    size?: BtnSize;
    icon: React.ReactNode;
    onClick?: MouseEventHandler;
    disabled?: boolean;
    className?: string;
    mode?: BtnMode
}

const IconButton: React.FC<IconBtnInterface> = ({ onClick, size = BtnSizes.MEDIUM, icon, className, disabled, mode = BtnModes.PRIMARY }) => {

    let myClass = `rounded-md shadow-sm btn-font icon-btn ripple`;

    if (className) {
        myClass += ` ${className}`;
    }
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }

    const handleClick: MouseEventHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            event.preventDefault()
        }
        else if (onClick) {
            onClick(event);
        }
    };

    return (
        <div className={`${myClass} ${size} ${mode}`} onClick={handleClick}>
            {icon}
        </div>
    )

};

export default IconButton;