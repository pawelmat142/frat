import { Controller, Delete, Get, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserRoles } from "@shared/interfaces/UserI";
import { Roles } from "auth/decorators/RolesDecorator";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { RolesGuard } from "auth/guards/RolesGuard";
import { OfferI } from "@shared/interfaces/OfferI";
import { OffersService } from "./services/OffersService";
import { OffersSearchService } from "./services/OffersSearchService";
import { AdminLogInterceptor } from "global/interceptors/AdminLogInterceptor";

@Controller('api/offer/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
@UseInterceptors(AdminLogInterceptor)
export class AdminOffersController {

    constructor(
        private readonly offersService: OffersService,
        private readonly offersSearchService: OffersSearchService,
    ) {}
    
    @Get("/list")
    listAdminPanel(): Promise<OfferI[]> {
        return this.offersSearchService.listAdminPanel();
    }

    @Delete("/:offerId")
    deleteOffer(
        @Param('offerId') offerId: string
    ): Promise<void> {
        return this.offersService.deleteOfferFn(Number(offerId), 'ADMIN');
    }

    @Delete()
    deleteAllOffers(
    ): Promise<void> {
        return this.offersService.deleteAllOffers('ADMIN');
    }

    @Post("/initial-load")
    initialLoad(
    ): Promise<void> {
        return this.offersService.initialLoad();
    }

}