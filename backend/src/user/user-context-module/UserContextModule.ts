/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { ChatModule } from 'chat/ChatModule';
import { FriendsModule } from 'friends/FriendsModule';
import { NotificationModule } from 'notification/NotificationModule';
import { OffersModule } from 'offer/OfferModule';
import { SettingsModule } from 'user/settings-module/SettingsModule';
import { UserModule } from 'user/UserModule';
import { UserContextService } from './UserContextService';
import { WorkerModule } from 'employee/WorkerModule';
import { UserContextController } from './UserContextController';
import { AuthModule } from 'auth/AuthModule';

@Module({
    imports: [
        AuthModule,
        UserModule,
        FriendsModule,
        OffersModule,
        WorkerModule,
        SettingsModule,
        NotificationModule,
        ChatModule,
    ],
    controllers: [
        UserContextController,
    ],
    providers: [
        UserContextService
    ]
})
export class UserContextModule {}
