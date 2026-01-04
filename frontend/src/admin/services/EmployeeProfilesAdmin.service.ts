import { WorkerI, WorkerStatus } from '@shared/interfaces/WorkerProfileI';
import { httpClient } from 'global/services/http';

export const EmployeeProfilesAdminService = {

	listProfiles(): Promise<WorkerI[]> {
		return httpClient.get<WorkerI[]>(`/employee-profile/admin/list`);
	},

	deleteProfile(id: number): Promise<void> {
		return httpClient.delete<void>(`/employee-profile/admin/${id}`);
	},

	activation(id: number, status: WorkerStatus): Promise<WorkerI> {
		return httpClient.put<WorkerI>(`/employee-profile/admin/${id}/activation/${status}`);
	},

	deleteAllProfiles(): Promise<void> {
		return httpClient.delete<void>(`/employee-profile/admin`);
	},

	initialLoad(): Promise<WorkerI[]> {
		return httpClient.post<WorkerI[]>(`/employee-profile/admin/initial-load`);
	}
};