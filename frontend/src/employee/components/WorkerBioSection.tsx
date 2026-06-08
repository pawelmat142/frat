import React from "react";
import { useTranslation } from "react-i18next";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { useUserContext } from "user/UserProvider";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import FloatingTextarea from "global/components/controls/FloatingTextarea";
import SkeletonControl from "global/components/controls/SkeletonControl";
import { WorkerService } from "employee/services/WorkerService";
import TileSection from "./TileSection";

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

    const link = isMyProfile && !editMode ? { title: t('employeeProfile.editBio'), onClick: () => setEditMode(true) } : undefined;
    const title = editMode ? undefined : t('employeeProfile.form.bioLabel');

    if (loading) {
        return <SkeletonControl></SkeletonControl>
    }

    return <TileSection title={title} link={link} primaryBg={editMode}>

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
            <div className="view-margin pb-2 s-font font-light">{bio}</div>
        )}

    </TileSection>
};

export default WorkerBioSection;
