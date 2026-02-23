import { ChatMemberWithUserI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { DateUtil } from "@shared/utils/DateUtil";
import { useAuthContext } from "auth/AuthProvider";
import ListItem from "global/components/ListItem";
import { useTranslation } from "react-i18next";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { FaCheck } from 'react-icons/fa';
import { FrontDateUtil } from "global/utils/FrontDateUtil";
import { Ico } from "global/icon.def";

interface Props {
    chat: ChatWithMembers;
    otherMember?: ChatMemberWithUserI;
    first?: boolean;
    last?: boolean;
}

const ChatListItem: React.FC<Props> = ({ chat, otherMember: otherMember, first, last }) => {

    const { t } = useTranslation();
    const { me } = useAuthContext();
    const date = new Date(chat.updatedAt || chat.createdAt)

    const topRight = <span className="small-font">{FrontDateUtil.displayShortDateOrDayOrTimeIfToday(t, date)}</span>

    const getReadStatusBadge = (): React.ReactNode => {
        const meAsMember = chat.members?.find(m => m.user?.uid === me?.uid);
        const everythingRead = !meAsMember?.unreadCount && !otherMember?.unreadCount;

        if (everythingRead) {
            return <Ico.CHECK className="primary-color" size={14} />
        }

        if (!!meAsMember?.unreadCount) {
            return <div className="unread-badge">{meAsMember?.unreadCount}</div>
        }
        return null;
    }

    const bottomLeft = <div className="small-font secondary-text mt-1">
        {chat.latestMessageContent || t('chat.joinedAt', {date: DateUtil.displayDate(otherMember?.joinedAt || chat.createdAt)})}
    </div>

    return (<ListItem
        imgUrl={otherMember?.user.avatarRef?.url || AVATAR_MOCK}
        topLeft={otherMember?.user.displayName || t('chat.unknownUser')}
        topRight={topRight}
        bottomLeft={bottomLeft}
        bottomRight={getReadStatusBadge()}
        first={first}
        last={last}
    ></ListItem>)
}

export default ChatListItem