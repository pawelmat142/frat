import { ChangeEventHandler, forwardRef, useEffect, useState } from 'react';
import { FloatingInputModes, SelectorItem } from '../../interface/controls.interface';
import FormError from './FormError';
import FloatingLabel from './FloatingLabel';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { DictionaryService } from 'global/services/DictionaryService';
import { DictionaryElement, DictionaryI } from '@shared/interfaces/DictionaryI';
import { useTranslation } from 'react-i18next';
import { ParsedPhoneNumber } from '@shared/interfaces/EmployeeProfileI';

interface PhoneNumberFloatingInputProps {
    id?: string;
    name?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    center?: boolean;
    error?: { message?: string } | null;
    mode?: typeof FloatingInputModes[keyof typeof FloatingInputModes];
    value: ParsedPhoneNumber;
    onChange: (value: ParsedPhoneNumber) => void;
    autoComplete?: string;
}

const PhoneNumberFloatingInput = forwardRef<HTMLInputElement, PhoneNumberFloatingInputProps>(
    ({
        fullWidth = false,
        className = '',
        disabled,
        label,
        value,
        onChange,
        id,
        required,
        autoComplete,
        name,
        center,
        error,
        mode = FloatingInputModes.DEFAULT,
    }, ref) => {

        const [isFocused, setIsFocused] = useState(false);
        const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
        const bottomSheet = useBottomSheet();

        const { t } = useTranslation();
        useEffect(() => {
            const initDictionary = async () => {
                const res = await DictionaryService.getDictionary('LANGUAGES');
                setDictionary(res);
            };
            initDictionary();
        }, []);

        const getSelectedElement = (): DictionaryElement | undefined => {
            return dictionary?.elements.find(el => el.values.PHONE_PREFIX === value?.prefix);
        };

        const selectedElement = getSelectedElement();

        const MAX_PHONE_DIGITS = 15;

        const handlePhoneNumberChange: ChangeEventHandler<HTMLInputElement> = (event) => {
            if (disabled) {
                event.preventDefault();
                return;
            }
            let newPhoneNumber = event.target.value.replace(/[^0-9]/g, '');
            // Limit to max digits (E.164 standard)
            if (newPhoneNumber.length > MAX_PHONE_DIGITS) {
                newPhoneNumber = newPhoneNumber.slice(0, MAX_PHONE_DIGITS);
            }
            onChange({
                prefix: value?.prefix || '+48',
                phoneNumber: newPhoneNumber
            });
        };

        const handlePrefixSelect = (countryCode: string) => {
            const element = dictionary?.elements.find(el => el.code === countryCode);
            if (element) {
                const newPrefix = element.values.PHONE_PREFIX;
                onChange({
                    prefix: newPrefix,
                    phoneNumber: value?.phoneNumber || ''
                });
            }
        };

        const openCountrySelector = () => {
            if (disabled || !dictionary) return;

            const items: SelectorItem<string>[] = dictionary.elements.map(element => ({
                label: `${element.values.PHONE_PREFIX} (${t(element.values.COUNTRY_NAME)})`,
                value: element.code,
                src: element.values.SRC,
            }));

            console.log('Opening country selector with items:', items);
            bottomSheet.openSelector({
                items,
                selectedValues: selectedElement ? [selectedElement.code] : [],
                title: label || '',
                onSelect: (item) => {
                    console.log('Selected country code:', item);
                    handlePrefixSelect(item as string);
                },
            });
        };

        const hasValue = () => {
            return !!value?.phoneNumber || !!value?.prefix;
        };

        const isLabelFloating = isFocused || hasValue();

        let containerClass = `pp-control-bg pp-phone-input floating-input ${mode}`;
        if (fullWidth) {
            containerClass += ' w-full';
        } else {
            containerClass += ' w-fit';
        }
        if (disabled) {
            containerClass += ' opacity-50 pointer-events-none cursor-not-allowed';
        }
        if (error) {
            containerClass += ' pp-control-error';
        }

        return (
            <div className={`floating-input-wrapper ${className}${center ? ' mx-auto' : ''}`}>
                <div className="floating-input-container">
                    <div className={`pp-control pp-input-row ${containerClass}`}>
                        {/* Country selector */}
                        <div
                            className="pp-phone-country-selector"
                            onClick={openCountrySelector}
                            tabIndex={disabled ? -1 : 0}
                        >
                            <span className="pp-phone-prefix">
                                {value?.prefix || '+48'}
                            </span>
                        </div>

                        {/* Phone number input */}
                        <input
                            ref={ref}
                            id={id}
                            name={name || id}
                            type="tel"
                            value={value?.phoneNumber || ''}
                            onChange={handlePhoneNumberChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="pp-phone-number-input"
                            disabled={disabled}
                            required={required}
                            maxLength={MAX_PHONE_DIGITS}
                            autoComplete={autoComplete}
                            placeholder=" "
                        />

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
    });

PhoneNumberFloatingInput.displayName = 'PhoneNumberFloatingInput';

export default PhoneNumberFloatingInput;
