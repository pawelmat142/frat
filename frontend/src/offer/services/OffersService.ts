import { Header } from "@shared/def/def";
import { Position } from "@shared/interfaces/MapsInterfaces";
import { OfferForm, OfferI, OfferSearchFilters, OfferSearchResponse } from "@shared/interfaces/OfferI";
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

    listUsersOffers(userId: string): Promise<OfferI[]> {
        return httpClient.get<OfferI[]>(`/offers/user/${userId}`);
    },

    activation(offerId: number): Promise<OfferI> {
        return httpClient.patch<OfferI>(`/offers/${offerId}/activation`, {});
    },

    deleteOffer(offerId: number): Promise<void> {
        return httpClient.delete<void>(`/offers/${offerId}`);
    },

    updateOffer(offerId: number, form: OfferForm): Promise<OfferI | null> {
        return httpClient.patch<OfferI>(`/offers/${offerId}`, form);
    },

    searchOffers(
        params: OfferSearchFilters,
        skipAuth: boolean = false,
        viewerLocation?: Position,
        searchSessionId?: string,
    ): Promise<OfferSearchResponse> {
        const headers: Record<string, string> = {};
        if (viewerLocation) {
            headers[Header.LAT_HEADER] = String(viewerLocation.lat);
            headers[Header.LNG_HEADER] = String(viewerLocation.lng);
        }
        if (searchSessionId) {
            headers[Header.SEARCH_SESSION] = searchSessionId;
        }
        return httpClient.get<OfferSearchResponse>(`/offers/search/list`, { params, skipAuth, headers });
    },

    notifyOfferView(offerId: number): Promise<void> {
        return httpClient.get<void>(`/offers/notify-offer-view/${offerId}`);
    },
}