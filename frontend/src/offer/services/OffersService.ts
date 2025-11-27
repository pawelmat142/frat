import { CreateOfferForm, OfferI } from "@shared/interfaces/OfferI";
import { httpClient } from "global/services/http";

export const OffersService = {

    createOffer(form: CreateOfferForm): Promise<OfferI | null> {
        return httpClient.post<OfferI>(`/offers`, form);
    }
    
}