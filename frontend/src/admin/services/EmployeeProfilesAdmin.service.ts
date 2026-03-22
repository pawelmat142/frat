import { WorkerI, WorkerStatus } from '@shared/interfaces/WorkerI';
import { httpClient } from 'global/services/http';

export const EmployeeProfilesAdminService = {

	listProfiles(): Promise<WorkerI[]> {
		return httpClient.get<WorkerI[]>(`/worker/admin/list`);
	},

	deleteProfile(id: number): Promise<void> {
		return httpClient.delete<void>(`/worker/admin/${id}`);
	},

	activation(id: number, status: WorkerStatus): Promise<WorkerI> {
		return httpClient.put<WorkerI>(`/worker/admin/${id}/activation/${status}`);
	},

	deleteAllProfiles(): Promise<void> {
		return httpClient.delete<void>(`/worker/admin`);
	},

	initialLoad(): Promise<WorkerI[]> {
		return httpClient.post<WorkerI[]>(`/worker/admin/initial-load`);
	}
};