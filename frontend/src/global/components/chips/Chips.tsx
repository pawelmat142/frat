interface Props {
    chips: string[]
    className?: string
}

const Chips: React.FC<Props> = ({ chips, className }) => {

    return (
        <div className={`chip-container ${className || ''}`}>
            {Array.isArray(chips) && !!chips.length
                && chips.map(v => (
                    <div key={String(v)} className="chip">
                        {v}
                    </div>
                ))
            }
        </div>
    )
}
export default Chips;