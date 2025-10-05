import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserI, UserRoles, UserStatuses } from "@shared/interfaces/UserI";
import { Repository } from "typeorm";
import { UserEntity } from "user/model/UserEntity";
import { CreateUser } from "user/model/UserInterface";

@Injectable()
export class UserRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) { }

    public async create(createUser: CreateUser): Promise<UserEntity> {
        const entity = this.userRepository.create({
            uid: createUser.uid,
            roles: [UserRoles.USER],
            displayName: createUser.displayName,
            email: createUser.email,
            provider: createUser.provider,
            photoURL: createUser.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const saved = await this.userRepository.save(entity);
        this.logger.log(`Created new user: ${saved.userId} / ${saved.email}, provider: ${saved.provider}`);
        return saved;
    }

    public getActiveUserByUid(uid: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ uid, status: UserStatuses.ACTIVE });
    }

    public getUserByUid(uid: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ uid });
    }

    public findUserByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ email });
    }

    public existsByUid(uid: string): Promise<boolean> {
        return this.userRepository.exists({ where: { uid } });
    }

    public deleteEntity(user: UserEntity): Promise<UserEntity> {
        return this.userRepository.remove(user);
    }

    public updateEntity(user: UserEntity): Promise<UserEntity> {
        user.version++
        return this.userRepository.save(user)
    }

    // admin panel purpose
    public listUsers(): Promise<UserI[]> {
        return this.userRepository.find({
            select: {
                uid: true,
                version: true,
                status: true,
                roles: true,
                displayName: true,
                email: true,
                provider: true,
                verified: true,
                photoURL: true,
            }
        });
    }
}