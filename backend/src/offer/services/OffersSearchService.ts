import { Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { OfferSearchFilters, OfferSearchResponse } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";

@Injectable()
export class OffersSearchService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly offersRepo: OffersRepo,
    ) { }

    async searchOffers(user: UserI, filters: OfferSearchFilters): Promise<OfferSearchResponse> {
        console.log("Searching offers with filters:", filters);
        return null
    }

}