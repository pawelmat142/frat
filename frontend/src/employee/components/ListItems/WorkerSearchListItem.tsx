import { WorkerI } from "@shared/interfaces/WorkerI"
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconButton from "global/components/controls/IconButon";
import { ChatService } from "chat/services/ChatService";
import { toast } from "react-toastify";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import WorkerListItem from "./WorkerListItem";

interface Props {
    worker: WorkerI,
    first?: boolean,
    last?: boolean,
    className?: string,
    disableDefaultBorder?: boolean
}

const WorkerSearchListItem: React.FC<Props> = ({ worker, first, last, className, disableDefaultBorder }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const { me } = userCtx

    const isDesktop = useIsDesktop();
    const isMyProfile = me?.uid === worker.uid;

    const openChat = async () => {
        if (!worker) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(worker.uid)
            navigate(Path.getConversationPath(chat.chatId))
        } catch (error) {
            console.error('Failed to open chat:', error)
            toast.error(t('chat.error.cannotOpen'))
        }
    }

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

    const rightSection = isMyProfile ? null : <div className="flex justify-end items-center gap-2">
        <IconButton onClick={(e) => {
            e.stopPropagation();
            openPhoneCall();
        }}
            icon={<Ico.PHONE size={20} />}
        ></IconButton>
        <IconButton onClick={(e) => {
            e.stopPropagation();
            openChat();
        }}
            icon={<Ico.MSG size={20} />}
        ></IconButton>
    </div>

    return <WorkerListItem
        worker={worker}
        first={first}
        last={last}
        className={className}
        disableDefaultBorder={disableDefaultBorder}
        rightSection={rightSection}
    ></WorkerListItem>

}

export default WorkerSearchListItem;