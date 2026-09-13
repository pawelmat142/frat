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

interface Props {
    worker: WorkerI;
}

const WorkerDesktopView: React.FC<Props> = ({ worker }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const fromSearchView = location.state?.fromSearchView === true;

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
                    <WorkerDataSection worker={worker} />
                    <WorkerCertificatesSection worker={worker} />
                    <WorkerSkillsSection worker={worker} />
                </aside>
            </div>
        </div>
    );
};

export default WorkerDesktopView;