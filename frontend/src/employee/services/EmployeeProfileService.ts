import { httpClient } from "global/services/http";
import { EmployeeProfileForm, EmployeeProfileFormDto, EmployeeProfileI, EmployeeProfileSearchFilters, EmployeeProfileSearchResponse } from "@shared/interfaces/EmployeeProfileI";

// Mapper to convert nested form structure to flat API structure
const mapFormToApi = (form: EmployeeProfileForm): EmployeeProfileFormDto => {
	return {
		fullName: form.step1.fullName,
		phoneNumber: form.step1.phoneNumber,
		email: form.step1.email,
		communicationLanguages: form.step1.communicationLanguages,
		avatarRef: form.step1.avatarRef,
		bio: form.step1.bio,

		locationOption: form.step2.locationOption,
		countryCode: form.step2.countryCode,
		geocodedPosition: form.step2.geocodedPosition || undefined,
		locationCountries: form.step2.locationCountries,

		availabilityOption: form.step3.availabilityOption,
		availabilityDateRanges: form.step3.availabilityDateRanges,
		rangesOption: form.step3.rangesOption,
		startDate: form.step3.startDate || undefined,

		experience: form.step4.experience,
		certificates: form.step4.certificates,
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

	notifyProfileLike(employeeProfileId: number): Promise<string[]> {
		return httpClient.get<string[]>(`/employee-profile/notify-profile-like/${employeeProfileId}`);
	},

	deleteProfile(): Promise<void> {
		return httpClient.delete<void>(`/employee-profile`);
	},

	activation(): Promise<EmployeeProfileI> {
		return httpClient.patch<EmployeeProfileI>(`/employee-profile/activation`);
	},

};
