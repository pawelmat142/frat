import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from 'global/components/controls/Button';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';
import Stepper from './Stepper';
import { AnimatePresence, motion } from 'framer-motion';
import { AppConfig } from '@shared/AppConfig';

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
    const directionRef = React.useRef<1 | -1>(1);

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
                toast.error(t('validation.form.formInvalid'));
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
                directionRef.current = 1;
                const step = stepsOrder[currentIndex + 1];
                onSelectStep(step);
            }
        }
    };

    const handlePrev = () => {
        saveFormToLocalStorage();
        const currentIndex = stepsOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            directionRef.current = -1;
            const step = stepsOrder[currentIndex - 1];
            onSelectStep(step);
        }
    };

    return (
        <div className="form-view relative flex flex-col">
            <div className="sticky top-0 z-10 primary-bg py-5">
                <Stepper stepsOrder={stepsOrder} currentStep={currentStep}></Stepper>
            </div>
            <form className='flex flex-col flex-1'
                onSubmit={formRef.handleSubmit(() => { }, (errors) => {
                    console.log('Form errors', errors)
                    toast.error(t('common.sww'))
                })}
                noValidate
            >
                <div className="flex-1">

                    <AnimatePresence mode="wait" custom={directionRef.current}>
                        <motion.div
                            key={currentStep}
                            custom={directionRef.current}
                            variants={{
                                enter: (d: number) => ({ x: 80 * d, opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (d: number) => ({ x: -80 * d, opacity: 0 }),
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: AppConfig.ROUTER_ANIMATION_DURATION / 1000, ease: 'easeInOut' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>

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
