import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { Dictionaries } from "@shared/def/dictionary.def";
import { DictionaryElement, DictionaryI } from "@shared/DictionaryI";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { DictionariesService } from "admin/dictionaries/services/DictionariesService";
import { TranslationEntity } from "./TranslationEntity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TranslationService implements OnModuleInit {

    constructor(
        private readonly dictionariesService: DictionariesService,
        @InjectRepository(TranslationEntity)
        private translationRepository: Repository<TranslationEntity>,
    ) { }

    private languagesList: DictionaryElement[]

    public async onModuleInit(): Promise<void> {
        const translationsLangDictionary: DictionaryI = await this.dictionariesService.getDictionaryGroup(Dictionaries.LANGUAGES, 'TRANSLATIONS');
        this.languagesList = translationsLangDictionary.elements
    }

    public async getTranslation(langCode: string): Promise<TranslationI> {
        let code = langCode
        if (!this.languagesList) {
            throw new Error('Translations languages list is not initialized');
        }
        
        if (!this.languagesList.find(l => l.code === code)) {
            console.warn(`Language ${langCode} is not supported by translations, returning default 'en'`);
            code = 'en'
        }

        const result = await this.translationRepository.findOne({ where: { langCode: code } })
        if (!result) {
            throw new NotFoundException(`Translations for language code ${code} not found in the database`);
        }
        return result;
    }
}