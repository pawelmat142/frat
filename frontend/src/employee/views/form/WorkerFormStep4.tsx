import React, { useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm } from "@shared/interfaces/WorkerProfileI";
import DictionarySelector from "global/components/selector/DictionarySelector";
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { DictionaryService } from "global/services/DictionaryService";
import Loading from "global/components/Loading";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStep4: React.FC<Props> = ({ formRef }) => {

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
        return <Loading></Loading>
    }


    // Get selected certificates and their dictionary definitions
    const selectedCertificates: string[] = formRef.watch('step4.certificates') || [];
    const certDictElements = dictionary?.elements || [];
    const certsWithDate = certDictElements.filter(el =>
        el.values?.VALIDITY_DATE_REQUIRED && selectedCertificates.includes(el.code)
    );

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.step4.title")}
            </h3>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">
                <Controller
                    name="step4.certificates"
                    control={control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items)}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={formState.errors.step4?.certificates}
                        />
                    )}
                />

                {/* Dynamic date inputs for certificates with VALIDITY_DATE_REQUIRED */}
                {certsWithDate.map(cert => (
                    <Controller
                        key={cert.code}
                        name={`step4.certificateDates.${cert.code}`}
                        control={control}
                        rules={required}
                        render={({ field }) => (
                            <DateInputViewSelector
                                label={`${t('employeeProfile.form.certificateValidityDate')} ${t(DictionaryUtil.getTranslationKey('CERTIFICATES', cert.code))}`}
                                className="w-full"
                                value={field.value}
                                onChange={date => field.onChange(date)}
                                required
                                error={formState.errors?.step4?.certificateDates?.[cert.code]?.message}
                            />
                        )}
                    />
                ))}
            </div>
        </>
    );
};

export default WorkerFormStep4;
