/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthModule } from 'auth/AuthModule';
import { DictionariesModule } from 'admin/dictionaries/DictionariesModule';
import { OfferEntity } from './model/OfferEntity';
import { OffersService } from './services/OffersService';
import { OffersRepo } from './services/OffersRepo';
import { OffersController } from './OffersController';
import { CreateOfferService } from './services/CreateOfferService';
import { OffersSearchService } from './services/OffersSearchService';
import { AdminOffersController } from './AdminOffersController';
import { EntityInteractionModule } from 'entity-interaction/EntityInteractionModule';
import { UserManagementModule } from 'user/UserManagement/UserManagementModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OfferEntity,
        ]),

        AuthModule,
        DictionariesModule,
        EntityInteractionModule,
        UserManagementModule,
    ],
    providers: [
        OffersService,
        CreateOfferService,
        OffersSearchService,
        OffersRepo,
    ],
    controllers: [
        OffersController,
        AdminOffersController,
    ],
    exports: [
        OffersService
    ],
})
export class OffersModule { }
