interface Props {
    chips: string[]
    mode?: ChipMode,
    size?: ChipSize,
    className?: string
}

export const ChipModes = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary'
} as const

export const ChipSizes = {
    SMALL: 'small',
    MEDIUM: 'medium'
} as const

export type ChipMode = typeof ChipModes[keyof typeof ChipModes]; 
export type ChipSize = typeof ChipSizes[keyof typeof ChipSizes]; 

const Chips: React.FC<Props> = ({ chips, className, mode = ChipModes.PRIMARY, size = ChipSizes.MEDIUM }) => {

    return (
        <div className={`chip-container ${className || ''}`}>
            {Array.isArray(chips) && !!chips.length
                && chips.map(v => (
                    <div key={String(v)} className={`search-chip ${mode} ${size}`}>
                        {v}
                    </div>
                ))
            }
        </div>
    )
}
export default Chips;