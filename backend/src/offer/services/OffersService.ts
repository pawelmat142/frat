import { Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { OfferForm, OfferI } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";
import { CreateOfferService } from "./CreateOfferService";

@Injectable()
export class OffersService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly offersRepo: OffersRepo,
        private readonly createOfferService: CreateOfferService,
    ) { }

    public getOfferById(offerId: number): Promise<OfferI> {
        return this.offersRepo.getById(offerId);
    }

    public listOffersByUser(user: UserI): Promise<OfferI[]> {
        return this.offersRepo.listOffersByUser(user.uid);
    }

    public async createOffer(user: UserI, newOffer: OfferForm): Promise<OfferI> {
        const newEntity = await this.createOfferService.createOffer(user, newOffer);
        const createdOffer = await this.offersRepo.create(newEntity);
        this.logger.log(`Offer created with ID: ${createdOffer.offerId}`);
        return createdOffer;
    }
}