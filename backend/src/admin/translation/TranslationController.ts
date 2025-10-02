import { Body, Controller, Get, Param, Put, UseInterceptors } from "@nestjs/common";
import { TranslationService } from "./TranslationService";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { TranslationListDto } from "@shared/dto/TranslationListDto";
import { LogInterceptor } from "global/interceptors/LogInterceptor";

// TODO roles guardy
@Controller('api/translations')
@UseInterceptors(LogInterceptor)
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