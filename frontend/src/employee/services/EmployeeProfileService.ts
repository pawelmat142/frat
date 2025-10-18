import { httpClient } from "global/services/http";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";

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

};
