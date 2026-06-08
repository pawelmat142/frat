import { WorkerAvailabilityOptions, WorkerFormRangesOptions, WorkerI } from "@shared/interfaces/WorkerI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { PositionUtil } from "@shared/utils/PositionUtil";
import CallendarsView from "global/components/callendar/CallendarsView";
import PseudoView from "global/components/PseudoView";
import DateDisplay from "global/components/ui/DateDisplay";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import ListUi from "global/components/ui/ListUi";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { MenuItem } from "global/interface/controls.interface";
import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { Path } from "../../path";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";
import { useFloatingBtnContext } from "global/fab/FloatingBtnProvider";
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
            <ChecklistUi icon={Ico.CHECK}
                items={worker.certificates?.map(cert => ({ label: DictionaryDisplay({ dictionary: "CERTIFICATES", value: cert, t }) })) || []}
            ></ChecklistUi>
        </TileSection>
    </>
}

export default WorkerCertificatesSection;
