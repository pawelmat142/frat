import { OfferForm } from "../interfaces/OfferI";

export abstract class OfferValidator {

    public static validateSalary(form: OfferForm): void {

        if (!form.STEP_THREE?.hourlySalaryStart && !form.STEP_THREE?.monthlySalaryStart) {
            throw new Error('offer.validation.atLeastOneSalaryRequired');
        }

        if (!form.STEP_THREE.currency) {
            throw new Error('offer.validation.currencyRequired');
        }

    }
}