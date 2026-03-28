interface Props {
    dictionary: string
    value: string;
    column?: string;
    t: any
}

const DictionaryDisplay = ({ dictionary, value, column = "NAME", t }: Props): string => {

    return t(`dictionary.${dictionary}.${column}.${value}`);  
}

export default DictionaryDisplay;