import { httpClient } from "global/services/http";
import { UserI } from "@shared/interfaces/UserI";

export const UserPublicService = {

	async fetchUser(uid: string): Promise<UserI> {
		return httpClient.get(`/user/${uid}`, { skipAuth: true });
	},

};
