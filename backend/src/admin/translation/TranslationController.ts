import { Body, Controller, Delete, Get, Param, Patch, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { TranslationService } from "./TranslationService";
import { TranslationI, TranslationItemDto } from "@shared/interfaces/TranslationI";
import { TranslationListDto } from "@shared/dto/TranslationListDto";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserRoles } from "@shared/interfaces/UserI";
import { Roles } from "auth/decorators/RolesDecorator";
import { RolesGuard } from "auth/guards/RolesGuard";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { Serialize } from "global/decorators/Serialize";
import { TranslationEntity } from "admin/dictionaries/model/TranslationEntity";

@Controller('api/admin/translations')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
export class TranslationController {

    constructor(
        private readonly translationService: TranslationService
    ) {}

    @Get(':langCode')
    @Serialize(TranslationEntity)
    getTranslation(@Param('langCode') langCode: string): Promise<TranslationI> {
        return this.translationService.getTranslation(langCode)
    }

    @Get('admin/list')
    getLanguagesList(): TranslationListDto[] {
        return this.translationService.getLanguagesList()
    }

    @Get('item/:path')
    getTranslationItem(@Param('path') path: string): Promise<TranslationItemDto> {
        return this.translationService.getTranslationItem(path)
    }

    @Patch('item')
    updateTranslationItem(@Body() dto: TranslationItemDto): Promise<void> {
        return this.translationService.patchTranslationItem(dto)
    }

    @Put('admin')
    @Serialize(TranslationEntity)
    putTranslation(@Body() dto: TranslationI): Promise<TranslationI> {
        return this.translationService.putTranslation(dto)
    }

    @Delete(':path')
    @Roles(UserRoles.SUPERADMIN)
    removeTranslationForPath(@Param('path') path: string): Promise<void> {
        return this.translationService.removeTranslationForPath(path)
    }

}