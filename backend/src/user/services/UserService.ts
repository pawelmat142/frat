/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from './UserRepo';
import { UserEntity } from 'user/model/UserEntity';
import { CreateUser } from 'user/model/UserInterface';
import { UserI, UserStatuses } from '@shared/interfaces/UserI';
import { ToastException } from 'global/exceptions/ToastException';
import { Subject } from 'rxjs';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Util } from '@shared/utils/util';
import { UserUtil } from 'user/UserUtil';


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

    public async getOrCreateUserEntity(decodedToken: DecodedIdToken): Promise<UserI | null> {
        const existingUser = await this.userRepo.getUserByUid(decodedToken.uid);

        if (existingUser) {
            if (existingUser.status === UserStatuses.ACTIVE) {
                return existingUser;
            }
            this.logger.warn(`User with uid ${decodedToken.uid} is not active. Cannot create or return user.`);
            return null
        }

        const provider = UserUtil.findProvider(decodedToken);
        if (!provider) {
            this.logger.warn(`Cannot determine provider from decoded token for uid ${decodedToken.uid}`);
        }

        const newUser = await this.create({
            uid: decodedToken.uid,
            displayName: decodedToken.name || Util.trimEmail(decodedToken.email),
            email: decodedToken.email,
            provider: provider,
            photoURL: decodedToken.picture,
        });
        return newUser;
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
}
