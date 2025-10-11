import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { TranslationPublicService } from "admin/translation/TranslationPublicService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { DictionariesPublicService } from "admin/dictionaries/services/DictionariesPublicService";

@Controller('api')
@UseInterceptors(LogInterceptor)
export class GlobalController {

    constructor(
        private readonly translationPublicService: TranslationPublicService,
        private readonly dictionariesPublicService: DictionariesPublicService,
    ) {}
    
    @Get('get-translations/:langCode')
    getTranslation(@Param('langCode') langCode: string): Promise<TranslationI> {
        return this.translationPublicService.getTranslation(langCode);
    }
    
    @Get('get-dictionary/:code')
    getDictionary(
        @Param('code') code: string
    ): Promise<DictionaryI> {
        return this.dictionariesPublicService.getDictionary(code);
    }
    
    @Get('get-dictionary/:code/:groupCode')
    getDictionaryGroup(
        @Param('code') code: string, 
        @Param('groupCode') groupCode?: string
    ): Promise<DictionaryI> {
        return this.dictionariesPublicService.getDictionary(code, groupCode);
    }

}