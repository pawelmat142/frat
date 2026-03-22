import React from "react";
import { useTranslation } from "react-i18next";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import { useNavigate } from "react-router-dom";
import { Path } from "../../path";
import Loading from "global/components/Loading";

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

    return (
        <div className="mb-10 px-5">
            <div className="secondary-text">{t('employeeProfile.skills')}</div>


            {worker.skills?.items.map((skill, index) => (
                <div className="pl-5 pt-2 flex items-center gap-2" key={index}>
                    <Ico.CHECK className="secondary-text" />
                    <span>{skill.name}</span>
                </div>
            ))}
            <Button mode={BtnModes.PRIMARY_TXT} className="ml-auto mt-5" size={BtnSizes.SMALL} onClick={() => navigate(Path.WORKER_SKILLS_FORM)}>
                <Ico.EDIT className="w-4 h-4" />
                {t('employeeProfile.editSkills')}
            </Button>
        </div>
    );
};

export default WorkerSkillsSection;
