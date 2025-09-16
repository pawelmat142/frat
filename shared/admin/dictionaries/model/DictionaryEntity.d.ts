import { DictionaryColumn, DictionaryElement, DictionaryGroup, DictionaryI, DictionaryStatus } from '@shared/DictionaryI';
export declare class DictionaryEntity implements DictionaryI {
    dictionaryId: number;
    code: string;
    description: string;
    version: number;
    status: DictionaryStatus;
    elements: DictionaryElement[];
    columns: DictionaryColumn[];
    groups: DictionaryGroup[];
    createdAt: Date;
    updatedAt: Date;
}
