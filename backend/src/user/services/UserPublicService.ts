/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from './UserRepo';
import { UserI } from '@shared/interfaces/UserI';


@Injectable()
export class UserPublicService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userRepo: UserRepo,
    ) { }

    public fetchUser(uid: string): Promise<UserI> {
        return this.userRepo.getActiveUserByUid(uid);
    }
}
