import { httpClient } from "global/services/http";
import { EmployeeProfileForm, EmployeeProfileFormDto, EmployeeProfileI, EmployeeProfileSearchFilters, EmployeeProfileSearchResponse } from "@shared/interfaces/EmployeeProfileI";

// Mapper to convert nested form structure to flat API structure
const mapFormToApi = (form: EmployeeProfileForm): EmployeeProfileFormDto => {
	return {
		firstName: form.step1.firstName,
		lastName: form.step1.lastName,
		// residenceCountry: form.step1.residenceCountry,
		communicationLanguages: form.step1.communicationLanguages,

		skills: form.step2.skills,
		certificates: form.step2.certificates,

		locationOption: form.step3.locationOption,
		locationCountries: form.step3.locationCountries,
		geocodedPosition: form.step3.geocodedPosition || undefined,
		locationDistanceRadius: form.step3.locationDistanceRadius,

		availabilityOption: form.step4.availabilityOption,
		availabilityDateRanges: form.step4.availabilityDateRanges
	};
};

export const EmployeeProfileService = {

	getEmployeeProfile(): Promise<EmployeeProfileI | null> {
		return httpClient.get<EmployeeProfileI>(`/employee-profile`);
	},

	getEmployeeProfileByDisplayName(displayName: string): Promise<EmployeeProfileI | null> {
		return httpClient.get<EmployeeProfileI>(`/employee-profile/${displayName}`);
	},

	createEmployeeProfile(form: EmployeeProfileForm): Promise<EmployeeProfileI> {
		const apiPayload = mapFormToApi(form);
		return httpClient.post<EmployeeProfileI>(`/employee-profile`, apiPayload);
	},

	updateEmployeeProfile(form: EmployeeProfileForm): Promise<EmployeeProfileI> {
		const apiPayload = mapFormToApi(form);
		return httpClient.put<EmployeeProfileI>(`/employee-profile`, apiPayload);
	},

	searchEmployeeProfiles(params: EmployeeProfileSearchFilters): Promise<EmployeeProfileSearchResponse> {
		return httpClient.get<EmployeeProfileSearchResponse>(`/employee-profile/search/list`, { params });
	},

	notifyProfileView(profileUid: string): Promise<void> {
		return httpClient.get<void>(`/employee-profile/notify-profile-view/${profileUid}`);
	},

	deleteProfile(): Promise<void> {
		return httpClient.delete<void>(`/employee-profile`);
	},

	activation(): Promise<EmployeeProfileI> {
		return httpClient.patch<EmployeeProfileI>(`/employee-profile/activation`);
	},

	// TODO
	notifyProfileLike(profileUid: string): Promise<string[]> {
		return httpClient.get<string[]>(`/employee-profile/notify-profile-like/${profileUid}`);
	}

};
