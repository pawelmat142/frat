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

export interface DropdownInterface<T extends DropdownValue = DropdownValue> {
    type?: 'single' | 'multi';
    items: DropdownItem<T>[];
    value: DropdownItem<T> | null;
    onSingleSelect?: (item: DropdownItem<T> | null) => void;
    onMultiSelect?: (items: DropdownItem<T>[]) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
}

export type DropdownValue = string | number | Date;

export interface DropdownItem<T extends DropdownValue = DropdownValue> {
    label: string;
    value: T;
    icon?: React.ReactNode;
}