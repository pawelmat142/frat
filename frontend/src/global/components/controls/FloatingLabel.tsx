import React from 'react';

interface FloatingLabelProps {
    htmlFor?: string;
    label?: string;
    required?: boolean;
    isActive: boolean;
    error?: any;
    className?: string;
}

const FloatingLabel: React.FC<FloatingLabelProps> = ({ 
    htmlFor, 
    label, 
    required, 
    isActive, 
    error,
    className = ''
}) => {
    if (!label) return null;
    
    return (
        <label 
            htmlFor={htmlFor} 
            className={`floating-label ${isActive ? 'floating-label-active' : ''} ${error ? 'floating-label-error' : ''} ${className}`}
        >
            {required && <span className="floating-label-required">*</span>}
            {label}
        </label>
    );
};

export default FloatingLabel;
