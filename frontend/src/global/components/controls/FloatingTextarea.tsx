import { ChangeEventHandler, forwardRef, ReactNode, useState, useRef, useEffect } from 'react';
import { FloatingInputModes, InputInterface } from '../../interface/controls.interface';
import FormError from './FormError';
import FloatingLabel from './FloatingLabel';

interface FloatingTextareaProps extends InputInterface {
    icon?: ReactNode;
    onIconClick?: () => void;
    initialRows?: number;
}

const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
    ({
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
        icon,
        onIconClick,
        mode = FloatingInputModes.DEFAULT,
        initialRows = 4
    }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);

        let myClass = `pp-control-bg pp-input floating-input ${mode}`;
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

        const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
            if (disabled) {
                event.preventDefault();
            } else if (onChange) {
                onChange(event);
            }
            autoResize(event.target);
        };

        const getValue = (): string | undefined => {
            if (typeof value === 'string') {
                return value || '';
            }
            return undefined;
        };

        const hasValue = () => {
            const val = getValue();
            return val !== '' && val !== undefined && val !== null;
        };

        const isLabelFloating = isFocused || hasValue();

        const autoResize = (el: HTMLTextAreaElement) => {
            el.rows = initialRows;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        };

        useEffect(() => {
            if (textareaRef.current) {
                autoResize(textareaRef.current);
            }
        }, [value, initialRows]);

        return (
            <div className={`floating-input-wrapper ${className}${center ? ' mx-auto' : ''}`}>
                <div className="floating-input-container">
                    <div className="pp-control pp-input-row pp-textarea px-0 overflow-hidden">
                        <textarea
                            ref={(node) => {
                                textareaRef.current = node;
                                if (typeof ref === 'function') ref(node);
                                else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
                            }}
                            id={id}
                            name={name || id}
                            value={getValue()}
                            onChange={handleChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`${myClass}${icon ? ' pr-10' : ''} w-full px-3 outline-none resize-none`}
                            disabled={disabled}
                            required={required}
                            autoComplete={autoComplete}
                            rows={initialRows}
                            placeholder=" "
                        />
                        {icon && icon}
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
    }
);

FloatingTextarea.displayName = 'FloatingTextarea';

export default FloatingTextarea;
