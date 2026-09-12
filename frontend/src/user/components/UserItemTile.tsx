import { UserI } from "@shared/interfaces/UserI";
import UserItemWithLoading from "./UserItemWithLoading";
import UserItem from "./UserItem";
import IconButton from "global/components/controls/IconButon";
import { BtnModes } from "global/interface/controls.interface";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { Ico } from "global/icon.def";

interface Props {
    uid?: string,
    user?: UserI,
    size?: number
    showNumber?: boolean
    showChat?: boolean
}

const UserItemTile: React.FC<Props> = ({ uid, user, size = 3.5, showNumber = false, showChat = false }) => {
    const openChat = useOpenChat();

    if (!uid && !user) return null;

    const komponent = uid
        ? <UserItemWithLoading uid={uid} size={size} showNumber={showNumber}></UserItemWithLoading>
        : <UserItem user={user!} size={size} showNumber={showNumber}></UserItem>

    return (
        <div className="user-item-tile">
            {komponent}
            {showChat && <div>
                <IconButton
                    onClick={() => openChat(uid || user!.uid)}
                    mode={BtnModes.PRIMARY_TXT}
                    icon={<Ico.MSG size={20} />}
                />

            </div>}
        </div>
    )
}

export default UserItemTile;