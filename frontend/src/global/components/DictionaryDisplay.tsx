import { useTranslation } from 'react-i18next';

interface Props {
    dictionary: string
    value: string;
    column?: string;
}

const DictionaryDisplay: React.FC<Props> = ({ dictionary, value, column = "NAME" }) => {
    const { t } = useTranslation();

    return <span>{t(`dictionary.${dictionary}.${column}.${value}`)}</span>  
}

export default DictionaryDisplay;