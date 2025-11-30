import { OfferForm, OfferI } from "@shared/interfaces/OfferI";
import { a } from "framer-motion/dist/types.d-Cjd591yU";
import { httpClient } from "global/services/http";

export const OffersService = {

    getOfferById(offerId: number): Promise<OfferI> {
        return httpClient.get<OfferI>(`/offers/${offerId}`);
    },

    createOffer(form: OfferForm): Promise<OfferI | null> {
        return httpClient.post<OfferI>(`/offers`, form);
    },

    listMyOffers(): Promise<OfferI[]> {
        return httpClient.get<OfferI[]>(`/offers`);
    },

    activation(offerId: number): Promise<OfferI> {
        return httpClient.patch<OfferI>(`/offers/${offerId}/activation`, {});
    }
    
}