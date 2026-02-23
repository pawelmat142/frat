import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from 'global/components/controls/Button';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';
import Stepper from './Stepper';

type FormWizardProps<TForm extends FieldValues, TStep extends string> = {
    localStorageKey: string;
    formRef: UseFormReturn<TForm>;
    stepsOrder: TStep[];
    currentStep: TStep;
    onFinalSubmit: (validateFn: () => Promise<boolean>) => void | Promise<void>;
    children: React.ReactNode;
    onSelectStep: (step: TStep) => void;
};

function FormWizard<TForm extends FieldValues, TStep extends string = string>({
    localStorageKey,
    formRef,
    stepsOrder,
    currentStep,
    onFinalSubmit,
    children,
    onSelectStep,
}: FormWizardProps<TForm, TStep>) {

    const { t } = useTranslation();

    const saveFormToLocalStorage = React.useCallback(() => {
        try {
            const formData = formRef.getValues();
            localStorage.setItem(localStorageKey, JSON.stringify(formData));
        } catch (e) {
            console.warn('Could not save form draft', e);
        }
    }, [formRef, localStorageKey]);

    const validateCurrentStep = async (): Promise<boolean> => {
        try {
            const result = await formRef.trigger(currentStep as any);
            if (!result) {
                toast.error('Form validation failed');
            }
            return result;
        } catch (e) {
            console.error('Validation error', e);
            return false;
        }
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            saveFormToLocalStorage();
            const currentIndex = stepsOrder.indexOf(currentStep);
            if (currentIndex < stepsOrder.length - 1) {
                const step = stepsOrder[currentIndex + 1];
                onSelectStep(step);
            }
        }
    };

    const handlePrev = () => {
        saveFormToLocalStorage();
        const currentIndex = stepsOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            const step = stepsOrder[currentIndex - 1];
            onSelectStep(step);
        }
    };

    const selectStep = async (targetStep: TStep) => {
        const targetIndex = stepsOrder.indexOf(targetStep);
        const currentIndex = stepsOrder.indexOf(currentStep);
        if (targetIndex < currentIndex) {
            onSelectStep?.(targetStep);
            return;
        }
        if (targetIndex > currentIndex) {
            const ok = await validateCurrentStep();
            if (ok) {
                saveFormToLocalStorage();
                onSelectStep?.(targetStep);
            }
        }
    };

    return (
        <div className="form-view relative flex flex-col">
            <form className='flex flex-col flex-1'
                onSubmit={formRef.handleSubmit(() => { }, (errors) => {
                    console.log('Form errors', errors)
                    toast.error(t('common.sww'))
                })}
                noValidate
            >


                <div className="flex-1">

                    <div className='py-10'>
                        <Stepper stepsOrder={stepsOrder} currentStep={currentStep}></Stepper>
                    </div>

                    {children}

                </div>

                <div className="form-wizard-buttons-wrapper">
                    <div className="form-wizard-buttons">
                        <Button
                            type="button"
                            onClick={handlePrev}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.SECONDARY_TXT}
                            disabled={currentStep === stepsOrder[0]}
                            className="flex-1"
                            aria-label={t("common.previous")}
                        >{t("common.previous")}</Button>

                        {currentStep !== stepsOrder[stepsOrder.length - 1] ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                size={BtnSizes.LARGE}
                                mode={BtnModes.PRIMARY}
                                className="flex-1"
                                aria-label={t("common.next")}
                            >{t("common.next")}</Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => { onFinalSubmit(validateCurrentStep) }}
                                size={BtnSizes.LARGE}
                                mode={BtnModes.PRIMARY}
                                className="flex-1 font-bold"
                                aria-label={t("common.save")}
                            >
                                {t("common.save")}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default FormWizard;
