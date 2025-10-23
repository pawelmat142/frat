import { ChangeEventHandler, forwardRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import FormError from './FormError';


const Textarea = forwardRef<HTMLTextAreaElement, InputInterface>(
  ({
    fullWidth = false,
    className = '',
    disabled,
    label,
    onChange,
    value,
    id,
    required,
    name,
    center,
    error,
    rows = 4,
    ...rest
  }, ref) => {
    let myClass = `pp-control pp-textarea`;
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
    };

    const getValue = (): string => {
      if (typeof value === 'string') {
        return value || '';
      }
      return '';
    };

    return (
      <div className={`${className}${center ? ' mx-auto' : ''}`}>
        <ControlLabel id={id} label={label} required={required} />
        <div>
          <textarea
            ref={ref}
            id={id}
            name={name || id}
            value={getValue()}
            onChange={handleChange}
            className={myClass}
            disabled={disabled}
            required={required}
            rows={rows}
            {...rest}
          />
        </div>
        <FormError error={error} />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
