import React from "react";
import { useTranslation } from "react-i18next";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import { useNavigate } from "react-router-dom";
import FloatingTextarea from "global/components/controls/FloatingTextarea";
import SkeletonControl from "global/components/controls/SkeletonControl";
import { WorkerService } from "employee/services/WorkerService";

interface Props {
    worker: WorkerI;
}

const WorkerBioSection: React.FC<Props> = ({ worker }) => {
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const me = userCtx.me;
    const isMyProfile = me?.uid === worker.uid;

    const [editMode, setEditMode] = React.useState(false);
    const [bio, setBio] = React.useState(worker.bio || '');
    const [loading, setLoading] = React.useState(false);

    if (!worker?.bio && !isMyProfile) {
        return null;
    }

    const onSubmit = async () => {
        try {
            setLoading(true);
            await WorkerService.updateBio(bio);
            await userCtx.initWorker();
        } finally {
            setEditMode(false);
            setLoading(false);
        }
    };

    if (loading) {
        return <SkeletonControl></SkeletonControl>
    }

    return <div className="mb-10 view-margin">

        {editMode ? (
            <div className="">
                <FloatingTextarea
                    label={t("employeeProfile.form.bioLabel")}
                    className="w-full"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                />

                <div className="flex gap-4 mt-3">
                    <Button mode={BtnModes.ERROR_TXT} fullWidth size={BtnSizes.SMALL} onClick={() => {
                        setEditMode(false)
                        setBio(worker.bio || '');
                    }}>
                        {t('common.cancel')}
                    </Button>

                    <Button mode={BtnModes.PRIMARY} fullWidth size={BtnSizes.SMALL} onClick={onSubmit}>
                        {t('common.save')}
                    </Button>
                </div>

            </div>
        ) : (
            <div>
                <div className="secondary-text mb-3">{t('employeeProfile.form.bioLabel')}</div>

                <div className="s-font font-light">{bio}</div>

                {isMyProfile && (
                    <Button mode={BtnModes.PRIMARY_TXT} className="ml-auto" size={BtnSizes.SMALL} onClick={() => setEditMode(true)}>
                        <Ico.EDIT className="w-4 h-4" />
                        {t('employeeProfile.editBio')}
                    </Button>)}
            </div>
        )}

    </div>
};

export default WorkerBioSection;
