/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { FriendshipEntity } from './model/FriendshipEntity';
import { FriendshipRepo } from './services/FriendshipRepo';
import { FriendshipService } from './services/FriendshipService';
import { FriendsController } from './FriendsController';
import { AuthModule } from 'auth/AuthModule';
import { UserModule } from 'user/UserModule';
import { FriendshipSocketHandler } from './services/FriendshipSocketHandler';
import { NotificationModule } from 'notification/NotificationModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FriendshipEntity,
        ]),
        AuthModule,
        UserModule,
        NotificationModule,
    ],
    providers: [
        FriendshipRepo,
        FriendshipService,
        FriendshipSocketHandler
    ],
    controllers: [
        FriendsController,
    ],
    exports: [
        FriendshipService,
        FriendshipSocketHandler
    ],
})
export class FriendsModule { }
