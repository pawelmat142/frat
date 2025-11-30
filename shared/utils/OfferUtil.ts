import { OfferForm, OfferFormSteps, OfferI } from "@shared/interfaces/OfferI";
import { DateRange, Position } from "@shared/interfaces/EmployeeProfileI";
import { PointUtil } from "@shared/utils/PointUtil";

export abstract class OfferUtil {
    public static convertToForm(offer: OfferI): OfferForm {
        const position: Position | null = offer.point ? PointUtil.fromGeoPoint(offer.point, offer.displayAddress) : null;
        const dateRange: DateRange | null = {
            start: offer.startDate ?? null,
            end: offer.endDate ?? null,
        };

        return {
            currentStep: OfferFormSteps.STEP_ONE,
            STEP_ONE: {
                category: offer.category ?? null,
                locationCountry: offer.locationCountry ?? null,
                displayAddress: offer.displayAddress ?? null,
                position: position,
                dateRange: dateRange,
                availableSlots: offer.availableSlots ?? null,
            },
            STEP_TWO: {
                skillsRequired: offer.skillsRequired,
                skillsNiceToHave: offer.skillsNiceToHave,
                certificatesRequired: offer.certificatesRequired,
                certificatesNiceToHave: offer.certificatesNiceToHave,
                languagesRequired: offer.languagesRequired,
                languagesNiceToHave: offer.languagesNiceToHave,
            },
            STEP_THREE: {
                monthlySalaryStart: offer.monthlySalaryStart ? String(offer.monthlySalaryStart) : undefined,
                monthlySalaryEnd: offer.monthlySalaryEnd ? String(offer.monthlySalaryEnd) : undefined,
                hourlySalaryStart: offer.hourlySalaryStart ? String(offer.hourlySalaryStart) : undefined,
                hourlySalaryEnd: offer.hourlySalaryEnd ? String(offer.hourlySalaryEnd) : undefined,
                currency: offer.currency ?? null,
            },
            STEP_FOUR: {
                displayName: offer.displayName ?? null,
                description: offer.description ?? null,
            }
        };
    }
}