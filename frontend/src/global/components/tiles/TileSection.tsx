import Button from "global/components/controls/Button";
import { Ico } from "global/icon.def";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";

export interface TileSectionProps {
    title?: string;
    className?: string;
    link?: { title?: string; onClick: () => void };
    primaryBg?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
}

const TileSection: React.FC<TileSectionProps> = ({ title, children, className, link, primaryBg, onClick }) => {
    const { t } = useTranslation();
    const classes = `mx-3 my-4 pt-2 pb-2 ${primaryBg ? "primary-bg" : "secondary-bg"} rounded-xl${onClick ? " tile-section--clickable ripple" : ""} ${className || ""}`;

    return (
        <div
            className={classes}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            {!!title || !!link ? (
                <div className="flex items-center justify-between pb-2">
                    {title && <div className="px-5 secondary-text">{title}</div>}
                    {link && (
                        <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={link.onClick}>
                            {link.title || t("common.showMore")}
                            <Ico.CHEVRON_RIGHT />
                        </Button>
                    )}
                </div>
            ) : null}
            {children}
        </div>
    );
};

export default TileSection;