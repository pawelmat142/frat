import { Dictionaries } from "@shared/def/dictionary.def";
import DictionaryChips from "./DictionaryChips";

interface Props {
    categories?: string[]
    smaller?: boolean;
    color?: 'primary' | 'secondary' | 'tertiary';
    translationColumn?: string;
}

const CategoriesChips: React.FC<Props> = ({ categories, smaller, color='tertiary',translationColumn = "SHORT_NAME" }) => {
    return (
        <DictionaryChips
            values={categories}
            dictionaryCode={Dictionaries.WORK_CATEGORY}
            translationColumn={translationColumn}
            smaller={smaller}
            color={color}
        />
    );
};

export default CategoriesChips;