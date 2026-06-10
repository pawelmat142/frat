import { WorkerI } from "@shared/interfaces/WorkerI";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import { Ico } from "global/icon.def";
import { Path } from "../../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import TileSection from "./TileSection";
import ChecklistUi from "global/components/ui/ChecklistUi";

interface Props {
    worker: WorkerI;
}

const WorkerCertificatesSection: React.FC<Props> = ({ worker }) => {

    const { t } = useTranslation();
    const userCtx = useUserContext();
    const navigate = useNavigate();

    const me = userCtx?.me;
    const isMyProfile = me?.uid === worker?.uid;

    if (!isMyProfile && !worker.certificates?.length) {
        return null;
    }

    return <>
        <TileSection title={t('employeeProfile.form.certificates.title')} link={isMyProfile ? { title: t('common.edit'), onClick: () => navigate(Path.WORKER_CERTIFICATES_EDIT) } : undefined}>
            <ChecklistUi icon={Ico.CHECK} className="pb-1"
                items={worker.certificates?.map(cert => ({ label: DictionaryDisplay({ dictionary: "CERTIFICATES", value: cert, t }) })) || []}
            ></ChecklistUi>
        </TileSection>
    </>
}

export default WorkerCertificatesSection;
