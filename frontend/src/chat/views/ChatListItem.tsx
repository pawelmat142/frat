import { ChatMemberWithUserI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { UserI } from "@shared/interfaces/UserI";
import { DateUtil } from "@shared/utils/DateUtil";
import { useAuthContext } from "auth/AuthProvider";
import ListItem from "global/components/ListItem";
import { Utils } from "global/utils/utils";
import { useTranslation } from "react-i18next";
import { AVATAR_MOCK } from "user/components/AvatarTile";

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
    // TODO dodaj znaczek ze przeczytane/dostarczone
    const topRight = <div className="small-font">{Utils.prepareDisplayShortDate(t, date)}</div>

    const meAsMember = chat.members?.find(m => m.user?.uid === me?.uid);
    const unreadBadge = !!meAsMember?.unreadCount ? <div className="unread-badge">{meAsMember?.unreadCount}</div> : null;

    return (<ListItem
        imgUrl={otherMember?.user.avatarRef?.url || AVATAR_MOCK}
        topLeft={otherMember?.user.displayName || t('chat.unknownUser')}
        topRight={topRight}
        bottomLeft={chat.latestMessageContent || t('chat.joinedAt', { 
            date: DateUtil.displayDate(otherMember?.joinedAt || chat.createdAt) })}
        bottomRight={unreadBadge}
        first={first}
        last={last}
    ></ListItem>)
}

export default ChatListItem