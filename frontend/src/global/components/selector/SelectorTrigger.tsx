import React, { forwardRef } from 'react';
import ArrowIcon from '../controls/ArrowIcon';
import FloatingLabel from '../controls/FloatingLabel';
import FormError from '../controls/FormError';
import { BaseSelectorProps } from 'global/interface/controls.interface';

interface SelectorTriggerProps extends BaseSelectorProps {
    /** Content rendered inside the trigger button (selected value display). */
    children: React.ReactNode;
    /** Whether the floating label should be in its active (raised) position. */
    isActive: boolean;
    onClick: () => void;
}

/**
 * Shared trigger wrapper used by FloatingSelector and FloatingSelectorMulti.
 *
 * Renders: outer wrapper → floating-input-container (trigger button + FloatingLabel) → FormError.
 * The caller is responsible only for the *content* displayed inside the button.
 */
const SelectorTrigger = forwardRef<HTMLDivElement, SelectorTriggerProps>(({
    children,
    isActive,
    onClick,
    // BaseSelectorProps
    id,
    label,
    required = false,
    fullWidth = false,
    disabled = false,
    center = false,
    className = '',
    error,
}, ref) => {
    const triggerClass = [
        'pp-control min-height pp-dropdown floating-input',
        fullWidth ? 'w-full' : 'w-fit',
        disabled ? 'opacity-20' : '',
        error ? 'pp-control-error' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={ref}
            className={`floating-input-wrapper${className ? ` ${className}` : ''}${center ? ' mx-auto' : ''}`}
            style={{ position: 'relative' }}
        >
            <div className="floating-input-container">
                <div
                    className={triggerClass}
                    tabIndex={disabled ? -1 : 0}
                    aria-haspopup="listbox"
                    aria-disabled={disabled}
                    onClick={() => {
                        if (!disabled) onClick();
                    }}
                    onKeyDown={e => {
                        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            onClick();
                        }
                    }}
                >
                    {children}
                    <ArrowIcon open={true} />
                </div>

                <FloatingLabel
                    htmlFor={id}
                    label={label}
                    required={required}
                    isActive={isActive}
                    error={error}
                />
            </div>

            <FormError error={error} />
        </div>
    );
});

SelectorTrigger.displayName = 'SelectorTrigger';

export default SelectorTrigger;
