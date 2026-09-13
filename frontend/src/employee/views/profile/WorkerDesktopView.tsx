import React from "react";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { BtnModes } from "global/interface/controls.interface";
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
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuConfig } from "global/components/selector/MenuItems";
import { AppConfig } from "@shared/AppConfig";

interface Props {
    worker: WorkerI;
    menu: MenuConfig;
}

const WorkerDesktopView: React.FC<Props> = ({ worker, menu }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const fromSearchView = location.state?.fromSearchView === true;
    const menuItems = menu.items.filter(item => item.if === undefined || !!item.if);

    return (
        <div className="desktop-worker-profile">
            <header className="desktop-worker-profile-view-header">
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
                <h1 className="desktop-worker-profile-view-title">{t('employeeProfile.title')}</h1>
            </header>
            <div className="desktop-worker-profile-content">
                <main className="desktop-worker-profile-main">
                    <section className="desktop-worker-profile-header">
                        <div className="worker-avatar">
                            <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
                        </div>

                        <div className="worker-profile-top">
                            <div className="desktop-worker-profile-summary">
                                <div className="worker-profile-top-row one">
                                    <h1 className="desktop-worker-profile-name">{worker.displayName}</h1>
                                </div>
                                <div className="worker-profile-top-row two">
                                    <WorkerStatItems worker={worker} detailed />
                                </div>
                            </div>
                            {!!worker.categories?.length && (
                                <div className="worker-profile-top-row desktop-worker-profile-categories">
                                    <span className="desktop-worker-profile-categories-label">
                                        {t('employeeProfile.preferredCategories', 'Preferred categories')}
                                    </span>
                                    <CategoriesChips categories={worker.categories} color="primary" translationColumn="NAME"/>
                                </div>
                            )}
                        </div>
                    </section>

                    <WorkerBioSection worker={worker} />
                    <WorkerImagesSection worker={worker} />
                    <PositionWidget position={worker.geocodedPosition || null} />
                </main>

                <aside className="desktop-worker-profile-sidebar">
                    {menuItems.length > 0 && (
                        <section className="desktop-worker-profile-menu active-bg rounded-xl shadow-xl py-1 overflow-hidden select-none">
                            {menu.title && (
                                <div className="secondary-text px-4 pt-2 pb-1 text-xs font-medium">
                                    {menu.title}
                                </div>
                            )}
                            {menuItems.map((item, index) => (
                                <button
                                    key={`${item.label}-${index}`}
                                    type="button"
                                    className={`rounded ripple flex items-center gap-3 w-full px-4 text-sm text-left transition-colors hover-secondary-bg${item.className ? ` ${item.className}` : ""}`}
                                    style={{ height: AppConfig.CONTEXT_MENU.ITEM_HEIGHT }}
                                    onClick={() => item.onClick?.()}
                                >
                                    {item.icon && <item.icon size={15} className="flex-shrink-0" />}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </section>
                    )}
                    <WorkerDataSection worker={worker} />
                    <WorkerCertificatesSection worker={worker} />
                    <WorkerSkillsSection worker={worker} />
                </aside>
            </div>
        </div>
    );
};

export default WorkerDesktopView;