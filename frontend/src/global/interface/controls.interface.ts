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