import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

interface LangSelectTileProps {
    iconSize?: number;
}

const LangSelectTile: React.FC<LangSelectTileProps> = ({ iconSize = 24 }) => {

    const { t } = useTranslation();
    const userCtx = useUserContext();

    const selectLanguage = () => {
        userCtx.selectLanguage();
    }

    return (
        <div className="sec-tile-wrapper" onClick={() => selectLanguage()}>
            <div className="p-tile square-tile col-tile primary-color gap-3">
                <Ico.LANGUAGE size={iconSize} />
                <div>{t("lang.language")}</div>
            </div>
        </div>
    )

}

export default LangSelectTile;
