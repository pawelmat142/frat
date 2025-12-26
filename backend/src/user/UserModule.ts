/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { UserService } from './services/UserService';
import { UserEntity } from './model/UserEntity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { UserRepo } from './services/UserRepo';
import { UserController } from './UserController';
import { UserPublicService } from './services/UserPublicService';
import { TelegramUserService } from './services/TelegramUserService';

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
        TelegramUserService
    ],
    controllers: [
        UserController
    ],
    exports: [
        UserService,
        TelegramUserService,
    ],
})
export class UserModule { }
