import React, { ChangeEventHandler, forwardRef, ReactNode, useState } from 'react';
import { FloatingInputModes, InputInterface } from '../../interface/controls.interface';
import FormError from './FormError';
import FloatingLabel from './FloatingLabel';

interface FloatingInputProps extends InputInterface {
    icon?: ReactNode;
    onIconClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
    ({
        type = 'text',
        fullWidth = false,
        className = '',
        disabled,
        label,
        onChange,
        onFocus,
        onBlur,
        value,
        id,
        required,
        autoComplete,
        name,
        center,
        error,
        icon,
        onIconClick,
        mode = FloatingInputModes.DEFAULT,
    }, ref) => {

        const [isFocused, setIsFocused] = useState(false);

        let myClass = `pp-control-bg pp-input floating-input ${mode}`;

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

        const hasValue = () => {
            const val = getValue();
            return val !== '' && val !== undefined && val !== null;
        }

        const isLabelFloating = isFocused || hasValue();

        return (
            <div className={`floating-input-wrapper ${className}${center ? ' mx-auto' : ''}`}>
                <div className="floating-input-container">
                    <div className={`pp-control min-height pp-input-row${isFocused ? ' focus' : ''}`}>
                        <input
                            ref={ref}
                            id={id}
                            name={name || id}
                            type={type}
                            value={getValue()}
                            onChange={handleChange}
                            onFocus={(e) => {
                                setIsFocused(true);
                                if (onFocus) onFocus(e as any);
                            }}
                            onBlur={(e) => {
                                setIsFocused(false);
                                if (onBlur) onBlur(e as any);
                            }}
                            className={`${myClass}${icon ? ' pr-10' : ''}`}
                            disabled={disabled}
                            autoComplete={autoComplete}
                            placeholder=" "
                        />
                        {icon && (
                            <div className="floating-input-icon" onClick={onIconClick}>
                                {icon}
                            </div>
                        )}
                        <FloatingLabel
                            htmlFor={id}
                            label={label}
                            required={required}
                            isActive={isLabelFloating}
                            error={error}
                        />
                    </div>
                </div>
                <FormError error={error} />
            </div>
        );
    });

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;
