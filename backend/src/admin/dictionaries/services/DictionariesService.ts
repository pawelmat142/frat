/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { DictionariesRepo } from './DictionariesRepo';
import { SWWException } from 'global/exceptions/SWWException';
import { ToastWarningException } from 'global/exceptions/ToastWarningException';
import { DictionaryI, DictionaryListItem } from '@shared/interfaces/DictionaryI';

@Injectable()
export class DictionariesService {

  private readonly logger = new Logger(this.constructor.name);

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

  public put(dto: DictionaryI): Promise<DictionaryI> {
    return this.repo.set(dto);
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
}
