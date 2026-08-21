import { Dictionaries } from "@shared/def/dictionary.def";
import DictionaryChips from "./DictionaryChips";

interface Props {
    languages?: string[];
    smaller?: boolean;
    color?: 'primary' | 'secondary' | 'tertiary';
}

const LanguagesChips: React.FC<Props> = ({ languages, smaller, color = 'tertiary' }) => (
    <DictionaryChips
        values={languages}
        dictionaryCode={Dictionaries.LANGUAGES}
        capitalizeFirstLetter={false}
        smaller={smaller}
        color={color}
    />
);

export default LanguagesChips;