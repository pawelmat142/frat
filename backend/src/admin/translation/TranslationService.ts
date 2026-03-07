import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Dictionaries } from "@shared/def/dictionary.def";
import { TranslationDataWithPaths, TranslationI, TranslationItemDto } from "@shared/interfaces/TranslationI";
import { DictionariesService } from "admin/dictionaries/services/DictionariesService";
import { TranslationEntity } from "../dictionaries/model/TranslationEntity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TranslationListDto } from "@shared/dto/TranslationListDto";
import { ToastException } from "global/exceptions/ToastException";
import { DictionaryElement, DictionaryI } from "@shared/interfaces/DictionaryI";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { AppConfig } from "@shared/AppConfig";

@Injectable()
export class TranslationService implements OnModuleInit {
    
  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly dictionariesService: DictionariesService,
        @InjectRepository(TranslationEntity)
        private translationRepository: Repository<TranslationEntity>,
    ) {
        this.dictionariesService.registerSetTranslationsForTranslatableElementCallback(this.patchTranslationItem.bind(this));
        this.dictionariesService.registerRemoveTranslationsForPathCallback(this.removeTranslationForPath.bind(this));
    }

    private languagesList: DictionaryElement[]

    private readonly DEFAULT_LANG_CODE = AppConfig.DEFAULT_LANG_CODE;

    public async onModuleInit(): Promise<void> {
        this.reloadLanguagesList();
    }
    
    private async reloadLanguagesList(): Promise<void> {
        const translationsLangDictionary: DictionaryI | null = await this.dictionariesService.getDictionaryGroupIfExists(Dictionaries.LANGUAGES, 'TRANSLATIONS');
        this.languagesList = translationsLangDictionary?.elements || []
    }

    public async isSupportedTranslationLang(langCode: string): Promise<boolean> {
        await this.reloadLanguagesList();
        return !!this.languagesList.find(l => l.code === langCode && l.active);
    }

    public async getSupportedTranslation(langCode: string): Promise<TranslationI> {
        let code = langCode
        if (!this.languagesList) {
            throw new ToastException('Translations languages list is not initialized', this);
        }

        if (!(await this.isSupportedTranslationLang(code))) {
            this.logger.warn(`Language ${langCode} is not supported by translations, returning default '${this.DEFAULT_LANG_CODE}'`);
            code = this.DEFAULT_LANG_CODE;
        }

        const result = await this.getTranslation(code);
        if (!result) {
            this.logger.warn(`Translations for language code ${code} not found in the database`);
            return {
                langCode,
                version: -1,
                data: {}
            }
        }
        return result;
    }

    public getTranslation(langCode: string): Promise<TranslationI> {
        return this.translationRepository.findOne({ where: { langCode } })
    }

    public async putTranslation(dto: TranslationI): Promise<TranslationI> {
        const translation = await this.getTranslation(dto.langCode)
        if (!translation) {
            const newTranslation: TranslationI = {
                langCode: dto.langCode,
                version: 1,
                data: dto.data
            }
            const saved = await this.translationRepository.save(this.translationRepository.create(newTranslation));
            this.logger.log(`Created new translation for language ${saved.langCode}`);
            return saved;
        }

        for (let key of Object.keys(dto.data)) {
            translation.data[key] = dto.data[key];
        }
        translation.version++;

        const result = await this.translationRepository.save(translation);
        this.logger.log(`Updated translation for language ${result.langCode} to version ${result.version}`);
        return result;
    }

    public async addTranslationItems(translationInput: TranslationI): Promise<void> {
        const dataWithPaths: TranslationDataWithPaths = ObjUtil.transformNestedJsonToFlatPaths(translationInput.data);
        const translation = await this.getTranslation(translationInput.langCode);
        if (!translation) {
            throw new ToastException(`Translation for language ${translationInput.langCode} not found`, this);
        }
        for (const [path, value] of Object.entries(dataWithPaths)) {
            ObjUtil.setValueInNestedJsonByPath(translation.data, path, value);
        }
        await this.translationRepository.save(translation);
    }

    public async getTranslationItem(path: string): Promise<TranslationItemDto> {
        const translations = await this.translationRepository.find();
        const translationItem: TranslationItemDto = {
            path,
            translation: {}
        }
        for (const translation of translations) {
            const value = ObjUtil.getValueFromNestedJsonByPath(translation.data, path);
            if (value !== undefined) {
                translationItem.translation[translation.langCode] = value;
            }
        }
        return translationItem;
    }

    public async patchTranslationItem(item: TranslationItemDto): Promise<void> {
        for (const [langCode, value] of Object.entries(item.translation)) {
            const translation = await this.getTranslation(langCode);    
            if (!translation) {
                this.logger.warn(`Translation for language ${langCode} not found, skipping patching translation item for this language`);
                continue;
            }
            ObjUtil.setValueInNestedJsonByPath(translation.data, item.path, value);
            this.logger.log(`Patched translation item with path ${item.path} for language ${langCode}`);
            await this.translationRepository.save(translation);
        }
    }

    public async removeTranslationForPath(path: string): Promise<void> {
        const translations = await this.translationRepository.find();
        for (const translation of translations) {
            if (ObjUtil.getValueFromNestedJsonByPath(translation.data, path) !== undefined) {
                ObjUtil.deleteValueInNestedJsonByPath(translation.data, path);
                this.logger.log(`Removed translation item with path ${path} for language ${translation.langCode}`);
                await this.translationRepository.save(translation);
            }
        }
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