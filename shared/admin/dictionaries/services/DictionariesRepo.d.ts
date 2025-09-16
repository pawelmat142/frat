import { Repository } from "typeorm";
import { DictionaryEntity } from "../model/DictionaryEntity";
import { DictionaryI } from "@shared//DictionaryI";
export declare class DictionariesRepo {
    private dictionaryRepository;
    constructor(dictionaryRepository: Repository<DictionaryEntity>);
    listCodes(): Promise<string[]>;
    findOne(code: string): Promise<DictionaryI | null>;
    set(dto: DictionaryI): Promise<DictionaryEntity>;
    remove(code: string): Promise<void>;
    private create;
    private update;
}
