import { OfferI } from '@shared/interfaces/OfferI';
import { httpClient } from 'global/services/http';

export const OffersAdminService = {

	listAdminPanel(): Promise<OfferI[]> {
		return httpClient.get<OfferI[]>(`/offer/admin/list`);
	},

	deleteOffer(id: number): Promise<void> {
		return httpClient.delete<void>(`/offer/admin/${id}`);
	},

	// TODO
	// activation(id: number, status: EmployeeProfileStatus): Promise<EmployeeProfileI> {
	// 	return httpClient.put<EmployeeProfileI>(`/employee-profile/admin/${id}/activation/${status}`);
	// },

	deleteAllOffers(): Promise<void> {
		return httpClient.delete<void>(`/offer/admin`);
	},

	initialLoad(): Promise<OfferI[]> {
		return httpClient.post<OfferI[]>(`/offer/admin/initial-load`);
	}
};