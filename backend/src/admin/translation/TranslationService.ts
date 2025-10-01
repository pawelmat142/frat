import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { Dictionaries } from "@shared/def/dictionary.def";
import { DictionaryElement, DictionaryI } from "@shared/DictionaryI";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { DictionariesService } from "admin/dictionaries/services/DictionariesService";
import { TranslationEntity } from "./TranslationEntity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TranslationListDto } from "@shared/dto/TranslationListDto";

@Injectable()
export class TranslationService implements OnModuleInit {

    constructor(
        private readonly dictionariesService: DictionariesService,
        @InjectRepository(TranslationEntity)
        private translationRepository: Repository<TranslationEntity>,
    ) { }

    private languagesList: DictionaryElement[]

    public async onModuleInit(): Promise<void> {
        this.reloadLanguagesList();
    }
    
    private async reloadLanguagesList(): Promise<void> {
        const translationsLangDictionary: DictionaryI = await this.dictionariesService.getDictionaryGroup(Dictionaries.LANGUAGES, 'TRANSLATIONS');
        this.languagesList = translationsLangDictionary.elements
    }

    public async isSupportedTranslationLang(langCode: string): Promise<boolean> {
        await this.reloadLanguagesList();
        return !!this.languagesList.find(l => l.code === langCode && l.active);
    }

    public async getTranslation(langCode: string): Promise<TranslationI> {
        let code = langCode
        if (!this.languagesList) {
            throw new Error('Translations languages list is not initialized');
        }

        if (!(await this.isSupportedTranslationLang(code))) {
            console.warn(`Language ${langCode} is not supported by translations, returning default 'en'`);
            code = 'en'
        }

        const result = await this._getTranslation(code);
        if (!result) {
            // TODO
            console.error(`Translations for language code ${code} not found in the database`);
            return {
                langCode,
                version: -1,
                data: {}
            }
        }
        return result;
    }

    public async putTranslation(dto: TranslationI): Promise<TranslationI> {
        const translation = await this._getTranslation(dto.langCode)
        if (!translation) {
            const newTranslation: TranslationI = {
                langCode: dto.langCode,
                version: 1,
                data: dto.data
            }
            const saved = await this.translationRepository.save(this.translationRepository.create(newTranslation));
            // TODO logi
            console.log('CREATED!')
            console.log(saved)
            return saved;
        }

        for (let key of Object.keys(dto.data)) {
            translation.data[key] = dto.data[key];
        }
        translation.version++;

        // TODO logi
        return this.translationRepository.save(translation);
    }


    private _getTranslation(langCode: string): Promise<TranslationI> {
        return this.translationRepository.findOne({ where: { langCode } })
    }


    // admin
    getLanguagesList(): TranslationListDto[] {
        return this.languagesList.filter(element => element.active).map(element => ({
            code: element.code,
            name: element.description,
            localeCode: element.values['LOCALE_CODE']
        }));
    }
}