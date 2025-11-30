import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { OffersService } from "./services/OffersService";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { Serialize } from "global/decorators/Serialize";
import { OfferEntity } from "./model/OfferEntity";
import { CurrentUser } from "auth/decorators/CurrentUserDecorator";
import { UserI } from "@shared/interfaces/UserI";
import { OfferForm, OfferI } from "@shared/interfaces/OfferI";


@Controller('api/offers')
@UseInterceptors(LogInterceptor)
export class OffersController {

    constructor(private readonly offersService: OffersService) {}

    @Get(':offerId')
    @Serialize(OfferEntity)
    getOfferById(
        @Param('offerId') offerId: number
    ) {
        return this.offersService.getOfferById(offerId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @Serialize(OfferEntity)
    createOffer(
        @CurrentUser() user: UserI,
        @Body() form: OfferForm
    ): Promise<OfferI> {
        return this.offersService.createOffer(user, form);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @Serialize(OfferEntity)
    listMyOffers(
        @CurrentUser() user: UserI
    ): Promise<OfferI[]> {
        return this.offersService.listOffersByUser(user);
    }

    @Patch(':offerId/activation')
    @UseGuards(JwtAuthGuard)
    @Serialize(OfferEntity)
    activateOffer(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: number
    ): Promise<OfferI> {
        return this.offersService.activation(user, offerId);
    }

    @Delete(':offerId')
    @UseGuards(JwtAuthGuard)
    deleteOffer(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: number
    ): Promise<void> {
        return this.offersService.deleteOffer(user, offerId);
    }

    @Patch(':offerId')
    @UseGuards(JwtAuthGuard)
    @Serialize(OfferEntity)
    updateOffer(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: number,
        @Body() form: OfferForm
    ): Promise<OfferI> {
        return this.offersService.updateOffer(user, offerId, form);
    }
}