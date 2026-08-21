import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import { Util } from "@shared/utils/util";
import { useTranslation } from "react-i18next";

export interface DictionaryChipsProps {
    values?: string[];
    dictionaryCode: string;
    translationColumn?: string;
    capitalizeFirstLetter?: boolean;
    smaller?: boolean;
    color?: 'primary' | 'secondary' | 'tertiary';
}

const DictionaryChips: React.FC<DictionaryChipsProps> = ({
    values,
    dictionaryCode,
    translationColumn = "NAME",
    capitalizeFirstLetter = true,
    smaller,
    color = 'tertiary',
}) => {
    const { t } = useTranslation();

    if (!values?.length) {
        return null;
    }

    return (
        <div className="flex items-center">
            <div className="chip-container">
                {values.map(value => (
                    <div key={value} className={`search-chip ${color}${smaller ? ' smaller' : ''}`}>
                        {capitalizeFirstLetter
                            ? Util.captializeFirstLetter(t(DictionaryUtil.getTranslationKeyWithCol(dictionaryCode, translationColumn, value)))
                            : t(DictionaryUtil.getTranslationKeyWithCol(dictionaryCode, translationColumn, value))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DictionaryChips;