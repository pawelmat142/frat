import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OfferEntity } from "offer/model/OfferEntity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class OffersRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(OfferEntity)
        private offerRepository: Repository<OfferEntity>,
    ) { }

    public async listOffersByUser(uid: string): Promise<OfferEntity[]> {
        return this.offerRepository.find({ where: { uid } });
    }

    public async create(newOffer: DeepPartial<OfferEntity>): Promise<OfferEntity> {
        const offer = this.offerRepository.create(newOffer);
        const savedOffer = await this.offerRepository.save(offer);
        this.logger.log(`Created new offer: ${savedOffer.offerId}`);
        return savedOffer;
    }

}