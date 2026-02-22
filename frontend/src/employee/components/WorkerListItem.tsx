import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { WorkerI } from "@shared/interfaces/WorkerProfileI"
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThumbUp, Visibility, Work } from "@mui/icons-material";
import ListItem from "global/components/ListItem";
import IconButton from "global/components/controls/IconButon";
import { FaPaperPlane, FaPhone } from "react-icons/fa";
import { ChatService } from "chat/services/ChatService";
import { toast } from "react-toastify";
import { useIsDesktop } from "global/hooks/isMobile";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { useAuthContext } from "auth/AuthProvider";

interface Props {
    profile: WorkerI,
    languagesDictionary: DictionaryI
    first?: boolean,
    last?: boolean,
}

const WorkerListItem: React.FC<Props> = ({ profile, languagesDictionary, first, last }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me } = useAuthContext();

    const isDesktop = useIsDesktop();
    const isMyProfile = me?.uid === profile.uid;

    const goToProfileView = () => {
        navigate(Path.getWorkerProfilePath(profile.displayName!));
    }

    const openChat = async () => {
        if (!profile) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(profile.uid)
            navigate(Path.getConversationPath(chat.chatId))
        } catch (error) {
            console.error('Failed to open chat:', error)
            toast.error(t('chat.error.cannotOpen'))
        }
    }

    const openPhoneCall = () => {
        if (!profile.phoneNumber) return;

        const number = `${profile.phoneNumber.prefix}${profile.phoneNumber.phoneNumber}`
        if (isDesktop) {
            // copy to clipboard
            navigator.clipboard.writeText(number);
            toast.info(t('employeeProfile.phoneNumberCopied', { number }));
            return;
        }
        window.location.href = `tel:${profile.phoneNumber.prefix}${profile.phoneNumber.phoneNumber}`;
    }

    const rightSection = isMyProfile ? null : <div className="flex justify-end items-center gap-2">
        <IconButton onClick={(e) => {
            e.stopPropagation();
            openPhoneCall();
        }}
            icon={<FaPhone size={20} />}
        ></IconButton>
        <IconButton onClick={(e) => {
            e.stopPropagation();
            openChat();
        }}
            icon={<FaPaperPlane size={20} />}
        ></IconButton>
    </div>

    const bottomLeft = <div className="flex items-center gap-3">
        <div>
            <Visibility fontSize="inherit" className="secondary-text mr-1" />
            <span className="small-font">{profile.views?.length || 0}</span>
        </div>
        <div>
            <ThumbUp fontSize="inherit" className="secondary-text mr-1" />
            <span className="small-font">{profile.likes?.length || 0}</span>
        </div>
        <div>
            <Work fontSize="inherit" className="secondary-text mr-1" />
            <span className="small-font">{profile.jobs?.length || 0}</span>
        </div>
    </div>

    return (
        <div onClick={goToProfileView}>
            <ListItem
                imgUrl={profile.avatarRef?.url || AVATAR_MOCK}
                topLeft={profile.displayName}
                bottomLeft={bottomLeft}
                first={first}
                last={last}
                rightSection={rightSection}
            ></ListItem>
        </div>

    )

}

export default WorkerListItem;