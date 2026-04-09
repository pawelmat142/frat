import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { WorkerI, WorkerWithMutualFriends } from "@shared/interfaces/WorkerI"
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThumbUp, Visibility } from "@mui/icons-material";
import ListItem from "global/components/ListItem";
import IconButton from "global/components/controls/IconButon";
import { ChatService } from "chat/services/ChatService";
import { toast } from "react-toastify";
import { useIsDesktop } from "global/hooks/isMobile";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { PositionUtil } from "@shared/utils/PositionUtil";

interface Props {
    worker: WorkerI,
    languagesDictionary: DictionaryI
    first?: boolean,
    last?: boolean,
    className?: string,
    disableDefaultBorder?: boolean
}

const   WorkerListItem: React.FC<Props> = ({ worker, languagesDictionary, first, last, className, disableDefaultBorder }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const { me } = userCtx

    const isDesktop = useIsDesktop();
    const isMyProfile = me?.uid === worker.uid;

    const goToProfileView = () => {
        navigate(Path.getWorkerProfilePath(worker.displayName!));
    }

    const getDistanceInfo = (): string => {
        if (!worker.point) {
            return '';
        }
        return userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(worker.point));
    }

    const distance = getDistanceInfo();

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

    const getMutualFriendsUids = (worker: WorkerI): string[] => {
        const w = worker as WorkerWithMutualFriends;
        return w.mutualFriendsUids || [];
    }
    const mutualFriendsUids = getMutualFriendsUids(worker);

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

    const bottomLeft = <div className="flex items-center gap-3">
        <div>
            <Visibility fontSize="inherit" className="secondary-text mr-1" />
            <span className="xs-font">{worker.views?.length || 0}</span>
        </div>
        <div>
            <ThumbUp fontSize="inherit" className="secondary-text mr-1" />
            <span className="xs-font">{worker.likes?.length || 0}</span>
        </div>

        {!!mutualFriendsUids.length && (
            <div className="flex items-center">
                <Ico.FRIENDS size={14} className="secondary-text mr-1" />
                <span className="xs-font">{mutualFriendsUids.length}</span>
            </div>
        )}

        {!!distance && (
            <div className="flex items-center">
                <Ico.MARKER size={14} className="secondary-text mr-1" />
                <span className="xs-font">{distance}</span>
            </div>
        )}
    </div>

    return (
        <div onClick={goToProfileView} className={className}>
            <ListItem
                imgUrl={worker.avatarRef?.url || AVATAR_MOCK}
                topLeft={worker.displayName}
                bottomLeft={bottomLeft}
                first={first}
                last={last}
                rightSection={rightSection}
                disableDefaultBorder={disableDefaultBorder}
            ></ListItem>
        </div>

    )

}

export default WorkerListItem;