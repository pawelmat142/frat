import { WorkerWithMutualFriends } from "@shared/interfaces/WorkerI"
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconButton from "global/components/controls/IconButon";
import { toast } from "react-toastify";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import WorkerListItem from "./WorkerListItem";

// TODO bug: dostepny od zaraz w list itemie pokazuje date ?dzis
interface Props {
    worker: WorkerWithMutualFriends,
    first?: boolean,
    last?: boolean,
    className?: string,
    disableDefaultBorder?: boolean,
    onSelect?: (worker: WorkerWithMutualFriends) => void,
    selected?: boolean,
}

const WorkerSearchListItem: React.FC<Props> = ({ worker, first, last, className, disableDefaultBorder, onSelect, selected }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const { me } = userCtx

    const isDesktop = useIsDesktop();
    const openChat = useOpenChat();
    const isMyProfile = me?.uid === worker.uid;
    const showDesktopProfileButton = isDesktop && !!onSelect;

    const openProfile = () => {
        navigate(Path.getWorkerProfilePath(worker.displayName!));
    };

    const openPhoneCall = () => {
        if (!worker.phoneNumber) return;

        const number = `${worker.phoneNumber.prefix}${worker.phoneNumber.number}`
        if (isDesktop) {
            // copy to clipboard
            navigator.clipboard.writeText(number);
            toast.info(t('employeeProfile.phoneNumberCopied', { number }));
            return;
        }
        window.location.href = `tel:${worker.phoneNumber.prefix}${worker.phoneNumber.number}`;
    }

    const rightSection = (showDesktopProfileButton || !isMyProfile) ? (
        <div className="flex justify-end items-center gap-2">
            {!isMyProfile && <>
                {!isDesktop && <IconButton onClick={(e) => {
                    e.stopPropagation();
                    openPhoneCall();
                }}
                    icon={<Ico.PHONE size={20} />}
                ></IconButton>}
                <IconButton onClick={(e) => {
                    e.stopPropagation();
                    openChat(worker?.uid);
                }}
                    icon={<Ico.MSG size={20} />}
                ></IconButton>
            </>}
            {showDesktopProfileButton && (
                <IconButton
                    icon={<Ico.CHEVRON_RIGHT size={20} />}
                    onClick={(event) => {
                        event.stopPropagation();
                        openProfile();
                    }}
                />
            )}
        </div>
    ) : null;

    return <WorkerListItem
        worker={worker}
        first={first}
        last={last}
        className={className}
        disableDefaultBorder={disableDefaultBorder}
        rightSection={rightSection}
        onClick={onSelect ? () => onSelect(worker) : undefined}
        selected={selected}
    ></WorkerListItem>

}

export default WorkerSearchListItem;