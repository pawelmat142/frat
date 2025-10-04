import { InputInterface } from '../../interface/controls.interface';
import Input from './Input';
import DateInput from './DateInput';
import { Util } from '@shared/utils/util';
import { DictionaryColumnTypes } from '@shared/interfaces/DictionaryI';

const TypedInput: React.FC<InputInterface> = (param) => {
    // Przekazujemy wszystkie propsy do Input

    if (param.valueType === DictionaryColumnTypes.DATE) {
        return <DateInput 
            value={Util.parseDate(param.value)} 
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
        />;
    }
    if (param.valueType === DictionaryColumnTypes.NUMBER) {
        return (
            <Input
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
            />
        );
    }
    if (param.valueType === DictionaryColumnTypes.STRING) {
        return (
            <Input
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
            />
        );
    }
    return null;
};

export default TypedInput;
