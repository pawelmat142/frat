/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { DictionariesRepo } from './DictionariesRepo';
import { ToastWarningException } from 'global/exceptions/ToastWarningException';
import { DictionaryColumnTypes, DictionaryElement, DictionaryI, DictionaryListItem } from '@shared/interfaces/DictionaryI';
import { DictionaryValidators } from '@shared/validators/DictionaryValidators';
import { ToastException } from 'global/exceptions/ToastException';
import { TranslationItemDto } from '@shared/interfaces/TranslationI';
import { DictionaryUtil } from '@shared/utils/DictionaryUtil';

@Injectable()
export class DictionariesService {

  private readonly logger = new Logger(this.constructor.name);

  public registerSetTranslationsForTranslatableElementCallback(callback: (translations: TranslationItemDto) => Promise<void>): void {
    this.setTranslatableElementTranslations = callback;
  }

  public registerRemoveTranslationsForPathCallback(callback: (path: string) => Promise<void>): void {
    this.removeTranslationsForPath = callback;
  }

  public registerRemoveTranslationsForPathStartsWithCallback(callback: (pathStart: string) => Promise<void>): void {
    this.removeTranslationsForPathStartsWith = callback;
  }

  private setTranslatableElementTranslations: (translations: TranslationItemDto) => Promise<void>;

  private removeTranslationsForPath: (path: string) => Promise<void>;

  private removeTranslationsForPathStartsWith: (pathStart: string) => Promise<void>;

  // TODO przy dodawaniu/edycji elementu edycja grup
  
  constructor(
    private readonly repo: DictionariesRepo,
  ) { }


  public list(): Promise<DictionaryListItem[]> {
    return this.repo.list();
  }

  public async get(code: string): Promise<DictionaryI> {
    const dictionary = await this.repo.findOne(code);
    if (!dictionary) {
      throw new ToastException(`Dictionary ${code} not found`, this);
    }
    return dictionary;
  }

  public async put(dto: DictionaryI): Promise<DictionaryI> {
    try {
      DictionaryValidators.fullValidation(dto);
      return this.repo.put(dto);
    } catch (err: any) {
      throw new ToastException(err.message, this);
    }
  }

  public async putElement(element: DictionaryElement, dictionaryCode: string): Promise<DictionaryI> {
    const dictionary = await this.get(dictionaryCode);
    const elementIndex = dictionary.elements.findIndex(el => el.code === element.code);

    dictionary.columns.forEach(col => {
      const value = element.values[col.code];
      if (!value) {
        if (col.type !== DictionaryColumnTypes.BOOLEAN && col.required) {
          throw new ToastException(`Missing value for required column ${col.code} in dictionary ${dictionaryCode}`, this);
        }
      }
    })

    for (const columnCode of Object.keys(element.values)) {
      const column = dictionary.columns.find(col => col.code === columnCode);
      if (!column) {
        throw new ToastException(`Column with code ${element.code} not found in dictionary ${dictionaryCode}`, this);
      }
      const path = DictionaryUtil.getTranslationKeyWithCol(dictionaryCode, column.code, element.code);

      if (column.translatable) {

        const translations = element.values[columnCode];
        if (typeof translations !== 'object') {
          throw new ToastException(`Translations for column ${column.code} should be an object with language codes as keys`, this);
        }

        const translationItem: TranslationItemDto = {
          path,
          translation: {}
        }
        Object.entries(translations).forEach(([langCode, value]) => {
          this.logger.log(`Setting translation for dictionary ${dictionaryCode}, column ${column.code}, element ${element.code}, lang ${langCode}: ${value}`);
          translationItem.translation[langCode] = String(value);
        })

        if (this.setTranslatableElementTranslations) {
          await this.setTranslatableElementTranslations(translationItem);
        }

        element.values[columnCode] = path;
      }
    }

    if (elementIndex === -1) {
      dictionary.elements.push(element);
    } else {
      dictionary.elements[elementIndex] = element;
    }

    const result = await this.put(dictionary);
    this.logger.log(`Updated element with code ${element.code} in dictionary ${dictionaryCode}`);
    return result;
  }

  public async delete(code: string): Promise<void> {
    if (this.removeTranslationsForPathStartsWith) {
      await this.removeTranslationsForPathStartsWith(`dictionary.${code}`);
    }
    return this.repo.remove(code);
  }

  public async deleteElement(code: string, elementCode: string): Promise<DictionaryI> {
    const dictionary = await this.get(code);
    const element = dictionary.elements.find(el => el.code === elementCode);
    if (!element) {
      throw new ToastException(`Element with code ${elementCode} not found in dictionary ${code}`, this);
    }

    if (this.removeTranslationsForPath) {
      for (const column of dictionary.columns) {
        if (column.translatable) {
          const path = DictionaryUtil.getTranslationKeyWithCol(code, column.code, elementCode);
          await this.removeTranslationsForPath(path);
        }
      }
    }

    dictionary.elements = dictionary.elements.filter(el => el.code !== elementCode);
    return this.put(dictionary);
  }

  public getDictionaryGroupIfExists(dictionaryCode: string, groupCode: string): Promise<DictionaryI | null> {
    return this.repo.getDictionaryGroup(dictionaryCode, groupCode);
  }

  public getDictionaryGroup(dictionaryCode: string, groupCode: string): Promise<DictionaryI> {
    const result = this.repo.getDictionaryGroup(dictionaryCode, groupCode);
    if (!result) {
      throw new ToastWarningException(`Dictionary ${dictionaryCode} with group ${groupCode} not found`, this);
    }
    return result;
  }
}
