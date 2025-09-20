/** Created by Pawel Malek **/
import { Injectable, NotFoundException,  } from '@nestjs/common';
import { DictionaryI, DictionaryListItem } from '@shared/DictionaryI';
import { DictionariesRepo } from './DictionariesRepo';

@Injectable()
export class DictionariesService {

  constructor(
    private readonly repo: DictionariesRepo,
  ) { }

  public list(): Promise<DictionaryListItem[]> {
    return this.repo.list();
  }

  public async get(code: string): Promise<DictionaryI> {
    const dictionary = await this.repo.findOne(code);
    if (!dictionary) {
      throw new NotFoundException(`Dictionary ${code} not found`);
    }
    return dictionary;
  }

  public put(dto: DictionaryI): Promise<DictionaryI> {
    return this.repo.set(dto);
  }

  public async remove(code: string): Promise<void> {
    await this.repo.remove(code);
  }

}
