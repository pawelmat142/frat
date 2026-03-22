import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { WorkerWithMutualFriends } from "@shared/interfaces/WorkerI"
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
import { AppConfig } from "@shared/AppConfig";

interface Props {
    worker: WorkerWithMutualFriends,
    languagesDictionary: DictionaryI
    first?: boolean,
    last?: boolean,
}

const MINIMUM_DISTANCE_FOR_DISPLAY_METERS = AppConfig.MINIMUM_DISTANCE_FOR_DISPLAY_METERS; 

const WorkerListItem: React.FC<Props> = ({ worker, languagesDictionary, first, last }) => {

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

        {!!worker.mutualFriendsUids?.length && (
            <div className="flex items-center">
                <Ico.FRIENDS size={14} className="secondary-text mr-1" />
                <span className="xs-font">{worker.mutualFriendsUids.length}</span>
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
        <div onClick={goToProfileView}>
            <ListItem
                imgUrl={worker.avatarRef?.url || AVATAR_MOCK}
                topLeft={worker.displayName}
                bottomLeft={bottomLeft}
                first={first}
                last={last}
                rightSection={rightSection}
            ></ListItem>
        </div>

    )

}

export default WorkerListItem;