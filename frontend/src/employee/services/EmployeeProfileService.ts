import { httpClient } from "global/services/http";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";

export const EmployeeProfileService = {

	createEmployeeProfile(form: EmployeeProfileForm): Promise<EmployeeProfileI> {
		return httpClient.post<EmployeeProfileI>(`/employee-profile`, form);
	},

};
