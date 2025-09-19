export interface BtnInterface {
    to?: string;
    type?: 'button' | 'submit' | 'reset';
    mode?: BtnMode;
    fullWidth?: boolean;
    children: React.ReactNode;
    className?: string;
    onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    onlyMobile?: boolean;
    onlyDesktop?: boolean;
}

export const BtnModes = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    PRIMARY_TXT: 'primary-txt',
    SECONDARY_TXT: 'secondary-txt',
    ERROR: 'error',
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
    value?: string | number;
    className?: string;
    required?: boolean;
    autoComplete?: string;
    center?: boolean;
}

export interface DropdownInterface {
    type: 'single' | 'multi';
    items: DropdownItem[];
    value: DropdownItem | null;
    onSingleSelect?: (item: DropdownItem | null) => void;
    onMultiSelect?: (items: DropdownItem[]) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
}

export interface DropdownItem {
    label: string;
    value: string | number | Date;
    icon?: React.ReactNode;
}