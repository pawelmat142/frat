import React from 'react';

interface ControlLabelProps {
    id?: string;
    label?: string;
    required?: boolean;
    className?: string;
}

const ControlLabel: React.FC<ControlLabelProps> = ({ id, label, required, className }) => {
    if (!label) return null;
    return (
        <label htmlFor={id} className={`flex gap-1 mb-1${className ? ` ${className}` : ''}`}>
            {required && <span className="opacity-70 error-color">*</span>} {label}
        </label>
    );
};

export default ControlLabel;
