import React from "react";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import CategoriesChips from "global/components/chips/CategoriesChips";
import WorkerStatItems from "employee/components/WorkerStatItems";
import WorkerDataSection from "employee/components/WorkerDataSection";
import WorkerCertificatesSection from "employee/components/WorkerCertificatesSection";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Path } from "../../../path";
import { Ico } from "global/icon.def";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { useUserContext } from "user/UserProvider";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
    worker: WorkerI;
}

const DesktopWorkersSearchProfilePreview: React.FC<Props> = ({ worker }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const openChat = useOpenChat();
    const { me } = useUserContext();
    const isMyProfile = me?.uid === worker.uid;
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.aside
            className="workers-search-preview"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 32, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 0.7, 0.3, 1] }}
        >
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

            <WorkerDataSection worker={worker} desktopSearchPreviewMode />
            <WorkerCertificatesSection worker={worker} />
        </motion.aside>
    );
};

export default DesktopWorkersSearchProfilePreview;