import Button from "global/components/controls/Button";
import { Ico } from "global/icon.def";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";

interface Props {
    title?: string,
    className?: string,
    link?: { title?: string, onClick: () => void }
    primaryBg?: boolean,
    children?: React.ReactNode,
}

const TileSection: React.FC<Props> = ({ title, children, className, link, primaryBg }) => {

    const { t } = useTranslation();

    const classs = `mx-3 my-4 pt-2 pb-2 ${primaryBg ? "primary-bg" : "secondary-bg"} rounded-xl ${className || ""}`;

    return (
        <div className={classs}>

            {!!title || !!link ? (
                <div className="flex items-center justify-between pb-2">

                    {title && (
                        <div className="px-5 secondary-text">{title}</div>
                    )}

                    {link && (
                        <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={link.onClick}>
                            {link.title || t("common.showMore")}
                            <Ico.CHEVRON_RIGHT />
                        </Button>
                    )}
                </div>) : null}

            {children}

        </div>
    )

}

export default TileSection;
