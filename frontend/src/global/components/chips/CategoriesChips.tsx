import { Dictionaries } from "@shared/def/dictionary.def";
import DictionaryChips from "./DictionaryChips";

interface Props {
    categories?: string[]
    smaller?: boolean;
    color?: 'primary' | 'secondary' | 'tertiary';
}

const CategoriesChips: React.FC<Props> = ({ categories, smaller, color='tertiary' }) => {
    return (
        <DictionaryChips
            values={categories}
            dictionaryCode={Dictionaries.WORK_CATEGORY}
            translationColumn="SHORT_NAME"
            smaller={smaller}
            color={color}
        />
    );
};

export default CategoriesChips;