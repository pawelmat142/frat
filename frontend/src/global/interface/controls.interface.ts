import { DictionaryColumnType, DictionaryElement } from "@shared/interfaces/DictionaryI";
import { IconType } from "react-icons/lib/cjs/iconBase";

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

export const FloatingInputModes = {
    DEFAULT: 'default',
    THIN: 'thin',
} as const;
export type FloatingInputMode = typeof FloatingInputModes[keyof typeof FloatingInputModes];

export interface InputInterface {
    id?: string;
    name?: string;
    type?: 'text' | 'number' | 'password' | 'email' | 'date' | 'checkbox';
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onDateChange?: (date: Date | null) => void;
    value: string | number | Date | null;
    checked?: boolean;
    className?: string;
    required?: boolean;
    autoComplete?: string;
    center?: boolean;
    valueType?: DictionaryColumnType,
    error?: { message?: string } | null
    rows?: number; // for textarea
    showLabel?: boolean;
    mode?: FloatingInputMode;
}

export interface SelectorInterface<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[];
    value: SelectorItem<T> | null;
    onSelect: (item: T | null) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
    error?: { message?: string } | null
    enableSearchText?: boolean,
    showLabel?: boolean,
}

export interface SelectorMultiProps<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[];
    values: SelectorItem<T>[];
    onSelect: (items: T[]) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
    error?: { message?: string } | null
    enableSearchText?: boolean,
    displayElementsAsChips?: boolean,
    showChipsRemoveButton?: boolean,
    showLabel?: boolean,
}

export interface DictionarySelectorInterface<T extends SelectorValue = SelectorValue> {
    type?: 'single' | 'multi';
    code: string;
    groupCode?: string;
    
    valueInput?: string | string[];
    onSelect?: (value: T | null, dictionaryElement?: DictionaryElement) => void;
    onSelectMulti?: (items: T[]) => void;
    
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
    error?: { message?: string } | null
    enableSearchText?: boolean,
    displayElementsAsChips?: boolean,
    showLabel?: boolean,
}

export type SelectorValue = string | number | Date;

export interface SelectorItem<T extends SelectorValue = SelectorValue> {
    label: string;
    value: T;
    icon?: React.ReactNode;
    src?: string;
    onClick?: () => void;
}

export interface MenuItem {
    label: string
    active?: boolean
    if?: any,
    src?: string
    icon?: IconType,
    rightIcon?: IconType
    className?: string
    badge?: string
    onClick?: (e?: React.MouseEvent) => void
}