/** Created by Pawel Malek **/
import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { TranslationPublicService } from "admin/translation/TranslationPublicService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { DictionariesPublicService } from "admin/dictionaries/services/DictionariesPublicService";
import { Serialize } from "./decorators/Serialize";
import { TranslationEntity } from "admin/dictionaries/model/TranslationEntity";
import { DictionaryEntity } from "admin/dictionaries/model/DictionaryEntity";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import { GeocodingService } from "./services/GeocodingService";

@Controller('api')
@UseInterceptors(LogInterceptor)
export class GlobalController {

    constructor(
        private readonly translationPublicService: TranslationPublicService,
        private readonly dictionariesPublicService: DictionariesPublicService,
        private readonly geocodingService: GeocodingService,
    ) {}

    @Get('get-translations/:langCode')
    @Serialize(TranslationEntity)
    getTranslation(@Param('langCode') langCode: string): Promise<TranslationI> {
        return this.translationPublicService.getTranslation(langCode);
    }
    
    @Get('get-dictionary/:code')
    @Serialize(DictionaryEntity)
    getDictionary(
        @Param('code') code: string
    ): Promise<DictionaryI> {
        return this.dictionariesPublicService.getDictionary(code);
    }
    
    @Get('get-dictionary/:code/:groupCode')
    @Serialize(DictionaryEntity)
    getDictionaryGroup(
        @Param('code') code: string, 
        @Param('groupCode') groupCode?: string
    ): Promise<DictionaryI> {
        return this.dictionariesPublicService.getDictionary(code, groupCode);
    }

    @Get('geocode/reverse')
    async reverseGeocode(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
    ): Promise<GeocodedPosition | null> {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        
        if (isNaN(latNum) || isNaN(lngNum)) {
            return null;
        }
        
        return this.geocodingService.reverseGeocode(latNum, lngNum);
    }

}