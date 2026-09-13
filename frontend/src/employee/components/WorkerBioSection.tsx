import React from "react";
import { useTranslation } from "react-i18next";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { useUserContext } from "user/UserProvider";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import FloatingTextarea from "global/components/controls/FloatingTextarea";
import SkeletonControl from "global/components/controls/SkeletonControl";
import { WorkerService } from "employee/services/WorkerService";
import TileSection from "global/components/tiles/TileSection";
import { useGlobalContext } from "global/providers/GlobalProvider";

interface Props {
    worker: WorkerI;
}

const WorkerBioSection: React.FC<Props> = ({ worker }) => {
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

    const isDesktop = globalCtx.isDesktop;
    const me = userCtx.me;
    const isMyProfile = me?.uid === worker.uid;

    const [editMode, setEditMode] = React.useState(false);
    const [bio, setBio] = React.useState(worker.bio || '');
    const [loading, setLoading] = React.useState(false);
    const bioExists = !!bio.trim();

    if (!bioExists && !isMyProfile) {
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

    const link = isMyProfile && !editMode ? {
        title: t(bioExists ? 'employeeProfile.editBio' : 'employeeProfile.addBio'),
        onClick: () => setEditMode(true),
        mode: bioExists ? BtnModes.TERTIARY_TXT : BtnModes.PRIMARY_TXT,
    } : undefined;
    const title = editMode ? undefined : t('employeeProfile.form.bioLabel');

    if (loading) {
        return <SkeletonControl></SkeletonControl>
    }

    return <TileSection title={title} link={link} primaryBg={editMode || isDesktop}>

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
            <div className="view-margin pb-2 s-font font-light whitespace-pre-wrap">{bio}</div>
        )}

    </TileSection>
};

export default WorkerBioSection;
