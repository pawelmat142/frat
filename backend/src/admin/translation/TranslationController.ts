import { Controller, Get, Param } from "@nestjs/common";
import { TranslationService } from "./TranslationService";
import { TranslationI } from "@shared/interfaces/TranslationI";

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

}