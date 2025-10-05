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

    public create(createUser: CreateUser): Promise<UserEntity> {
        return this.userRepo.create(createUser);
    }

    public listUsers(): Promise<UserI[]> {
        return this.userRepo.listUsers();
    }

    public async deleteUser(uid: string): Promise<void> {
        const user = await this.userRepo.getUserByUid(uid);
        if (!user) {
            throw new ToastException('User not found', this);
        }
        const deleted = await this.userRepo.deleteEntity(user);
        if (!deleted) {
            throw new ToastException('Cannot delete user', this);
        }
        this.logger.log(`Deleted user: ${user.userId} / ${deleted.email}`);
        this._userDeletedEvent$.next(deleted);
    }

    public async assignRoleForUser(uid: string, role: UserRole): Promise<UserI> {
        if (!Object.values(UserRoles).includes(role)) {
            throw new ToastException(`Invalid role ${role}`, this)
        }
        const user = await this.userRepo.getUserByUid(uid);
        if (!user) {
            throw new ToastException('User not found', this);
        }
        if (user.roles.includes(role)) {
            throw new ToastException('User already has this role', this);
        }
        user.roles.push(role)
        const result = await this.userRepo.updateEntity(user);

        this.logger.log(`Assigned role '${role}' to user: ${user.userId} / ${user.email}`);
        return result;
    }
}
