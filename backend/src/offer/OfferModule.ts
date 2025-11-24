/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthModule } from 'auth/AuthModule';
import { DictionariesModule } from 'admin/dictionaries/DictionariesModule';
import { OfferEntity } from './model/OfferEntity';
import { OffersService } from './services/OffersService';
import { OffersRepo } from './services/OffersRepo';
import { OffersController } from './OffersController';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OfferEntity,
        ]),

        AuthModule,
        DictionariesModule,
    ],
    providers: [
        OffersService,
        OffersRepo,
    ],
    controllers: [
        OffersController,
    ],
    exports: [
    ],
})
export class OffersModule { }
