import { DictionaryColumnType } from "@shared/interfaces/DictionaryI";

export interface BtnInterface {
    to?: string;
    type?: 'button' | 'submit' | 'reset';
    mode?: BtnMode;
    size?: BtnSize;
    fullWidth?: boolean;
    children: React.ReactNode;
    className?: string;
    onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    onlyMobile?: boolean;
    onlyDesktop?: boolean;
}

export const BtnSizes = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
} as const

export type BtnSize = typeof BtnSizes[keyof typeof BtnSizes];

export const BtnModes = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    PRIMARY_TXT: 'primary-txt',
    SECONDARY_TXT: 'secondary-txt',
    ERROR: 'error',
    ERROR_TXT: 'error-txt',
    WARNING: 'warning',
    SUCCESS: 'success',
} as const

export type BtnMode = typeof BtnModes[keyof typeof BtnModes];


export interface InputInterface {
    id?: string;
    name: string;
    type?: 'text' | 'number' | 'password' | 'email' | 'date';
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDateChange?: (date: Date | null) => void;
    value: string | number | Date | null;
    className?: string;
    required?: boolean;
    autoComplete?: string;
    center?: boolean;
    valueType?: DictionaryColumnType
}

export interface SelectorInterface<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[];
    value: SelectorItem<T> | null;
    onSelect: (item: SelectorItem<T> | null) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
}

export interface SelectorMultiProps<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[];
    values: SelectorItem<T>[];
    onSelect: (items: SelectorItem<T>[]) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
}

export interface DictionarySelectorInterface<T extends SelectorValue = SelectorValue> {
    type?: 'single' | 'multi';
    code: string;
    groupCode?: string;

    valueInput?: string;
    onSelect?: (item: SelectorItem<T> | null) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;

    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
}

export type SelectorValue = string | number | Date;

export interface SelectorItem<T extends SelectorValue = SelectorValue> {
    label: string;
    value: T;
    icon?: React.ReactNode;
}