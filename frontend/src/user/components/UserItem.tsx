import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import AvatarTile, { AVATAR_MOCK } from "./AvatarTile";
import { Path } from "../../path";
import ListItemImg from "global/components/ListItemImg";
import { UserUtil } from "@shared/utils/UserUtil";
import { AppConfig } from "@shared/AppConfig";
import {useUserContext} from "../UserProvider";

interface Props {
    user: UserI
    size?: number //rem
    showNumber?: boolean
    allowNavigate?: boolean
    bottomRow?: React.ReactNode,
    editableAvatar?: boolean
}

const UserItem: React.FC<Props> = ({ user, size = AppConfig.DEFAULT_AVATAR_SIZE, showNumber = false, allowNavigate = true, bottomRow, editableAvatar=false }) => {

    const navigate = useNavigate();

    return (
        <span className={`flex gap-3 items-center w-full ${allowNavigate ? 'ripple' : ''}`} onClick={() => {
            if (!allowNavigate) return;
            navigate(Path.getProfilePath(user?.uid))
        }}>
            <AvatarTile
                uid={user.uid}
                size={size}
                editable={editableAvatar}
                src={user.avatarRef?.url}
                circle
            ></AvatarTile>

            <div>
                <div className="font-medium">{user?.displayName}</div>
                {bottomRow ? (
                    bottomRow
                ) : (
                    showNumber && !!user && <div className="xs-font secondary-text">{UserUtil.getContactInfoLine(user)}</div>
                )}
            </div>
        </span>
    )
}

export default UserItem;