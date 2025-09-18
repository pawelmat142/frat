export interface DictionaryI {
    code: string;
    description?: string;
    version: number;
    status: DictionaryStatus;
    columns: DictionaryColumn[];
    elements: DictionaryElement[];
    groups: DictionaryGroup[];
}
export interface DictionaryElement {
    code: string;
    name: string;
    description: string;
    active: boolean;
    values: {
        [key: string]: any;
    };
}
export interface DictionaryColumn {
    name: string;
    type: DictionaryColumnType;
    required: boolean;
}
export interface DictionaryGroup {
    elementCodes: string[];
    code: string;
    active: boolean;
}
export declare const DictionaryColumnTypes: {
    readonly STRING: "string";
    readonly NUMBER: "number";
    readonly DATE: "date";
    readonly STRINGLIST: "stringlist";
};
export type DictionaryColumnType = typeof DictionaryColumnTypes[keyof typeof DictionaryColumnTypes];
export declare const DictionaryStatuses: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
};
export type DictionaryStatus = typeof DictionaryStatuses[keyof typeof DictionaryStatuses];
