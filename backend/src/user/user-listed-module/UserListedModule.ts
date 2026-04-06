/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/AuthModule';
import { UserListedItemEntity } from './model/UserListedItemEntity';
import { UserListedItemService } from './services/UserListedItemService';
import { UserListedItemController } from './UserListedItemController';
import { WorkerModule } from 'employee/WorkerModule';
import { OffersModule } from 'offer/OfferModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserListedItemEntity]),
        AuthModule,
        WorkerModule,
        OffersModule
    ],
    controllers: [
        UserListedItemController,
    ],
    providers: [
        UserListedItemService,
    ],
    exports: [
        UserListedItemService,
    ]
})
export class UserListedModule {}
