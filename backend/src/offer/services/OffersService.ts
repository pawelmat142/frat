import { Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { CreateOfferForm, OfferI } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";

@Injectable()
export class OffersService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly offersRepo: OffersRepo,
    ) { }

    public async createOffer(user: UserI, newOffer: CreateOfferForm): Promise<OfferI> {
        // TODO preare offer entity 
        // TODO validate data
        const createdOffer = await this.offersRepo.create({});
        this.logger.log(`Offer created with ID: ${createdOffer.offerId}`);
        return createdOffer;
    }
}