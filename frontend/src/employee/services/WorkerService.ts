import { httpClient } from "global/services/http";
import { WorkerForm, WorkerFormDto, WorkerI, WorkerSearchFilters, WorkerSearchRequest, WorkerSearchResponse, WorkerSkills, WorkerWithCertificates } from "@shared/interfaces/WorkerI";
import { AvatarRef } from "@shared/interfaces/UserI";

// Mapper to convert nested form structure to flat API structure
const mapFormToApi = (form: WorkerForm): WorkerFormDto => {
	return {
		fullName: form.personalData.fullName,
		phoneNumber: form.personalData.phoneNumber,
		email: form.personalData.email,
		communicationLanguages: form.personalData.communicationLanguages,
		avatarRef: form.personalData.avatarRef,
		
		locationOption: form.location.locationOption,
		countryCode: form.location.countryCode || undefined,
		geocodedPosition: form.location.geocodedPosition || undefined,
		locationCountries: form.location.locationCountries,
		
		availabilityOption: form.availability.availabilityOption,
		availabilityDateRanges: form.availability.availabilityDateRanges,
		rangesOption: form.availability.rangesOption,
		startDate: form.availability.startDate || undefined,
		
		certificates: form.certificates.certificates,
		certificateDates: form.certificates.certificateDates,
		
		careerStartDate: form.career.careerStartDate,
		maxAltitude: form.career.maxAltitude,
		readyToTravel: form.career.readyToTravel,
		categories: form.career.categories,
		bio: form.career.bio,
	};
};

export const WorkerService = {

	getWorker(): Promise<WorkerWithCertificates | null> {
		return httpClient.get<WorkerWithCertificates>(`/worker`);
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

	searchWorkers(params: WorkerSearchRequest, skipAuth: boolean = false): Promise<WorkerSearchResponse> {
		return httpClient.get<WorkerSearchResponse>(`/worker/search/list`, { params, skipAuth });
	},

	notifyWorkerView(workerId: number): Promise<void> {
		return httpClient.get<void>(`/worker/notify-profile-view/${workerId}`);
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

	updateSkills(skills: WorkerSkills): Promise<WorkerI> {
		return httpClient.put<WorkerI>(`/worker/skills`, skills);
	},

	updateBio(bio: string): Promise<WorkerI> {
		return httpClient.put<WorkerI>(`/worker/bio`, { value: bio });
	},

	addImage(imageRef: AvatarRef): Promise<WorkerI> {
		return httpClient.post<WorkerI>(`/worker/images`, imageRef);
	},

	removeImage(publicId: string): Promise<WorkerI> {
		return httpClient.delete<WorkerI>(`/worker/images`, { params: { publicId } });
	},

};
