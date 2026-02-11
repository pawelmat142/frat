/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { FriendshipEntity } from './model/FriendshipEntity';
import { FriendshipRepo } from './services/FriendshipRepo';
import { FriendshipService } from './services/FriendshipService';
import { FriendsController } from './FriendsController';
import { AuthModule } from 'auth/AuthModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FriendshipEntity,
        ]),
        AuthModule,
    ],
    providers: [
        FriendshipRepo,
        FriendshipService,
    ],
    controllers: [
        FriendsController,
    ],
    exports: [
        FriendshipService,
        FriendshipRepo,
    ],
})
export class FriendsModule { }
