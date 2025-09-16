import { DictionariesService } from './services/DictionariesService';
import { DictionaryI } from '@shared/DictionaryI';
export declare class DictionariesController {
    private readonly dictionariesService;
    constructor(dictionariesService: DictionariesService);
    listCodes(): Promise<string[]>;
    findOne(code: string): Promise<DictionaryI>;
    put(updateDictionaryDto: DictionaryI): Promise<DictionaryI>;
}
