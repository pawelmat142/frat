import { Body, Controller, Get, Param, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { TranslationService } from "./TranslationService";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { TranslationListDto } from "@shared/dto/TranslationListDto";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserRoles } from "@shared/interfaces/UserI";
import { Roles } from "auth/decorators/RolesDecorator";
import { RolesGuard } from "auth/guards/RolesGuard";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";

@Controller('api/admin/translations')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
export class TranslationController {

    constructor(
        private readonly translationService: TranslationService
    ) {}
    
    @Get(':langCode')
    getTranslation(@Param('langCode') langCode: string): Promise<TranslationI> {
        return this.translationService.getTranslation(langCode);
    }

    @Get('admin/list')
    getLanguagesList(): TranslationListDto[] {
        return this.translationService.getLanguagesList();
    }

    @Put('admin')
    putTranslation(@Body() dto: TranslationI): Promise<TranslationI> {
        return this.translationService.putTranslation(dto);
    }

}