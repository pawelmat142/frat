import { CreateOfferForm, OFFER_STEPS_ORDER, OfferFormStep, OfferFormSteps } from "@shared/interfaces/OfferI";
import { createContext, useContext } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = 'offerFormDraft';

const OfferFormContext = createContext<OfferFormProps | undefined>(undefined);

const defaultNewForm = (): CreateOfferForm => ({
    currentStep: OfferFormSteps.STEP_ONE,
    STEP_ONE: {
        type: null,
        locationCountry: null
    }
})

const saveFormToLocalStorage = (form: CreateOfferForm) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
}

export const useOfferForm = () => {
    const ctx = useContext(OfferFormContext);
    if (!ctx) throw new Error("useOfferForm must be used within OfferFormProvider");
    return ctx;
}

export interface OfferFormProps {
    form: CreateOfferForm;
    formCtx: UseFormReturn<CreateOfferForm>;
    nextStep: () => Promise<void>;
    prevStep: () => void;
    selectStep: (targetStep: OfferFormStep) => Promise<void>;
}

const OfferFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { t } = useTranslation();
    const formCtx = useForm<CreateOfferForm>({ defaultValues: defaultNewForm() });
    const form = formCtx.watch();

    console.log("FORM: ", form);

    const validateStep = async (step: OfferFormStep): Promise<boolean> => {
        const result = await formCtx.trigger(step);
        if (!result) {
            toast.error(t("employeeProfile.form.validationError"));
        }
        return result;
    }

    const validateCurrentStep = async (): Promise<boolean> => {
        return validateStep(form.currentStep);
    }

    const nextStep = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            saveFormToLocalStorage(form);
            const currentIndex = OFFER_STEPS_ORDER.indexOf(form.currentStep);
            if (currentIndex < OFFER_STEPS_ORDER.length - 1) {
                setCurrentStep(OFFER_STEPS_ORDER[currentIndex + 1]);
            }
        }
    };

    const prevStep = () => {
        saveFormToLocalStorage(form);
        const currentIndex = OFFER_STEPS_ORDER.indexOf(form.currentStep);
        if (currentIndex > 0) {
            setCurrentStep(OFFER_STEPS_ORDER[currentIndex - 1]);
        }
    };

    const selectStep = async (targetStep: OfferFormStep) => {
        const targetIndex = OFFER_STEPS_ORDER.indexOf(targetStep);
        const currentIndex = OFFER_STEPS_ORDER.indexOf(form.currentStep);
          if (targetIndex < currentIndex) {
            // Going back - no validation needed
            setCurrentStep(targetStep);
        } else if (targetIndex > currentIndex) {
            // Going forward - validate current step
            const isValid = await validateCurrentStep();
            if (isValid) {
                saveFormToLocalStorage(form);
                setCurrentStep(targetStep);
            }
        }
    }

    const setCurrentStep = (step: OfferFormStep) => {
        formCtx.setValue("currentStep", step);
    }

    return (
        <OfferFormContext.Provider value={{
            form,
            formCtx,
            nextStep,
            prevStep,
            selectStep
        }}>{children}</OfferFormContext.Provider>
    );
};

export default OfferFormProvider;