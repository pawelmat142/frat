import { httpClient } from "global/services/http";
import { FileRef, UserI } from "@shared/interfaces/UserI";

export const UserManagementService = {

	updateAvatar(avatarRef: FileRef): Promise<UserI> {
		return httpClient.put(`/user-management/avatar`, avatarRef);
	},

	deleteAccount(): Promise<boolean> {
		return httpClient.delete(`/user-management/delete-account`);
	}

};
