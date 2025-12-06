import React from "react";
import FloatingSelector from "global/components/selector/FloatingSelector";
import { SelectorItem } from "global/interface/controls.interface";
import { Currencies, Currency } from "@shared/interfaces/OfferI";
import { Controller, Control, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface CurrencySelectorProps {
    control?: Control<any>;
    error?: FieldError;
    value?: Currency | null;
    required?: boolean;
    className?: string;
    onChange?: (value: Currency) => void;
}

const currencyItems: SelectorItem<string>[] = Object.keys(Currencies).map((curency: string) => ({
    value: curency,
    label: curency
}))

const getCurrencyValue = (fieldValue?: Currency | null) => {
    if (!fieldValue) return null;
    const result = currencyItems.find((item: SelectorItem<string>) => item.value === fieldValue) || null;
    return result;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
    control,
    error,
    value,
    required = false,
    className,
    onChange
}) => {
    const { t } = useTranslation();

    // If control is provided, use react-hook-form Controller
    if (control) {
        return (
            <Controller
                name="STEP_THREE.currency"
                control={control}
                rules={required ? { required: t("offer.validation.required") } : undefined}
                render={({ field }) => (
                    <FloatingSelector
                        className={className}
                        {...field}
                        value={getCurrencyValue(field.value)}
                        label={t("offer.currency")}
                        fullWidth
                        required={required}
                        error={error}
                        items={currencyItems}
                        onSelect={(value) => field.onChange(value)}
                    />
                )}
            />
        );
    }

    // Otherwise, render as a controlled component
    return (
        <FloatingSelector
            className={className}
            value={getCurrencyValue(value)}
            label={t("offer.currency")}
            fullWidth
            required={required}
            error={error}
            items={currencyItems}
            onSelect={(value) => onChange && onChange(value as Currency)}
        />
    );
};

export default CurrencySelector;
