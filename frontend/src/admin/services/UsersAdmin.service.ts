import { UserI } from '@shared/interfaces/UserI';
import { httpClient } from 'global/services/http';

export const UsersAdminService = {
	
  	listUsers(): Promise<UserI[]> {
		return httpClient.get<UserI[]>(`/admin/users/list-users`);
	}
};