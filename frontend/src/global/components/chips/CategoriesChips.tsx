import { Dictionaries } from "@shared/def/dictionary.def";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import { Util } from "@shared/utils/util";
import { useTranslation } from "react-i18next";

interface Props {
    categories?: string[]
    smaller?: boolean;
}

const CategoriesChips: React.FC<Props> = ({ categories, smaller }) => {

    const { t } = useTranslation();

    if (!categories?.length) {
        return null;
    }

    return (
        <div className="flex items-center">
            <div className="chip-container">
                {(categories || []).map(category => (
                    <div key={category} className={`search-chip tertiary${smaller ? ' smaller' : ''}`}>
                        {Util.captializeFirstLetter(t(DictionaryUtil.getTranslationKey(Dictionaries.WORK_CATEGORY, category)))}
                    </div>
                ))}
            </div>
        </div>
    )

}

export default CategoriesChips;