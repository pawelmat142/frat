export interface DictionaryI {
    code: string
    description?: string
    version: number
    status: DictionaryStatus
    columns: DictionaryColumn[]
    elements: DictionaryElement[]
    groups: DictionaryGroup[]
}

export interface DictionaryElement {
    code: string
    name: string
    description: string
    active: boolean
    values: { [key: string]: any }; // key -> column code, typeof value -> DictionaryColumn.type
}

export interface DictionaryColumn {
    code: string
    type: DictionaryColumnType
    required: boolean
    description?: string
}

export interface DictionaryGroup {
    elementCodes: string[]
    code: string
    active: boolean
}

export const DictionaryColumnTypes = {
    STRING: 'string',
    NUMBER: 'number',
    DATE: 'date',
    STRINGLIST: 'stringlist'
} as const;

export type DictionaryColumnType = typeof DictionaryColumnTypes[keyof typeof DictionaryColumnTypes];

export const DictionaryStatuses = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
} as const;

export type DictionaryStatus = typeof DictionaryStatuses[keyof typeof DictionaryStatuses];
