/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { DictionariesRepo } from './DictionariesRepo';
import { SWWException } from 'global/exceptions/SWWException';
import { ToastWarningException } from 'global/exceptions/ToastWarningException';
import { DictionaryI, DictionaryListItem } from '@shared/interfaces/DictionaryI';
import { DictionaryValidators } from '@shared/validators/DictionaryValidators';
import { ToastException } from 'global/exceptions/ToastException';
import { ObjUtil } from '@shared/utils/ObjUtil';
import { TranslationData } from '@shared/interfaces/TranslationI';
import { Subject } from 'rxjs';

@Injectable()
export class DictionariesService {

  private readonly logger = new Logger(this.constructor.name);

  public addTranslationItems$ = new Subject<TranslationData>();

  constructor(
    private readonly repo: DictionariesRepo,
  ) { }

  public list(): Promise<DictionaryListItem[]> {
    return this.repo.list();
  }

  public async get(code: string): Promise<DictionaryI> {
    const dictionary = await this.repo.findOne(code);
    if (!dictionary) {
      throw new SWWException(`Dictionary ${code} not found`, this);
    }
    return dictionary;
  }

  public async put(dto: DictionaryI): Promise<DictionaryI> {
    try {
      DictionaryValidators.fullValidation(dto);
      this.setTranslationsForTranslatableColumns(dto);
      return this.repo.put(dto);
    } catch (err: any) {
      throw new ToastException(err.message, this);
    }
  }

  public delete(code: string): Promise<void> {
    return this.repo.remove(code);
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

  public setTranslationsForTranslatableColumns(dictionary: DictionaryI): void {
    const translatableColumns = dictionary.columns.filter(c => c.translatable).map(c => c.code);

    let data: TranslationData = {};

    for (const columnCode of translatableColumns) {
      for (const element of dictionary.elements) {
        const value = element.values[columnCode];
        if (value) {
          console.log(value)
          const path = `dictionary.${dictionary.code}.${columnCode}.${element.code}`;
          ObjUtil.setValueInNestedJsonByPath(data, path, value);
          element.values[columnCode] = path
        }
      }
    }
    if (Object.keys(data).length) {
      this.logger.log(`Emitting translation items for dictionary ${dictionary.code}`);
      this.addTranslationItems$.next(data);
    }
  }
}
