import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRoles } from "@shared/interfaces/UserI";
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
            photoURL: createUser.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const saved = await this.userRepository.save(entity);
        this.logger.log(`Created new user: ${saved.userId} / ${saved.email}`);
        return saved;
    }



}