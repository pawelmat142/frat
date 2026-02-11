/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from './UserRepo';
import { UserI, UserSearchResponse } from '@shared/interfaces/UserI';


@Injectable()
export class UserPublicService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userRepo: UserRepo,
    ) { }

    public fetchUser(uid: string): Promise<UserI> {
        return this.userRepo.getActiveUserByUid(uid);
    }

    public async searchUsers(query: string, skip: number, limit: number): Promise<UserSearchResponse> {
        const { users, count } = await this.userRepo.searchUsers(query, skip, limit);
        return {
            users,
            count,
        };
    }

    public fetchUsers(uids: string[]): Promise<UserI[]> {
        return this.userRepo.getUsersByUids(uids);
    }
}
