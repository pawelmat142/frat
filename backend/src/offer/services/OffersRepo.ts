import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OfferI, OfferStatuses } from "@shared/interfaces/OfferI";
import { SearchUtil } from "global/utils/SearchUtil";
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

    public getById(offerId: string): Promise<OfferEntity> {
        return this.offerRepository.findOneBy({ offerId });
    }

    public async getByIds(offerIds: string[]): Promise<OfferEntity[]> {
        return this.offerRepository.findByIds(offerIds);
    }

    public update(offer: OfferEntity): Promise<OfferEntity> {
        return this.offerRepository.save(offer);
    }

    public async delete(offerId: string): Promise<void> {
        await this.offerRepository.delete(offerId);
    }

    public async deleteAllOffers(): Promise<void> {
        await this.offerRepository.clear();
    }

    public listOffersByUid(uid: string): Promise<OfferEntity[]> {
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

    public getLatestOffers(limit: number): Promise<OfferI[]> {
        return this.getQueryBuilder()
            .where('offer.status = :status', { status: OfferStatuses.ACTIVE })
            .orderBy('offer.created_at', SearchUtil.DESC)
            .limit(limit)
            .getMany();
    }

    public incrementUniqueViewsCount(offerId: string): Promise<void> {
        return this.offerRepository.increment({ offerId }, 'uniqueViewsCount', 1)
            .then(() => {
                this.logger.log(`Incremented uniqueViewsCount for offer ${offerId}`);
            });
    }

    public incrementFavoritesCount(offerId: string): Promise<void> {
        return this.offerRepository.increment({ offerId }, 'favoritesCount', 1)
            .then(() => {
                this.logger.log(`Incremented favoritesCount for offer ${offerId}`);
            });
    }

    public decrementFavoritesCount(offerId: string): Promise<void> {
        return this.offerRepository.decrement({ offerId }, 'favoritesCount', 1)
            .then(() => {
                this.logger.log(`Decremented favoritesCount for offer ${offerId}`);
            });
    }

    public async generateNextOfferId(): Promise<string> {
        // Generate UUID v4 for collision-free ID without database interaction
        const { v4: uuidv4 } = await import('uuid');
        return uuidv4();
    }
}