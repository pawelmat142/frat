import { EmployeeProfileI, EmployeeProfileStatus } from '@shared/interfaces/EmployeeProfileI';
import { httpClient } from 'global/services/http';

export const EmployeeProfilesAdminService = {

	listProfiles(): Promise<EmployeeProfileI[]> {
		return httpClient.get<EmployeeProfileI[]>(`/employee-profile/admin/list`);
	},

	deleteProfile(id: number): Promise<void> {
		return httpClient.delete<void>(`/employee-profile/admin/${id}`);
	},

	activation(id: number, status: EmployeeProfileStatus): Promise<EmployeeProfileI> {
		return httpClient.put<EmployeeProfileI>(`/employee-profile/admin/${id}/activation/${status}`);
	},

	deleteAllProfiles(): Promise<void> {
		return httpClient.delete<void>(`/employee-profile/admin`);
	},

	initialLoad(): Promise<EmployeeProfileI[]> {
		return httpClient.post<EmployeeProfileI[]>(`/employee-profile/admin/initial-load`);
	}
};