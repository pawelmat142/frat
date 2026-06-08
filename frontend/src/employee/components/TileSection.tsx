import Button from "global/components/controls/Button";
import { Ico } from "global/icon.def";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";

interface Props {
    title?: string,
    className?: string,
    link?: { title?: string, onClick: () => void }
    children?: React.ReactNode,
}

const TileSection: React.FC<Props> = ({ title, children, className, link }) => {

    const { t } = useTranslation();

    const classs = `mx-3 my-4 py-2 secondary-bg rounded-xl ${className || ""}`;

    return (
        <div className={classs}>

            <div className="flex items-center justify-between">

                {title && (
                    <div className="px-5 pb-2 secondary-text">{title}</div>
                )}

                {link && (
                    <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={link.onClick}>
                        {link.title || t("common.showMore")}
                        <Ico.CHEVRON_RIGHT />
                    </Button>
                )}
            </div>

            {children}

        </div>
    )

}

export default TileSection;
