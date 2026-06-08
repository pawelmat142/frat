import React, { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { DictionaryService } from "global/services/DictionaryService";
import { FloatingInputModes, SelectorItem } from "global/interface/controls.interface";
import SkeletonControl from "global/components/controls/SkeletonControl";
import SelectorItems from "global/components/selector/SelectorItems";
import { useDebouncedValue } from "global/utils/useDebouncedValue";
import FloatingInput from "global/components/controls/FloatingInput";
import { Close, Search } from "@mui/icons-material";

const MIN_QUERY_LENGTH = 1;

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepCertificates: React.FC<Props> = ({ formRef }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedQuery = useDebouncedValue(freeTextInput, 500);

    const isSearchMode = debouncedQuery.length >= MIN_QUERY_LENGTH;

    useEffect(() => {
        const initDictionary = async () => {
            if (dictionary) {
                return
            }
            setLoading(true);

            try {
                const dic = await DictionaryService.getDictionary("CERTIFICATES");
                setDictionary(dic);
            } catch (error) {
                console.error("Error fetching dictionary:", error);
            } finally {
                setLoading(false);
            }
        }
        initDictionary();
    }, [])

    const dictionaryItems: SelectorItem<string>[] = dictionary?.elements.map(element => {
        const translationKey = `dictionary.${dictionary.code}.NAME.${element.code}`;
        const translatedLabel = t(translationKey);
        const capitalizedLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
        return {
            label: capitalizedLabel,
            value: String(element.code),
            src: element.values.SRC,
        };
    }) ?? [];

    const selectedCertificates: string[] = formRef.watch('certificates.certificates') || [];

    // Get MAIN group element codes
    const mainGroup = dictionary?.groups?.find(group => group.code === 'MAIN');
    const mainCodes = new Set((mainGroup?.elementCodes || []).map(code => String(code)))

    const query = debouncedQuery.toLowerCase();

    const items = useMemo(() => dictionaryItems.filter(item => {
        if (selectedCertificates.includes(item.value)) {
            return true; // Always show selected items
        }
        if (isSearchMode && query.length >= MIN_QUERY_LENGTH) {
            return item.label.toLowerCase().includes(query)
        }
    }), [debouncedQuery, dictionary]);

    const mainItems = dictionaryItems.filter(item => mainCodes.has(item.value));

    return (
        <>
            {loading ? (
                <SkeletonControl></SkeletonControl>
            ) : (
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
                        onIconClick={isSearchMode ? (e) => {
                            e.preventDefault();
                            setFreeTextInput('')
                        } : undefined}
                    />

                    {!!items.length && (
                        <SelectorItems
                            items={items}
                            selectedValues={selectedCertificates}
                            multiSelect
                            automatedMode
                            translateItems
                            emitAllSelectedValues
                            onSelectMulti={(items) => formRef.setValue('certificates.certificates', items)}
                            onClean={() => formRef.setValue('certificates.certificates', [])}
                        ></SelectorItems>
                    )}

                    <h3 className="form-subheader mt-5">
                        {t("employeeProfile.form.certificates.main")}
                    </h3>

                    <SelectorItems
                        items={mainItems}
                        selectedValues={selectedCertificates}
                        multiSelect
                        automatedMode
                        translateItems
                        emitAllSelectedValues
                        onSelectMulti={(items) => formRef.setValue('certificates.certificates', items)}
                        onClean={() => formRef.setValue('certificates.certificates', [])}
                    ></SelectorItems>
                </>
            )}
        </>
    );
};

export default WorkerFormStepCertificates;
