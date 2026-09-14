import React, { useState } from "react";
import { ChatMemberWithUserI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { Ico } from "global/icon.def";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useChatMenu } from "./conversation/hooks/useChatMenu";

interface Props {
    chat: ChatWithMembers;
    otherMember: ChatMemberWithUserI;
}

const DesktopChatListItemMenu: React.FC<Props> = ({ chat, otherMember }) => {
    const [loading, setLoading] = useState(false);
    const { openContextMenu } = useGlobalContext();
    const chatMenu = useChatMenu({
        chat,
        otherUser: otherMember.user,
        messageCount: chat.latestMessageContent ? 1 : 0,
        setLoading,
    });

    if (!chatMenu.length) return null;

    return (
        <Button
            mode={BtnModes.SECONDARY_TXT}
            className="desktop-chat-list-menu"
            disabled={loading}
            onClick={event => {
                event?.stopPropagation();
                const rect = event?.currentTarget.getBoundingClientRect();
                if (!rect) return;
                openContextMenu({ x: rect.right, y: rect.bottom }, [{ items: chatMenu }]);
            }}
        >
            <Ico.MENU />
        </Button>
    );
};

export default DesktopChatListItemMenu;