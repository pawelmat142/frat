import React, { useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import DictionarySelector from "global/components/selector/DictionarySelector";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { DictionaryService } from "global/services/DictionaryService";
import Loading from "global/components/Loading";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import FloatingDateInput, { datepickerWithDaysConfig } from "global/components/callendar/FloatingDateInput";
import { DateUtil } from "@shared/utils/DateUtil";
import { SelectorItem } from "global/interface/controls.interface";
import SkeletonControl from "global/components/controls/SkeletonControl";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepCertificates: React.FC<Props> = ({ formRef }) => {

    const { control, formState, watch } = formRef;
    const { t } = useTranslation();
    const required = FormValidator.required(t);

    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

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

    if (loading) {
        return <SkeletonControl></SkeletonControl>
    }

    if (!dictionary) {
        return <div>{t("common.sww")}</div>
    }


    // Get selected certificates and their dictionary definitions
    const selectedCertificates: string[] = formRef.watch('certificates.certificates') || [];
    const certDictElements = dictionary?.elements || [];
    const certsWithDate = certDictElements.filter(el =>
        el.values?.VALIDITY_DATE_REQUIRED && selectedCertificates.includes(el.code)
    );

    const items: SelectorItem<string>[] = dictionary.elements.map(element => {
        const translationKey = `dictionary.${dictionary.code}.NAME.${element.code}`;
        const translatedLabel = t(translationKey);
        const capitalizedLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
        return {
            label: capitalizedLabel,
            value: String(element.code),
            src: element.values.SRC,
        };
    });


    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.certificates.title")}
            </h3>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">
                <Controller
                    name="certificates.certificates"
                    control={control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items)}
                            label={t("employeeProfile.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            error={formState.errors.certificates?.certificates}
                        />
                    )}
                />

                {certsWithDate.map(cert => (
                    <Controller
                        key={cert.code}
                        name={`certificates.certificateDates.${cert.code}`}
                        control={control}
                        rules={required}
                        render={({ field }) => {
                            return (
                                <FloatingDateInput
                                    label={`${t('employeeProfile.form.certificateValidityDate')} ${t(DictionaryUtil.getTranslationKey('CERTIFICATES', cert.code))}`}
                                    className="w-full"
                                    value={field.value ? DateUtil.parseDateFromStringLocalDate(field.value) : null}
                                    onChange={date => field.onChange(DateUtil.toLocalDateString(date) ?? null)}
                                    required
                                    error={formState.errors?.certificates?.certificateDates?.[cert.code]?.message
                                        ? { message: formState.errors.certificates.certificateDates[cert.code]!.message }
                                        : undefined}
                                    config={datepickerWithDaysConfig}
                                />
                            )
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default WorkerFormStepCertificates;
