interface Props {
    chips: string[]
    mode?: ChipMode,
    className?: string
}

export const ChipModes = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary'
} as const

export type ChipMode = typeof ChipModes[keyof typeof ChipModes]; 


const Chips: React.FC<Props> = ({ chips, className, mode = ChipModes.PRIMARY }) => {

    return (
        <div className={`chip-container ${className || ''}`}>
            {Array.isArray(chips) && !!chips.length
                && chips.map(v => (
                    <div key={String(v)} className={`search-chip ${mode}`}>
                        {v}
                    </div>
                ))
            }
        </div>
    )
}
export default Chips;