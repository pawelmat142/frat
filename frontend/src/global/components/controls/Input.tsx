import { ChangeEventHandler, forwardRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';

const Input = forwardRef<HTMLInputElement, InputInterface>(
    ({
        type = 'text',
        fullWidth = false,
        className = '',
        disabled,
        label,
        onChange,
        value,
        id,
        required,
        autoComplete,
        name,
        center
    }, ref) => {

    let myClass = `pp-control pp-input`;

    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            event.preventDefault()
        }
        else if (onChange) {
            onChange(event);
        }
    };

    const getValue = (): string | number | undefined => {
        if (typeof value === 'string') {
            return value || '';
        }
        if (typeof value === 'number') {
            return value || 0;
        }
        return undefined;
    }
    
        return (
            <div className={`${className}${center ? ' mx-auto' : ''}`}>
                <ControlLabel id={id} label={label} required={required} />
                <div>
                    <input
                        ref={ref}
                        id={id}
                        name={name || id}
                        type={type}
                        value={getValue()}
                        onChange={handleChange}
                        className={myClass}
                        disabled={disabled}
                        required={required}
                        autoComplete={autoComplete}
                    />
                </div>
            </div>
        );

});

Input.displayName = 'Input';

export default Input;
