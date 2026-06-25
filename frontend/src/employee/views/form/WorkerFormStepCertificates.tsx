import React, { useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import { FloatingInputModes } from "global/interface/controls.interface";
import SkeletonControl from "global/components/controls/SkeletonControl";
import SelectorItems from "global/components/selector/SelectorItems";
import { useDebouncedValue } from "global/utils/useDebouncedValue";
import FloatingInput from "global/components/controls/FloatingInput";
import { Close, Search } from "@mui/icons-material";
import { useDictionary } from "global/hooks/useDictionary";

const MIN_QUERY_LENGTH = 1;

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepCertificates: React.FC<Props> = ({ formRef }) => {
    const { t } = useTranslation();

    const { loading, items: allItems, dictionary } = useDictionary('CERTIFICATES');

    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedQuery = useDebouncedValue(freeTextInput, 500);
    const isSearchMode = debouncedQuery.length >= MIN_QUERY_LENGTH;

    const selectedCertificates: string[] = formRef.watch('certificates.certificates') || [];

    // Items visible in the search panel: always show selected + anything matching the query.
    const searchItems = useMemo(() => {
        const query = debouncedQuery.toLowerCase();
        return allItems.filter(item =>
            selectedCertificates.includes(item.value) ||
            (isSearchMode && item.label.toLowerCase().includes(query))
        );
    }, [allItems, debouncedQuery, selectedCertificates, isSearchMode]);

    // Items belonging to the MAIN group – always shown below the search panel.
    const mainItems = useMemo(() => {
        const mainCodes = new Set(
            (dictionary?.groups?.find(g => g.code === 'MAIN')?.elementCodes ?? []).map(String)
        );
        return allItems.filter(item => mainCodes.has(item.value));
    }, [allItems, dictionary]);

    const handleChange = (vals: string[]) => formRef.setValue('certificates.certificates', vals);
    const handleClean = () => formRef.setValue('certificates.certificates', []);

    if (loading) return <SkeletonControl />;

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.certificates.title")}
            </h3>

            <FloatingInput
                mode={FloatingInputModes.THIN}
                name="freeText"
                value={freeTextInput}
                onChange={e => setFreeTextInput(e.target.value)}
                label={t("employeeProfile.form.freeText")}
                fullWidth
                icon={isSearchMode ? <Close /> : <Search />}
                onIconClick={isSearchMode ? e => { e.preventDefault(); setFreeTextInput(''); } : undefined}
            />

            {searchItems.length > 0 && (
                <SelectorItems
                    items={searchItems}
                    selectedValues={selectedCertificates}
                    multiSelect
                    onChangeImmediate={handleChange}
                    onClean={handleClean}
                />
            )}

            <h3 className="form-subheader mt-5">
                {t("employeeProfile.form.certificates.main")}
            </h3>

            <SelectorItems
                items={mainItems}
                selectedValues={selectedCertificates}
                multiSelect
                onChangeImmediate={handleChange}
                onClean={handleClean}
            />
        </>
    );
};

export default WorkerFormStepCertificates;
