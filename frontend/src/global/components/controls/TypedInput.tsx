import { InputInterface } from '../../interface/controls.interface';
import { DictionaryColumnTypes } from '@shared/interfaces/DictionaryI';
import { DateUtil } from '@shared/utils/DateUtil';
import FloatingInput from './FloatingInput';
import Checkbox from './Checkbox';
import FloatingDateInput from '../callendar/FloatingDateInput';

const TypedInput: React.FC<InputInterface> = (param) => {

    if (param.valueType === DictionaryColumnTypes.DATE) {
        return <FloatingDateInput 
            value={DateUtil.parseDate(param.value)} 
            onChange={param.onDateChange} 
            name={param.name}
            label={param.label}
            id={param.id}
            required={param.required}
            fullWidth={param.fullWidth}
            className={param.className}
            disabled={param.disabled}
            autoComplete={param.autoComplete}
            center={param.center}
            error={param.error}
            />;
        }
    if (param.valueType === DictionaryColumnTypes.NUMBER) {
        return (
            <FloatingInput
                type="number"
                fullWidth={param.fullWidth}
                className={param.className}
                disabled={param.disabled}
                label={param.label}
                onChange={param.onChange}
                value={param.value}
                id={param.id}
                required={param.required}
                autoComplete={param.autoComplete}
                name={param.name}
                center={param.center}
                error={param.error}
                />
            );
    }
    if (param.valueType === DictionaryColumnTypes.STRING) {
        return (
            <FloatingInput
                type={param.type}
                fullWidth={param.fullWidth}
                className={param.className}
                disabled={param.disabled}
                label={param.label}
                onChange={param.onChange}
                value={param.value}
                id={param.id}
                required={param.required}
                autoComplete={param.autoComplete}
                name={param.name}
                center={param.center}
                error={param.error}
            />
        );
    }

    if (param.valueType === DictionaryColumnTypes.BOOLEAN) {
        // Use Checkbox component for boolean values
        // param.onChange expects (event), Checkbox expects (checked: boolean)
        return (
            <Checkbox
                checked={!!param.value}
                onChange={checked => {
                    if (param.onChange) {
                        // Simulate event for react-hook-form compatibility
                        param.onChange({
                            target: { value: checked, name: param.name, type: 'checkbox', checked },
                            persist: () => {},
                        } as any);
                    }
                }}
                label={param.label}
                id={param.id}
                disabled={param.disabled}
                className={param.className}
            />
        );
    }

    return null;
};

export default TypedInput;
