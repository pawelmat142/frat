import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from "@nestjs/common";
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
}