import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OfferI } from "@shared/interfaces/OfferI";
import { OfferEntity } from "offer/model/OfferEntity";
import { DeepPartial, Repository, SelectQueryBuilder } from "typeorm";

@Injectable()
export class OffersRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(OfferEntity)
        private offerRepository: Repository<OfferEntity>,
    ) { }

    public findAll(): Promise<OfferEntity[]> {
        return this.offerRepository.find()
    }

    public getById(offerId: number): Promise<OfferEntity> {
        return this.offerRepository.findOneBy({ offerId });
    }

    public update(offer: OfferEntity): Promise<OfferEntity> {
        return this.offerRepository.save(offer);
    }

    public async delete(offerId: number): Promise<void> {
        await this.offerRepository.delete(offerId);
    }

    public async deleteAllOffers(): Promise<void> {
        await this.offerRepository.clear();
    }

    public listOffersByUser(uid: string): Promise<OfferEntity[]> {
        return this.offerRepository.find({ where: { uid } });
    }

    public async create(newOffer: DeepPartial<OfferEntity>): Promise<OfferEntity> {
        const offer = this.offerRepository.create(newOffer);
        const savedOffer = await this.offerRepository.save(offer);
        this.logger.log(`Created new offer: ${savedOffer.offerId}`);
        return savedOffer;
    }

    public getQueryBuilder(): SelectQueryBuilder<OfferEntity> {
        return this.offerRepository.createQueryBuilder('offer');
    }

    public async initialLoad(offers: OfferI[]): Promise<void> {
        await this.offerRepository.save(offers);
    }

}