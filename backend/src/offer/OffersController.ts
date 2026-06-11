import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, Headers } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { OffersService } from "./services/OffersService";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { Serialize } from "global/decorators/Serialize";
import { OfferEntity } from "./model/OfferEntity";
import { CurrentUser } from "auth/decorators/CurrentUserDecorator";
import { UserI } from "@shared/interfaces/UserI";
import { OfferForm, OfferI, OfferSearchFilters, OfferSearchResponse } from "@shared/interfaces/OfferI";
import { OffersSearchService } from "./services/OffersSearchService";
import { Header } from '@shared/def/def';
import { Position } from "@shared/interfaces/MapsInterfaces";

@Controller('api/offers')
@UseInterceptors(LogInterceptor)
export class OffersController {

    constructor(
        private readonly offersService: OffersService,
        private readonly offersSearchService: OffersSearchService
    ) {}

    @Get('generate-offer-id')
    async generateOfferId(): Promise<string> {
        return this.offersService.generateOfferId();
    }

    @Get(':offerId')
    @Serialize(OfferEntity)
    getOfferById(
        @Param('offerId') offerId: string
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
        return this.offersService.listOffersByUid(user.uid);
    }

    @Get('user/:uid')
    @Serialize(OfferEntity)
    listUsersOffers(
        @Param('uid') uid: string
    ): Promise<OfferI[]> {
        return this.offersService.listOffersByUid(uid);
    }

    @Patch(':offerId/activation')
    @UseGuards(JwtAuthGuard)
    @Serialize(OfferEntity)
    activateOffer(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: string
    ): Promise<OfferI> {
        return this.offersService.activation(user, offerId);
    }

    @Delete(':offerId')
    @UseGuards(JwtAuthGuard)
    deleteOffer(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: string
    ): Promise<void> {
        return this.offersService.deleteOffer(user, offerId);
    }

    @Patch(':offerId')
    @UseGuards(JwtAuthGuard)
    @Serialize(OfferEntity)
    updateOffer(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: string,
        @Body() form: OfferForm
    ): Promise<OfferI> {
        return this.offersService.updateOffer(user, offerId, form);
    }

    @Get('search/list')
    @Serialize(OfferEntity)
    searchOffers(
        @CurrentUser() user: UserI,
        @Query() filters: OfferSearchFilters,
        @Headers(Header.LAT_HEADER) lat?: string,
        @Headers(Header.LNG_HEADER) lng?: string,
        @Headers(Header.SEARCH_SESSION) searchSessionId?: string,
    ): Promise<OfferSearchResponse> {
            const viewerLocation: Position | undefined = lat && lng ? {
              lat: lat ? Number(lat) : undefined,
              lng: lng ? Number(lng ) : undefined,
            } : undefined;
        return this.offersSearchService.searchOffers(user, filters, viewerLocation, searchSessionId);
    }

    @Get('notify-offer-view/:offerId')
    @UseGuards(JwtAuthGuard)
    notifyOfferView(
        @CurrentUser() user: UserI,
        @Param('offerId') offerId: string
    ): Promise<void> {
        return this.offersService.notifyOfferView(offerId, user);
    }
}