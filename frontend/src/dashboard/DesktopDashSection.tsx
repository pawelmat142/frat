import Button from "global/components/controls/Button";
import { Ico } from "global/icon.def";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";
import TileSection from "employee/components/TileSection";
import { useGlobalContext } from "global/providers/GlobalProvider";

interface Props {
    title: string;
    link?: { title?: string; onClick: () => void };
    empty?: { text: string; actionTitle?: string; onClick?: () => void };
    onClick?: () => void;
    children?: React.ReactNode;
}

const DesktopDashSection: React.FC<Props> = ({ title, link, empty, onClick, children }) => {
    const { t } = useTranslation();
    const { isDesktop } = useGlobalContext();

    if (!isDesktop) {
        return (
            <TileSection title={title} link={link} onClick={onClick}>
                {empty ? (
                    <div className="px-5 pb-3">
                        <p className="secondary-text s-font">{empty.text}</p>
                        {empty.actionTitle && empty.onClick && (
                            <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={empty.onClick}>
                                {empty.actionTitle}
                                <Ico.CHEVRON_RIGHT />
                            </Button>
                        )}
                    </div>
                ) : children}
            </TileSection>
        );
    }

    return (
        <section
            className={`desktop-dash-section${onClick ? " desktop-dash-section--clickable ripple" : ""}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            <div className="desktop-dash-section-header">
                <h2 className="desktop-dash-section-title">{title}</h2>
                {link && (
                    <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={link.onClick}>
                        {link.title || t("common.showMore")}
                        <Ico.CHEVRON_RIGHT />
                    </Button>
                )}
            </div>
            {empty ? (
                <div className="desktop-dash-empty">
                    <p className="secondary-text s-font">{empty.text}</p>
                    {empty.actionTitle && empty.onClick && (
                        <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={empty.onClick}>
                            {empty.actionTitle}
                            <Ico.CHEVRON_RIGHT />
                        </Button>
                    )}
                </div>
            ) : children}
        </section>
    );
};

export default DesktopDashSection;
