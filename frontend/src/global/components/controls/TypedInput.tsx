import { InputInterface } from '../../interface/controls.interface';
import Input from './Input';
import DateInput from './DateInput';
import { DictionaryColumnTypes } from '@shared/interfaces/DictionaryI';
import { DateUtil } from '@shared/utils/DateUtil';

const TypedInput: React.FC<InputInterface> = (param) => {

    if (param.valueType === DictionaryColumnTypes.DATE) {
        return <DateInput 
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
                error={param.error}
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
                error={param.error}
            />
        );
    }
    return null;
};

export default TypedInput;
