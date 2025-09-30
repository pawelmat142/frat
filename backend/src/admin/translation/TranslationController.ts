import { Controller, Get, Param } from "@nestjs/common";
import { TranslationService } from "./TranslationService";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { TranslationListDto } from "@shared/dto/TranslationListDto";

// TODO roles guardy
@Controller('api/translations')
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

}