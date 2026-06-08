import React from "react";
import { useTranslation } from "react-i18next";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { BtnModes, BtnSizes, MenuItem } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import { useNavigate } from "react-router-dom";
import { Path } from "../../path";
import ChecklistUi from "global/components/ui/ChecklistUi";
import TileSection from "./TileSection";

interface Props {
    worker: WorkerI;
}

const WorkerSkillsSection: React.FC<Props> = ({ worker }) => {
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const navigate = useNavigate();

    const me = userCtx.me;
    const isMyProfile = me?.uid === worker.uid;

    if (!worker.skills?.items?.length && !isMyProfile) {
        return null;
    }

    const items: MenuItem[] = worker.skills?.items.map(skill => ({
        label: skill.name
    })) || [];

    return <TileSection
        link={isMyProfile ? { title: t('common.edit'), onClick: () => navigate(Path.WORKER_SKILLS_FORM) } : undefined}
        title={t('employeeProfile.skills')}>
        <ChecklistUi
            items={items}
            icon={Ico.CHECK}
            className="view-margin"
        ></ChecklistUi>
    </TileSection>
};

export default WorkerSkillsSection;
