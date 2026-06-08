import React, { useEffect, useMemo, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { DictionaryService } from "global/services/DictionaryService";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import FloatingDateInput, { datepickerWithDaysConfigFutureOnly } from "global/components/callendar/FloatingDateInput";
import { DateUtil } from "@shared/utils/DateUtil";
import SkeletonControl from "global/components/controls/SkeletonControl";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepCertificateDates: React.FC<Props> = ({ formRef }) => {

    const { control, formState } = formRef;
    const { t } = useTranslation();
    const required = FormValidator.required(t);

    const tomorrow = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d; }, []);

    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

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
    const certDictElements = dictionary?.elements || [];
    const certElementsByCode = useMemo(
        () => new Map(certDictElements.map(el => [String(el.code), el])),
        [certDictElements],
    );

    // Get certificates requiring validity dates
    const certificatesRequiringDates = useMemo(() => {
        return selectedCertificates
            .map(certCode => certElementsByCode.get(certCode))
            .filter((cert): cert is any => cert != null && cert.values?.VALIDITY_DATE_REQUIRED);
    }, [selectedCertificates, certElementsByCode]);

    if (loading) {
        return <SkeletonControl />;
    }

    if (certificatesRequiringDates.length === 0) {
        return null;
    }

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.certificateDates.title")}
            </h3>

            {certificatesRequiringDates.map((cert) => (
                <div key={cert.code} className="mb-4">
                    <Controller
                        name={`certificateDates.certificateDates.${cert.code}`}
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
                                    minDate={tomorrow}
                                    error={formState.errors?.certificateDates?.certificateDates?.[cert.code]?.message
                                        ? { message: formState.errors.certificateDates.certificateDates[cert.code]!.message }
                                        : undefined}
                                    config={datepickerWithDaysConfigFutureOnly}
                                />
                            )
                        }}
                    />
                </div>
            ))}
        </>
    );
};

export default WorkerFormStepCertificateDates;
