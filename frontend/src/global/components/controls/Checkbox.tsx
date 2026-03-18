import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  required = false,
  className = '',
}) => {
  return (
    <label className={`pp-checkbox flex items-center gap-2 ${className}`.trim()} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={e => onChange(e.target.checked)}
        className="checkbox-input cursor-pointer" // Added cursor-pointer class
      />
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};

export default Checkbox;
