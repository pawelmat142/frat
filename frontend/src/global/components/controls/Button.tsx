import { BtnInterface, BtnModes, BtnSizes } from '../../interface/controls.interface';
import { Link } from 'react-router-dom';
import { MouseEventHandler } from 'react';

const Button: React.FC<BtnInterface> = ({ to='', type = 'button', onClick, size=BtnSizes.MEDIUM, children, fullWidth=false, className, disabled, onlyMobile, onlyDesktop, mode=BtnModes.PRIMARY }) => {
    
    let myClass = `rounded-md shadow-sm btn-font btn ${mode} ripple ${size}`;

    if (onlyMobile) {
        myClass += ' flex md:hidden';
    } 
    else if (onlyDesktop) {
        myClass += ' hidden md:flex';
    } else {
        myClass += ' flex';
    }
    if (className) {
        myClass += ` ${className}`;
    }
    if (fullWidth) {
        myClass += ' w-full justify-center';
    } else {
        myClass += ' w-fit';
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

    if (to) {
        return (
            <Link
                to={to}
                className={myClass}
                tabIndex={disabled ? -1 : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                onClick={handleClick}
            >
                {children}
            </Link>
        );
    } else {    
        return(
            <button
                type={type}
                onClick={handleClick}
                className={myClass}
                disabled={disabled}
            >
                {children}
            </button>
        )
    }
    
};

export default Button;
