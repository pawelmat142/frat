/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from './UserRepo';
import { UserEntity } from 'user/model/UserEntity';
import { CreateUser } from 'user/model/UserInterface';
import { UserI } from '@shared/interfaces/UserI';


@Injectable()
export class UserService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userRepo: UserRepo,
    ) { }

    public create(createUser: CreateUser): Promise<UserEntity> {
        return this.userRepo.create(createUser);
    }

    public listUsers(): Promise<UserI[]> {
        return this.userRepo.listUsers();
    }
}
