import { httpClient } from "global/services/http";
import { AvatarRef, UserI } from "@shared/interfaces/UserI";

export const UserManagementService = {

	updateAvatar(avatarRef: AvatarRef): Promise<UserI> {
		return httpClient.put(`/user-management/avatar`, avatarRef);
	},

};
