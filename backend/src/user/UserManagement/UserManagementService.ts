/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { AvatarRef, UserI } from '@shared/interfaces/UserI';
import { UserService } from '../services/UserService';


@Injectable()
export class UserManagementService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userService: UserService,
    ) { }

    // TODO dodać optymalizacje foto - zmniejszanie rozmiaru itp
    
    public async updateAvatar(user: UserI, avatarRef: AvatarRef): Promise<UserI> {
        const userBefore = await this.userService.getUserByUid(user.uid);
        if (userBefore.avatarRef) {
            // TODO delete old avatar from storage

        }
        userBefore.avatarRef = avatarRef;
        const result = await this.userService.updateEntity(userBefore);
        this.logger.log(`Updated avatar for user: ${userBefore.userId}`);
        return result;
    }
}
