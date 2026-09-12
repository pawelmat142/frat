import React from "react";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { MenuItem, BtnModes } from "global/interface/controls.interface";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import CategoriesChips from "global/components/chips/CategoriesChips";
import WorkerStatItems from "employee/components/WorkerStatItems";
import WorkerDataSection from "employee/components/WorkerDataSection";
import WorkerCertificatesSection from "employee/components/WorkerCertificatesSection";
import WorkerSkillsSection from "employee/components/WorkerSkillsSection";
import WorkerImagesSection from "employee/components/WorkerImagesSection";
import WorkerBioSection from "employee/components/WorkerBioSection";
import PositionWidget from "employee/components/PositionWidget";
import Button from "global/components/controls/Button";
import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
    worker: WorkerI;
    menuItems: MenuItem[];
}

const WorkerDesktopView: React.FC<Props> = ({ worker, menuItems }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const fromSearchView = location.state?.fromSearchView === true;
    const visibleMenuItems = menuItems.filter(item => item.if === undefined || !!item.if);

    const getActionMode = (item: MenuItem) => {
        if (item.icon === Ico.CHAT) return BtnModes.PRIMARY;
        if (item.icon === Ico.DELETE) return BtnModes.ERROR_TXT;
        return BtnModes.SECONDARY_TXT;
    };

    return (
        <div className="desktop-worker-profile">
            {fromSearchView && (
                <Button
                    mode={BtnModes.SECONDARY_TXT}
                    className="desktop-worker-profile-back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft size={14} />
                    {t('employeeProfile.backToSearch')}
                </Button>
            )}
            <section className="desktop-worker-profile-header">
                <div className="worker-avatar">
                    <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
                </div>

                <div className="worker-profile-top">
                    <p className="desktop-worker-profile-kicker">{t('employeeProfile.title')}</p>
                    <div className="worker-profile-top-row one">
                        <CategoriesChips categories={worker.categories} smaller color="primary" />
                    </div>
                    <div className="worker-profile-top-row two">
                        <h1 className="desktop-worker-profile-name">{worker.displayName}</h1>
                    </div>
                    <div className="worker-profile-top-row three">
                        <WorkerStatItems worker={worker} />
                    </div>
                </div>

                <nav className="desktop-worker-profile-actions" aria-label={t('employeeProfile.profileMenu')}>
                    {visibleMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={`${item.label}-${index}`}
                                mode={getActionMode(item)}
                                fullWidth
                                onClick={item.onClick}
                            >
                                {Icon && <Icon size={16} />}
                                {item.labelComponent || item.label}
                            </Button>
                        );
                    })}
                </nav>
            </section>

            <div className="desktop-worker-profile-content">
                <main className="desktop-worker-profile-main">
                    <WorkerBioSection worker={worker} />
                    <WorkerSkillsSection worker={worker} />
                    <WorkerImagesSection worker={worker} />
                </main>

                <aside className="desktop-worker-profile-sidebar">
                    <WorkerDataSection worker={worker} />
                    <WorkerCertificatesSection worker={worker} />
                    <PositionWidget position={worker.geocodedPosition || null} />
                </aside>
            </div>
        </div>
    );
};

export default WorkerDesktopView;