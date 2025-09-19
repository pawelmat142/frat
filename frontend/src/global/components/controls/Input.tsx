import { ChangeEventHandler } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';

const Input: React.FC<InputInterface> = ({
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
}) => {

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

    return (
        <div className={`${className}${center ? ' mx-auto' : ''}`}>
            <ControlLabel id={id} label={label} required={required} />
            <div>
                <input
                    id={id}
                    name={name || id}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    className={myClass}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                />
            </div>
        </div>
    )

};

export default Input;
