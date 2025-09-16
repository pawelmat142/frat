import { DictionaryI } from '@shared/DictionaryI';
import { DictionariesRepo } from './DictionariesRepo';
export declare class DictionariesService {
    private readonly repo;
    constructor(repo: DictionariesRepo);
    listCodes(): Promise<string[]>;
    get(code: string): Promise<DictionaryI>;
    put(dto: DictionaryI): Promise<DictionaryI>;
    remove(code: string): Promise<void>;
}
