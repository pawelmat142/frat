import React from "react";
import { WorkerI } from "@shared/interfaces/WorkerI";
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
import { BtnModes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Path } from "../../../path";
import { Ico } from "global/icon.def";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { useUserContext } from "user/UserProvider";

interface Props {
    worker: WorkerI;
}

const WorkersSearchPreview: React.FC<Props> = ({ worker }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const openChat = useOpenChat();
    const { me } = useUserContext();
    const isMyProfile = me?.uid === worker.uid;

    return (
        <aside className="workers-search-preview">
            <div className="workers-search-preview-header">
                <div className="worker-avatar">
                    <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
                </div>
                <div className="worker-profile-top">
                    <div className="worker-profile-top-row one">
                        <CategoriesChips categories={worker.categories} smaller color="primary" />
                    </div>
                    <div className="worker-profile-top-row two">
                        <div className="l-font font-semibold">{worker.displayName}</div>
                    </div>
                    <div className="worker-profile-top-row three">
                        <WorkerStatItems worker={worker} />
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                    {!isMyProfile && (
                        <Button
                            mode={BtnModes.PRIMARY_TXT}
                            onClick={() => openChat(worker?.uid)}
                        >
                            <span className="flex items-center gap-2">
                                <Ico.MSG size={16} />
                                {t('chat.openChat')}
                            </span>
                        </Button>
                    )}
                    <Button
                        mode={BtnModes.PRIMARY}
                        onClick={() => navigate(Path.getWorkerProfilePath(worker.displayName))}
                    >
                        <span className="flex items-center gap-2">
                            {t('employeeProfile.openProfile')}
                            <Ico.CHEVRON_RIGHT size={16} />
                        </span>
                    </Button>
                </div>
            </div>

            <WorkerDataSection worker={worker} />
            <WorkerCertificatesSection worker={worker} />
            <WorkerSkillsSection worker={worker} />
            <WorkerImagesSection worker={worker} />
            <WorkerBioSection worker={worker} />
            <div className="view-margin mb-10">
                <PositionWidget position={worker.geocodedPosition || null} />
            </div>
        </aside>
    );
};

export default WorkersSearchPreview;