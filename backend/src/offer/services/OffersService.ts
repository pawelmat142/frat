import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { OfferForm, OfferI, OfferStatuses } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";
import { CreateOfferService } from "./CreateOfferService";
import { Util } from "@shared/utils/util";
import { ToastException } from "global/exceptions/ToastException";

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

    public async activation(user: UserI, offerId: number): Promise<OfferI> {
        const offer = await this.offersRepo.getById(offerId);
        if (offer.uid !== user.uid) {
            throw new ForbiddenException()
        }
        offer.status = OfferStatuses.ACTIVE === offer.status ? OfferStatuses.INACTIVE : OfferStatuses.ACTIVE;
        const result = await this.offersRepo.update(offer);
        this.logger.log(`Offer ${offer.offerId} status changed to ${offer.status} by user ${user.uid}`);
        return result;
    }

    public async deleteOffer(user: UserI, offerId: number): Promise<void> {
        const offer = await this.offersRepo.getById(offerId);
        if (!offer) {
            throw new ToastException('validation.notFound', this);
        }
        if (offer.uid !== user.uid && !Util.isAdmin(user)) {
            throw new ForbiddenException()
        }
        await this.offersRepo.delete(offerId);
        this.logger.log(`Offer ${offer.offerId} deleted by user ${user.uid}`);
    }

    public async createOffer(user: UserI, newOffer: OfferForm): Promise<OfferI> {
        const newEntity = await this.createOfferService.createOffer(user, newOffer);
        const createdOffer = await this.offersRepo.create(newEntity);
        this.logger.log(`Offer created with ID: ${createdOffer.offerId}`);
        return createdOffer;
    }
}