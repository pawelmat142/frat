import { CreateOfferForm } from "@shared/interfaces/OfferI";

export abstract class OfferValidator {

    public static validateSalary(form: CreateOfferForm): void {

        if (!form.STEP_THREE?.hourlySalaryStart && !form.STEP_THREE?.monthlySalaryStart) {
            // TODO
            throw new Error('offer.validation.atLeastOneSalaryRequired');
        }

        // TODO
        if (!form.STEP_THREE.currency) {
            throw new Error('offer.validation.currencyRequired');
        }

    }
}