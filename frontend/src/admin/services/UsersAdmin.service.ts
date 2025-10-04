import { UserI } from '@shared/interfaces/UserI';
import { httpClient } from 'global/services/http';

export const UsersAdminService = {
	
  	listUsers(): Promise<UserI[]> {
		return httpClient.get<UserI[]>(`/admin/users/list-users`);
	},

	deleteUser(uid: string): Promise<void> {
		return httpClient.delete<void>(`/admin/users/delete-user/${uid}`);
	}
};