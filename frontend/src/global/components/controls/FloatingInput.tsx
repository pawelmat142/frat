import { ChangeEventHandler, forwardRef, useState } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import FormError from './FormError';
import FloatingLabel from './FloatingLabel';

const FloatingInput = forwardRef<HTMLInputElement, InputInterface>(
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
    }, ref) => {

    const [isFocused, setIsFocused] = useState(false);

    let myClass = `pp-control pp-input floating-input`;

    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
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

    console.log(getValue());
    console.log(isLabelFloating);

    return (
        <div className={`floating-input-wrapper ${className}${center ? ' mx-auto' : ''}`}>
            <div className="floating-input-container">
                <input
                    ref={ref}
                    id={id}
                    name={name || id}
                    type={type}
                    value={getValue()}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={myClass}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    placeholder=" "
                />
                <FloatingLabel
                    htmlFor={id}
                    label={label}
                    required={required}
                    isActive={isLabelFloating}
                    error={error}
                />
            </div>
            <FormError error={error} />
        </div>
    );
});

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;
