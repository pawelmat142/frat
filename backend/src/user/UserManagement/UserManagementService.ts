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

    /**
     * Central method for updating user avatar.
     * - Deletes old avatar assets from Cloudinary (with uid + user-avatar tags)
     * - Updates User entity (DB trigger syncs to Worker automatically)
     */
    public async updateUserAvatar(user: UserI, newAvatarRef: AvatarRef): Promise<UserI> {
        return this.performUpdateUserAvatar(user, newAvatarRef);
    }

    public async deleteAccount(user: UserI): Promise<boolean> {
        await this.userService.deleteUser(user.uid);
        return true;
    }

    private startSubscription() {
        // Handle user deletion - cleanup all Cloudinary assets
        this.subscription.add(
            this.userService.userDeletedEvent.subscribe(async (user) => {
                if (user) {
                    await this.cloudinaryService.deleteAllAssetsForUid(user.uid);
                }
            })
        );

        // Handle avatar update requests from any service
        this.subscription.add(
            this.userService.avatarUpdateRequest.subscribe(async ({ user, newAvatarRef }) => {
                try {
                    await this.performUpdateUserAvatar(user, newAvatarRef);
                } catch (error) {
                    this.logger.error(`Failed to update avatar for user ${user.uid}`, error);
                }
            })
        );
    }

    private async performUpdateUserAvatar(user: UserI, newAvatarRef: AvatarRef): Promise<UserI> {
        if (!user) {
            throw new Error('User is required to update avatar');
        }
        
        const userEntity = await this.userService.getUserByUid(user.uid);
        const oldPublicId = userEntity.avatarRef?.publicId;
        const newPublicId = newAvatarRef?.publicId;
        
        // No change - skip update
        if (oldPublicId === newPublicId) {
            this.logger.log(`Avatar unchanged for user ${user.uid}, skipping update`);
            return userEntity;
        }
        
        // Delete old avatar assets from Cloudinary, keeping the new one
        await this.cloudinaryService.deleteUserAvatarAssets(user.uid, newPublicId);
        
        // Update user entity - DB trigger will sync to jh_workers automatically
        userEntity.avatarRef = newAvatarRef;
        const updatedUser = await this.userService.updateEntity(userEntity);
        
        this.logger.log(`Updated avatar for user ${user.uid}: ${oldPublicId || 'none'} -> ${newPublicId || 'none'}`);
        return updatedUser;
    }

}
