/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from './UserRepo';
import { UserEntity } from 'user/model/UserEntity';
import { CreateUser } from 'user/model/UserInterface';
import { FileRef, UserI, UserRole, UserRoles } from '@shared/interfaces/UserI';
import { ToastException } from 'global/exceptions/ToastException';
import { Subject } from 'rxjs';


@Injectable()
export class UserService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userRepo: UserRepo,
    ) { }

    private _userDeletedEvent$ = new Subject<UserI>()
    public get userDeletedEvent() {
        return this._userDeletedEvent$.asObservable()
    }

    private _avatarUpdateRequest$ = new Subject<{ user: UserI; newAvatarRef: FileRef }>()
    /**
     * Subscribe to this event to handle avatar updates centrally.
     * UserManagementService listens to this and handles Cloudinary cleanup + DB update.
     */
    public get avatarUpdateRequest() {
        return this._avatarUpdateRequest$.asObservable()
    }

    /**
     * Hooks run sequentially BEFORE the user row is deleted, while its DB relations
     * (e.g. chat memberships) still exist. Needed because `ON DELETE CASCADE` FKs are
     * NOT DEFERRABLE by default in Postgres, so they purge dependent rows synchronously
     * within the same DELETE statement - by the time `userDeletedEvent` fires, any rows
     * that only reference the user indirectly (e.g. via a join table) are already gone.
     * Use this to capture data (like chat ids) needed for post-delete cleanup.
     */
    private preDeleteHooks: Array<(user: UserI) => Promise<void>> = [];

    public registerPreDeleteHook(hook: (user: UserI) => Promise<void>): void {
        this.preDeleteHooks.push(hook);
    }

    public async existsByUid(uid: string): Promise<boolean> {
        return this.userRepo.existsByUid(uid);
    }

    public getUserByUid(uid: string): Promise<UserEntity> {
        return this.userRepo.getUserByUid(uid);
    }

    public getUsersByUids(uids: string[]): Promise<UserEntity[]> {
        return this.userRepo.getUsersByUids(uids);
    }

    public findUserByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepo.findUserByEmail(email);
    }

    public getActiveUserByUid(uid: string): Promise<UserEntity> {
        return this.userRepo.getActiveUserByUid(uid);
    }

    public getUserByTelegramChannelId(telegramChannelId: string): Promise<UserEntity | null> {
        return this.userRepo.getUserByTelegramChannelId(telegramChannelId);
    }

    public create(createUser: CreateUser): Promise<UserEntity> {
        return this.userRepo.create(createUser);
    }

    public listUsers(): Promise<UserI[]> {
        return this.userRepo.listUsers();
    }

    public async updateEntity(user: UserEntity): Promise<UserEntity> {
        return this.userRepo.updateEntity(user);
    }

    public saveChatPublicKey(uid: string, publicKey: string): Promise<void> {
        return this.userRepo.saveChatPublicKey(uid, publicKey);
    }

    public getChatPublicKey(uid: string): Promise<string | null> {
        return this.userRepo.getChatPublicKey(uid);
    }

    public async deleteUser(uid: string): Promise<void> {
        const user = await this.userRepo.getUserByUid(uid);
        if (!user) {
            throw new ToastException('user.error.notFound', this);
        }

        // Run pre-delete hooks while the user's DB relations still exist.
        for (const hook of this.preDeleteHooks) {
            try {
                await hook(user);
            } catch (error) {
                this.logger.error(`Pre-delete hook failed for user ${uid}`, error);
            }
        }

        const deleted = await this.userRepo.deleteEntity(user);
        if (!deleted) {
            throw new ToastException('user.error.cannotDelete', this);
        }
        this.logger.log(`Deleted user: ${user.userId} / ${deleted.email}`);
        // trigger delete firebase user
        // triggers employee profile deletion
        // triggers all related offers deletion
        // triggers all assets deletion from Cloudinary
        this._userDeletedEvent$.next(deleted);
    }

    public async assignRolesForUser(uid: string, roles: UserRole[]): Promise<UserI> {
        if (!roles?.length) {
            throw new ToastException('user.error.missingRoles', this)
        }
        for (const role of roles) {
            if (!Object.values(UserRoles).includes(role)) {
                throw new ToastException('user.error.invalidRole', this)
            }
        }
        const user = await this.userRepo.getUserByUid(uid);
        if (!user) {
            throw new ToastException('user.error.notFound', this);
        }
        user.roles = roles;

        const result = await this.userRepo.updateEntity(user);
        this.logger.log(`Assigned roles '${roles.join(', ')}' to user: ${user.userId} / ${user.email}`);
        return result;
    }

    public async updateAvatarIfChanges(user: UserI, avatarRef: FileRef): Promise<void> {
        if (user.avatarRef?.publicId === avatarRef?.publicId) {
            return
        }
        // Emit event for UserManagementService to handle the update
        // This avoids circular dependency and centralizes avatar logic
        this._avatarUpdateRequest$.next({ user, newAvatarRef: avatarRef });
    }

    public async updateLastSeenAt(uid: string): Promise<void> {
        await this.userRepo.updateLastSeenAt(uid);
    }

}
