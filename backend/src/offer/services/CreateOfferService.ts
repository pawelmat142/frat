import { Injectable, Logger } from "@nestjs/common";
import { OfferForm, OfferStatus, OfferStatuses } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";
import { DeepPartial } from "typeorm";
import { DictionariesPublicService } from "admin/dictionaries/services/DictionariesPublicService";
import { OfferEntity } from "offer/model/OfferEntity";
import { PositionUtil } from "@shared/utils/PositionUtil";

@Injectable()
export class CreateOfferService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly dictionariesPublicService: DictionariesPublicService,
    ) { }

    public async updateOffer(existingOffer: OfferEntity, updatedOffer: OfferForm): Promise<OfferEntity> {

        // Merge into the existing entity to preserve required fields like offerId, uid, status, createdAt
        const updatedEntity: OfferEntity = {
            ...existingOffer,
            status: this.prepareStatus(updatedOffer),

            category: updatedOffer.STEP_ONE.category!,
            startDate: new Date(updatedOffer.STEP_ONE.startDate),
            languagesRequired: updatedOffer.STEP_ONE.communicationLanguages,

            locationCountry: updatedOffer.STEP_TWO.locationCountry!,
            point: PositionUtil.toGeoPoint(updatedOffer.STEP_TWO.geocodedPosition) || existingOffer.point,
            displayAddress: updatedOffer.STEP_TWO.geocodedPosition.fullAddress,

            displayName: updatedOffer.STEP_THREE.displayName,
            salary: updatedOffer.STEP_THREE.salary,
            currency: updatedOffer.STEP_THREE.currency,
            description: updatedOffer.STEP_THREE?.description,
        };

        return updatedEntity;
    }

    public async createOffer(user: UserI, newOffer: OfferForm): Promise<DeepPartial<OfferEntity>> {

        const newEntity: DeepPartial<OfferEntity> = {
            uid: user.uid,
            status: this.prepareStatus(newOffer),

            category: newOffer.STEP_ONE.category!,
            startDate: new Date(newOffer.STEP_ONE.startDate),
            languagesRequired: newOffer.STEP_ONE.communicationLanguages,
            phoneNumber: newOffer.STEP_ONE.phoneNumber,

            locationCountry: newOffer.STEP_TWO.locationCountry!,
            point: PositionUtil.toGeoPoint(newOffer.STEP_TWO.geocodedPosition),
            displayAddress: newOffer.STEP_TWO.geocodedPosition.fullAddress,

            displayName: newOffer.STEP_THREE.displayName,
            salary: newOffer.STEP_THREE.salary,
            currency: newOffer.STEP_THREE.currency,
            description: newOffer.STEP_THREE?.description,
        }

        return newEntity;
    }

    private prepareStatus(form: OfferForm): OfferStatus {
        // TODO 
        return OfferStatuses.ACTIVE;
    }
}