import { WorkerI } from "@shared/interfaces/WorkerI";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import { Ico } from "global/icon.def";
import { Path } from "../../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import TileSection from "global/components/tiles/TileSection";
import ChecklistUi from "global/components/ui/ChecklistUi";
import { BtnModes } from "global/interface/controls.interface";

interface Props {
    worker: WorkerI;
}

const WorkerCertificatesSection: React.FC<Props> = ({ worker }) => {

    const { t } = useTranslation();
    const userCtx = useUserContext();
    const navigate = useNavigate();

    const me = userCtx?.me;
    const isMyProfile = me?.uid === worker?.uid;
    const hasCertificates = !!worker.certificates?.length;

    if (!isMyProfile && !hasCertificates) {
        return null;
    }

    return <TileSection
        link={isMyProfile ? {
            title: t(hasCertificates ? 'common.edit' : 'common.add'),
            onClick: () => navigate(Path.WORKER_CERTIFICATES_EDIT),
            mode: hasCertificates ? BtnModes.TERTIARY_TXT : BtnModes.PRIMARY_TXT,
        } : undefined}
        title={t('employeeProfile.form.certificates.title')}
    >
        <ChecklistUi
            icon={Ico.CHECK}
            className="view-margin"
            items={worker.certificates?.map(cert => ({ label: DictionaryDisplay({ dictionary: "CERTIFICATES", value: cert, t }) })) || []}
        />
    </TileSection>
}

export default WorkerCertificatesSection;
