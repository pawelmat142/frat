import React, { useMemo, useState } from "react";
import { FieldPath, FieldValues, PathValue, UseFormReturn } from "react-hook-form";
import { Close, Search } from "@mui/icons-material";
import FloatingInput from "global/components/controls/FloatingInput";
import SkeletonControl from "global/components/controls/SkeletonControl";
import { FloatingInputModes } from "global/interface/controls.interface";
import { useDictionary } from "global/hooks/useDictionary";
import { useDebouncedValue } from "global/utils/useDebouncedValue";
import SelectorItems from "./SelectorItems";
import { useTranslation } from "react-i18next";

const MIN_QUERY_LENGTH = 1;

interface Props<TForm extends FieldValues> {
    formRef: UseFormReturn<TForm>;
    fieldName: FieldPath<TForm>;
}

const CertificateSelector = <TForm extends FieldValues>({
    formRef,
    fieldName,
}: Props<TForm>) => {
    const { loading, items: allItems, dictionary } = useDictionary('CERTIFICATES');
    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedQuery = useDebouncedValue(freeTextInput, 500);
    const isSearchMode = debouncedQuery.length >= MIN_QUERY_LENGTH;
    const selectedCertificates = (formRef.watch(fieldName) as string[] | undefined) ?? [];

    const searchItems = useMemo(() => {
        const query = debouncedQuery.toLowerCase();
        return allItems.filter(item =>
            selectedCertificates.includes(item.value) ||
            (isSearchMode && item.label.toLowerCase().includes(query))
        );
    }, [allItems, debouncedQuery, selectedCertificates, isSearchMode]);

    const mainItems = useMemo(() => {
        const mainCodes = new Set(
            (dictionary?.groups?.find(group => group.code === 'MAIN')?.elementCodes ?? []).map(String)
        );
        return allItems.filter(item => mainCodes.has(item.value));
    }, [allItems, dictionary]);

    const displayedItems = mainItems.length > 0 ? mainItems : allItems;
    const handleChange = (values: string[]) => {
        formRef.setValue(fieldName, values as PathValue<TForm, FieldPath<TForm>>);
    };

    if (loading) return <SkeletonControl />;

    return (
        <>
            <div className="pb-2">
                <FloatingInput
                    mode={FloatingInputModes.THIN}
                    name="certificateSearch"
                    value={freeTextInput}
                    onChange={event => setFreeTextInput(event.target.value)}
                    label={t("offer.form.STEP_FOUR.searchLabel")}
                    fullWidth
                    icon={isSearchMode ? <Close /> : <Search />}
                    onIconClick={isSearchMode ? event => { event.preventDefault(); setFreeTextInput(''); } : undefined}
                />
            </div>

            {searchItems.length > 0 && (
                <SelectorItems
                    items={searchItems}
                    selectedValues={selectedCertificates}
                    multiSelect
                    onChangeImmediate={handleChange}
                    onClean={() => handleChange([])}
                    highlightQuery={debouncedQuery}
                />
            )}

            {mainItems.length && (
                <h3 className="form-subheader mt-10">{t("employeeProfile.form.certificates.main")}</h3>
            )}
            <SelectorItems
                items={displayedItems}
                selectedValues={selectedCertificates}
                multiSelect
                onChangeImmediate={handleChange}
                onClean={() => handleChange([])}
            />
        </>
    );
};

export default CertificateSelector;