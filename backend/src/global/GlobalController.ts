import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { TranslationPublicService } from "admin/translation/TranslationPublicService";

@Controller('api')
@UseInterceptors(LogInterceptor)
export class GlobalController {

    constructor(
        private readonly translationPublicService: TranslationPublicService
    ) {}
    
    @Get('get-translations/:langCode')
    getTranslation(@Param('langCode') langCode: string): Promise<TranslationI> {
        return this.translationPublicService.getTranslation(langCode);
    }

}