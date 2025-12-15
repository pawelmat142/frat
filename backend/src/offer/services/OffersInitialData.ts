import { OfferEntity } from "offer/model/OfferEntity";
import { DeepPartial } from "typeorm";

export const OffersInitialData = (): DeepPartial<OfferEntity>[] => {
    const result: DeepPartial<OfferEntity>[] = [
    
    ]

    return result.map((profile, idx) => {
        return profile;
    });
}
