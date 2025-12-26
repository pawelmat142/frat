/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from './UserRepo';
import { UserEntity } from 'user/model/UserEntity';
import { CreateUser } from 'user/model/UserInterface';
import { UserI, UserRole, UserRoles } from '@shared/interfaces/UserI';
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

    public async existsByUid(uid: string): Promise<boolean> {
        return this.userRepo.existsByUid(uid);
    }

    public getUserByUid(uid: string): Promise<UserEntity> {
        return this.userRepo.getUserByUid(uid);
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

    public async deleteUser(uid: string): Promise<void> {
        const user = await this.userRepo.getUserByUid(uid);
        if (!user) {
            throw new ToastException('user.error.notFound', this);
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

}
