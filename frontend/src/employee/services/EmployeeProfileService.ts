import { httpClient } from "global/services/http";
import { EmployeeProfileForm, EmployeeProfileI, EmployeeProfileSearchForm } from "@shared/interfaces/EmployeeProfileI";

export const EmployeeProfileService = {

	getEmployeeProfile(): Promise<EmployeeProfileI | null> {
		return httpClient.get<EmployeeProfileI>(`/employee-profile`);
	},

	createEmployeeProfile(form: EmployeeProfileForm): Promise<EmployeeProfileI> {
		return httpClient.post<EmployeeProfileI>(`/employee-profile`, form);
	},

	updateEmployeeProfile(form: EmployeeProfileForm): Promise<EmployeeProfileI> {
		return httpClient.put<EmployeeProfileI>(`/employee-profile`, form);
	},

	searchEmployeeProfiles(params: EmployeeProfileSearchForm): Promise<EmployeeProfileI[]> {
		return httpClient.get<EmployeeProfileI[]>(`/employee-profile/search`, { params });
	},

};
