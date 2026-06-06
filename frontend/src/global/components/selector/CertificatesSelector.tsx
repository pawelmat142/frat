import { Controller, UseFormReturn } from "react-hook-form";
import DictionarySelector from "./DictionarySelector";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { Category } from "@shared/interfaces/CertificateI";
import { DictionaryI } from "@shared/interfaces/DictionaryI";

interface Props {
    form: UseFormReturn;
}

const CertificatesSelector: React.FC<Props> = ({ form }) => {

    const  { t } = useTranslation();

    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const prevCategoryRef = useRef<Category | null>(null);

    const category: Category | null = form.watch('categories')?.[0];

    useEffect(() => {
        const prev = prevCategoryRef.current;
        if (category && prev && category !== prev) {
            const defaultElementsGroupCode = `${category}_DEFAULT`;
            const defaultElementCodes = dictionary?.groups.find(group => group.code === defaultElementsGroupCode)?.elementCodes || [];
            form.setValue('certificates', defaultElementCodes);
        }

        prevCategoryRef.current = category;

    }, [category, dictionary]);
 
    return (
        <Controller
            name="certificates"
            control={form.control}
            render={({ field }) => (
                <DictionarySelector
                    type='multi'
                    className="w-full mt-3"
                    valueInput={field.value}
                    onSelectMulti={items => {
                        field.onChange(items);
                    }}
                    label={t("employeeProfile.certificates")}
                    code="CERTIFICATES"
                    groupCode={category ?? undefined}
                    fullWidth
                    onDictionaryChange={setDictionary}
                />
            )}
        />
    );
}

export default CertificatesSelector;
