import { httpClient } from "global/services/http";
import { WorkerForm, WorkerFormDto, WorkerI, WorkerSearchFilters, WorkerSearchResponse } from "@shared/interfaces/WorkerProfileI";

// Mapper to convert nested form structure to flat API structure
const mapFormToApi = (form: WorkerForm): WorkerFormDto => {
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

export const WorkerService = {

	getWorker(): Promise<WorkerI | null> {
		return httpClient.get<WorkerI>(`/worker`);
	},

	fetchWorkerByDisplayName(displayName: string): Promise<WorkerI | null> {
		return httpClient.get<WorkerI>(`/worker/${displayName}`);
	},

	createWorker(form: WorkerForm): Promise<WorkerI> {
		const apiPayload = mapFormToApi(form);
		return httpClient.post<WorkerI>(`/worker`, apiPayload);
	},

	updateWorker(form: WorkerForm): Promise<WorkerI> {
		const apiPayload = mapFormToApi(form);
		return httpClient.put<WorkerI>(`/worker`, apiPayload);
	},

	searchWorkers(params: WorkerSearchFilters): Promise<WorkerSearchResponse> {
		return httpClient.get<WorkerSearchResponse>(`/worker/search/list`, { params });
	},

	notifyWorkerView(uid: string): Promise<void> {
		return httpClient.get<void>(`/worker/notify-profile-view/${uid}`);
	},

	notifyWorkerLike(workerId: number): Promise<string[]> {
		return httpClient.get<string[]>(`/worker/notify-profile-like/${workerId}`);
	},

	deleteProfile(): Promise<void> {
		return httpClient.delete<void>(`/worker`);
	},

	activation(): Promise<WorkerI> {
		return httpClient.patch<WorkerI>(`/worker/activation`);
	},

};
