/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { UserService } from './services/UserService';
import { UserEntity } from './model/UserEntity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { UserRepo } from './services/UserRepo';
import { UserController } from './UserController';
import { UserPublicService } from './services/UserPublicService';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
        ]),
    ],
    providers: [
        UserService,
        UserPublicService,
        UserRepo,
    ],
    controllers: [
        UserController
    ],
    exports: [
        UserService,
    ],
})
export class UserModule { }
