import { Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { CreateOfferForm, OfferI, OfferStatus, OfferStatuses } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";
import { DeepPartial } from "typeorm";
import { DictionariesPublicService } from "admin/dictionaries/services/DictionariesPublicService";
import { OfferValidator } from "@shared/validators/OfferValidator";
import { OfferEntity } from "offer/model/OfferEntity";

@Injectable()
export class OffersService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly offersRepo: OffersRepo,
        private readonly dictionariesPublicService: DictionariesPublicService,
    ) { }

    public async createOffer(user: UserI, newOffer: CreateOfferForm): Promise<OfferI> {
        await this.validateOfferForm(newOffer);

        const newEntity: DeepPartial<OfferEntity> = {
            uid: user.uid,
            status: this.prepareStatusBasedOnForm(newOffer),
            category: newOffer.STEP_ONE.category!,
            locationCountry: newOffer.STEP_ONE.locationCountry!,
            
            skillsRequired: newOffer.STEP_TWO.skillsRequired,
            skillsNiceToHave: newOffer.STEP_TWO.skillsNiceToHave,
            certificatesRequired: newOffer.STEP_TWO.certificatesRequired,
            certificatesNiceToHave: newOffer.STEP_TWO.certificatesNiceToHave,
            languagesRequired: newOffer.STEP_TWO.languagesRequired,
            languagesNiceToHave: newOffer.STEP_TWO.languagesNiceToHave,

            hourlySalaryStart: this.optionalNumber(newOffer.STEP_THREE.hourlySalaryStart),
            hourlySalaryEnd: this.optionalNumber(newOffer.STEP_THREE.hourlySalaryEnd),  
            monthlySalaryStart: this.optionalNumber(newOffer.STEP_THREE.monthlySalaryStart),
            monthlySalaryEnd: this.optionalNumber(newOffer.STEP_THREE.monthlySalaryEnd),
            currency: newOffer.STEP_THREE.currency,

            displayName: newOffer.STEP_FOUR?.displayName,
            description: newOffer.STEP_FOUR?.description,
        }

        const createdOffer = await this.offersRepo.create(newEntity);
        this.logger.log(`Offer created with ID: ${createdOffer.offerId}`);
        return createdOffer;
    }

    private optionalNumber(value: string | null | undefined): number | undefined {
        if (!value) {
            return undefined;
        }
        return Number(value);
    }

    private async validateOfferForm(form: CreateOfferForm): Promise<void> {
        await this.dictionariesPublicService.validateItemExistence(form.STEP_ONE.category, 'WORK_CATEGORY');
        await this.dictionariesPublicService.validateItemExistence(form.STEP_ONE.locationCountry, 'LANGUAGES', 'COMMUNICATION');
    
        await this.dictionariesPublicService.validateItemsExistence(form.STEP_TWO.skillsRequired, 'SKILLS');
        await this.dictionariesPublicService.validateItemsExistence(form.STEP_TWO.skillsNiceToHave, 'SKILLS');
    
        await this.dictionariesPublicService.validateItemsExistence(form.STEP_TWO.certificatesRequired, 'CERTIFICATES');
        await this.dictionariesPublicService.validateItemsExistence(form.STEP_TWO.certificatesNiceToHave, 'CERTIFICATES');

        await this.dictionariesPublicService.validateItemsExistence(form.STEP_TWO.languagesRequired, 'LANGUAGES', 'COMMUNICATION');
        await this.dictionariesPublicService.validateItemsExistence(form.STEP_TWO.languagesNiceToHave, 'LANGUAGES', 'COMMUNICATION');
    
        OfferValidator.validateSalary(form);
    }

    private prepareStatusBasedOnForm(form: CreateOfferForm): OfferStatus {
        // TODO 
        return OfferStatuses.ACTIVE;
    }
}