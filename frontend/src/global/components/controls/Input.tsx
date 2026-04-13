import { ChangeEventHandler, forwardRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import FormError from './FormError';
import { AppConfig } from '@shared/AppConfig';

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
        center,
        error,
        showLabel,
    }, ref) => {

    let myClass = `pp-control pp-input`;

    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' control-disabled';
    }
    if (error) {
        myClass += ' pp-control-error';   
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

                {showLabel && (
                    <ControlLabel id={id} label={label} required={required} />
                )}
                
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
                        placeholder={showLabel ? undefined : label}
                    />
                </div>

                <FormError error={error} />
            </div>
        );

});

Input.displayName = 'Input';

export default Input;
