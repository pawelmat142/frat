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

    // Get selected certificates and their dictionary definitions
    const mainGroupElementCodes = useMemo(() => {
        const mainGroup = dictionary?.groups?.find(group => group.code === 'MAIN');
        return new Set((mainGroup?.elementCodes || []).map(code => String(code)));
    }, [dictionary]);

    const topSectionItems = useMemo(() => {
        const selectedSet = new Set(selectedCertificates);

        if (debouncedQuery.length < MIN_QUERY_LENGTH) {
            return dictionaryItems.filter(item => selectedSet.has(item.value));
        }

        const query = debouncedQuery.toLowerCase();
        return dictionaryItems.filter(item => selectedSet.has(item.value) || item.label.toLowerCase().includes(query));
    }, [debouncedQuery, dictionaryItems, selectedCertificates]);

    const mainSectionItems = useMemo(() => {
        const selectedSet = new Set(selectedCertificates);
        const topSectionCodes = new Set(topSectionItems.map(item => item.value));

        return dictionaryItems.filter(
            item => mainGroupElementCodes.has(item.value) && !selectedSet.has(item.value) && !topSectionCodes.has(item.value),
        );
    }, [dictionaryItems, mainGroupElementCodes, selectedCertificates, topSectionItems]);

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

                    <SelectorItems
                        items={topSectionItems}
                        selectedValues={selectedCertificates}
                        multiSelect
                        automatedMode
                        translateItems
                        emitAllSelectedValues
                        onSelectMulti={(items) => formRef.setValue('certificates.certificates', items)}
                        onClean={() => formRef.setValue('certificates.certificates', [])}
                    ></SelectorItems>

                    <h3 className="form-subheader mt-5">
                        {t("employeeProfile.form.certificates.main")}
                    </h3>

                    <SelectorItems
                        items={mainSectionItems}
                        selectedValues={selectedCertificates}
                        multiSelect
                        automatedMode
                        translateItems
                        emitAllSelectedValues
                        onSelectMulti={(items) => formRef.setValue('certificates.certificates', items)}
                    ></SelectorItems>
                </>
            )}
        </>
    );
};

export default WorkerFormStepCertificates;
