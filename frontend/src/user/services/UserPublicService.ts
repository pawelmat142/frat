import { httpClient } from "global/services/http";
import { UserI } from "@shared/interfaces/UserI";

export const UserPublicService = {

	fetchUser(uid: string): Promise<UserI> {
		return httpClient.get(`/user/${uid}`, { skipAuth: true });
	},

	fetchUsers(uids: string[]): Promise<UserI[]> {
		return httpClient.post(`/user/batch`, { uids }, { skipAuth: true });
	}

};
