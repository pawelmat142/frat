import { EmployeeProfileI } from '@shared/interfaces/EmployeeProfileI';
import { httpClient } from 'global/services/http';

export const EmployeeProfilesAdminService = {

	listProfiles(): Promise<EmployeeProfileI[]> {
		return httpClient.get<EmployeeProfileI[]>(`/employee-profile/admin/list`);
	},
};