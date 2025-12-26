/** Created by Pawel Malek **/
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AvatarRef, UserI } from '@shared/interfaces/UserI';
import { UserService } from '../services/UserService';
import { CloudinaryService } from 'user/UserManagement/CloudinaryService';
import { Subscription } from 'rxjs';


@Injectable()
export class UserManagementService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(this.constructor.name);

    private readonly subscription = new Subscription();

    constructor(
        private readonly userService: UserService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    onModuleInit() {
        this.startSubscription();
    }

    onModuleDestroy() {
        this.subscription.unsubscribe();
    }

    public async updateAvatar(user: UserI, avatarRef: AvatarRef): Promise<UserI> {
        const userBefore = await this.userService.getUserByUid(user.uid);

        // Delete old avatar from Cloudinary if exists
        if (userBefore.avatarRef?.publicId) {
            await this.cloudinaryService.deleteImage(userBefore.avatarRef.publicId);
        }

        userBefore.avatarRef = avatarRef;
        const result = await this.userService.updateEntity(userBefore);
        this.logger.log(`Updated avatar for user: ${userBefore.userId}`);
        return result;
    }

    public async deleteAccount(user: UserI): Promise<boolean> {
        await this.userService.deleteUser(user.uid);
        return true;
    }

    private startSubscription() {
        this.subscription.add(
            this.userService.userDeletedEvent.subscribe(async (user) => {
                if (user) {
                    await this.cloudinaryService.deleteAllAssetsForUid(user.uid);
                }
            })
        );
    }


}
